import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.utils import shuffle
import base64
from io import BytesIO
class Classification():
    def initialize_weights(self, input_size, hidden_sizes, output_size):
        weights, biases, momentums_w, momentums_b, velocities_w, velocities_b = [], [], [], [], [], []

        # Initializing for input to first hidden layer
        weights.append(np.random.randn(input_size, hidden_sizes[0]) * 0.01)
        biases.append(np.zeros((1, hidden_sizes[0])))
        momentums_w.append(np.zeros_like(weights[-1]))
        momentums_b.append(np.zeros_like(biases[-1]))
        velocities_w.append(np.zeros_like(weights[-1]))
        velocities_b.append(np.zeros_like(biases[-1]))

        # Initializing for hidden layers
        for i in range(1, len(hidden_sizes)):
            weights.append(np.random.randn(hidden_sizes[i - 1], hidden_sizes[i]) * 0.01)
            biases.append(np.zeros((1, hidden_sizes[i])))
            momentums_w.append(np.zeros_like(weights[-1]))
            momentums_b.append(np.zeros_like(biases[-1]))
            velocities_w.append(np.zeros_like(weights[-1]))
            velocities_b.append(np.zeros_like(biases[-1]))

        # Initializing for last hidden layer to output layer
        weights.append(np.random.randn(hidden_sizes[-1], output_size) * 0.01)
        biases.append(np.zeros((1, output_size)))
        momentums_w.append(np.zeros_like(weights[-1]))
        momentums_b.append(np.zeros_like(biases[-1]))
        velocities_w.append(np.zeros_like(weights[-1]))
        velocities_b.append(np.zeros_like(biases[-1]))

        return weights, biases, momentums_w, momentums_b, velocities_w, velocities_b

    def relu(self, x):
        return np.maximum(0, x)
    def sigmoid(self,x):
        return 1 / (1 + np.exp(-x))

    def softmax(self, x):
        exp_x = np.exp(x - np.max(x, axis=1, keepdims=True))
        return exp_x / np.sum(exp_x, axis=1, keepdims=True)

    def relu_derivative(self, x):
        return (x > 0).astype(float)

    def categorical_cross_entropy_loss(self, y_true, y_pred):
        y_pred = np.clip(y_pred, 1e-15, 1 - 1e-15)
        return -np.mean(np.sum(y_true * np.log(y_pred), axis=1))

    def train_mlp_adam(self, X, y, X_val, y_val, hidden_sizes=[128, 64, 32], lr=0.001, epochs=4000, beta1=0.9, beta2=0.999, epsilon=1e-8):
        loss_history, val_loss_history = [], []
        input_size = X.shape[1]
        unique_classes = np.unique(y)
        output_size = len(unique_classes)
        
        # Encode class labels into integers
        class_mapping = {cls: i for i, cls in enumerate(unique_classes)}
        y_encoded = np.array([class_mapping[cls] for cls in y])
        
        y_one_hot = np.eye(output_size)[y_encoded]

        weights, biases, momentums_w, momentums_b, velocities_w, velocities_b = self.initialize_weights(input_size, hidden_sizes, output_size)

        best_loss = float('inf')
        best_weights, best_biases = weights[:], biases[:]

        for epoch in range(epochs):
            activations = [X]
            for i in range(len(hidden_sizes)):
                Z = np.dot(activations[-1], weights[i]) + biases[i]
                A = self.relu(Z)
                activations.append(A)

            Z_output = np.dot(activations[-1], weights[-1]) + biases[-1]
            A_output = self.softmax(Z_output)

            loss = self.categorical_cross_entropy_loss(y_one_hot, A_output)
            y_val_encoded = np.eye(output_size)[np.array([class_mapping[cls] for cls in y_val])]
            val_loss = self.categorical_cross_entropy_loss(y_val_encoded, self.predict_proba(X_val, weights, biases))


            val_loss_history.append(val_loss)
            loss_history.append(loss)

            # Backpropagation
            dZ = A_output - y_one_hot
            d_weights = [np.dot(activations[-1].T, dZ) / X.shape[0]]
            d_biases = [np.sum(dZ, axis=0, keepdims=True) / X.shape[0]]

            for i in range(len(hidden_sizes) - 1, -1, -1):
                dA = np.dot(dZ, weights[i + 1].T)
                dZ = dA * self.relu_derivative(activations[i + 1])
                d_weights.insert(0, np.dot(activations[i].T, dZ) / X.shape[0])
                d_biases.insert(0, np.sum(dZ, axis=0, keepdims=True) / X.shape[0])

            for i in range(len(weights)):
                momentums_w[i] = beta1 * momentums_w[i] + (1 - beta1) * d_weights[i]
                momentums_b[i] = beta1 * momentums_b[i] + (1 - beta1) * d_biases[i]
                velocities_w[i] = beta2 * velocities_w[i] + (1 - beta2) * (d_weights[i] ** 2)
                velocities_b[i] = beta2 * velocities_b[i] + (1 - beta2) * (d_biases[i] ** 2)

                momentums_w_corrected = momentums_w[i] / (1 - beta1 ** (epoch + 1))
                momentums_b_corrected = momentums_b[i] / (1 - beta1 ** (epoch + 1))
                velocities_w_corrected = velocities_w[i] / (1 - beta2 ** (epoch + 1))
                velocities_b_corrected = velocities_b[i] / (1 - beta2 ** (epoch + 1))

                weights[i] -= lr * momentums_w_corrected / (np.sqrt(velocities_w_corrected) + epsilon)
                biases[i] -= lr * momentums_b_corrected / (np.sqrt(velocities_b_corrected) + epsilon)

            if loss < best_loss:
                best_loss = loss
                best_weights = [w.copy() for w in weights]
                best_biases = [b.copy() for b in biases]


            if epoch % 500 == 0:
                print(f"Epoch {epoch}, Loss: {loss:.4f}")

        return best_weights, best_biases, loss_history, val_loss_history, class_mapping

    def predict(self, X, y, weights, biases):
        activations = [X]
        for i in range(len(weights) - 1):
            Z = np.dot(activations[-1], weights[i]) + biases[i]
            A = self.relu(Z)
            activations.append(A)

        Z_output = np.dot(activations[-1], weights[-1]) + biases[-1]
        A_output = self.softmax(Z_output)
        return np.argmax(A_output, axis=1)
    def predict_proba(self, X, weights, biases):
        activations = [X]
        for i in range(len(weights) - 1):
            Z = np.dot(activations[-1], weights[i]) + biases[i]
            A = self.relu(Z)
            activations.append(A)
        Z_output = np.dot(activations[-1], weights[-1]) + biases[-1]
        return self.softmax(Z_output)


    def visualize_results(self, X, y, weights, biases, title):
        """
        Çok boyutlu verileri görselleştirir ve karar sınırlarını gösterir.

        Parametreler:
        - X: Giriş verileri (numpy array).
        - y: Hedef etiketler (numpy array).
        - weights: Modelin ağırlıkları.
        - biases: Modelin bias'ları.
        - title: Grafiğin başlığı.

        Dönüş:
        - Görselleştirmenin base64 kodlanmış PNG görüntüsü, hata durumunda None.
        """
        try:
            pca = PCA(n_components=2)
            X_pca = pca.fit_transform(X)

            x_min, x_max = X_pca[:, 0].min() - 1, X_pca[:, 0].max() + 1
            y_min, y_max = X_pca[:, 1].min() - 1, X_pca[:, 1].max() + 1
            xx, yy = np.meshgrid(np.arange(x_min, x_max, 0.1), np.arange(y_min, y_max, 0.1))
            grid = np.c_[xx.ravel(), yy.ravel()]

            # PCA'dan ters dönüşüm yapmadan doğrudan 2D grid üzerinde tahmin yap
            Z = self.predict(pca.inverse_transform(grid), y, weights, biases)
            Z = Z.reshape(xx.shape)

            plt.figure(figsize=(10, 6))
            plt.contourf(xx, yy, Z, alpha=0.3, cmap='rainbow')

            # Veri noktalarını PCA'dan dönüştürülmüş 2D uzayda göster
            plt.scatter(X_pca[:, 0], X_pca[:, 1], c=y, cmap='rainbow', edgecolors='k')

            plt.title(title)
            plt.xlabel('PCA Dimension 1')
            plt.ylabel('PCA Dimension 2')
            plt.colorbar()

            buf = BytesIO()
            plt.savefig(buf, format='png')
            buf.seek(0)
            image_base64 = base64.b64encode(buf.getvalue()).decode('utf-8')
            plt.close()

            return image_base64

        except Exception as e:
            print(f"Görselleştirme sırasında hata: {e}")
            return None


    def loss_graph(self, loss_history, title):
        plt.figure(figsize=(6, 4))
        plt.plot(loss_history, label='Loss', color='blue')
        plt.xlabel('Epoch')
        plt.ylabel('Loss')
        plt.title(title)
        plt.legend()
        
        buf = BytesIO()
        plt.savefig(buf, format='png')
        buf.seek(0)
        image_base64 = base64.b64encode(buf.getvalue()).decode('utf-8')
        plt.close()
        
        return image_base64

    def vai_code(self, df):
        categorical_cols = df.select_dtypes(include=['object']).columns
        for col in categorical_cols:
            df[col] = df[col].astype('category').cat.codes
        return df

    def accuracy(self, y_true, y_pred):

        return np.mean(y_true == y_pred)

    def map_predictions(self,predictions, class_mapping):
        reversed_mapping = {v: k for k, v in class_mapping.items()}
        return np.array([reversed_mapping[pred] for pred in predictions])


    def fit(self, df, target, layer_sizes):
        df = shuffle(df)
        try:
            df = self.vai_code(df)
            X = df.drop(target, axis=1).values
            y = df[target].values

            scaler = StandardScaler()
            X = scaler.fit_transform(X)



            X_train, X_temp, y_train, y_temp = train_test_split(X, y, test_size=0.3, random_state=42)
            X_test, X_val, y_test, y_val = train_test_split(X_temp, y_temp, test_size=0.5, random_state=42)

            weights, biases, loss_history,val_loss_history,class_mapping = self.train_mlp_adam(X_train, y_train,X_val, y_val, hidden_sizes=layer_sizes)
            predictions = self.predict(X_test,y, weights, biases)
            test_score = self.accuracy(y_test, self.map_predictions(predictions,class_mapping))
            graphs = {
                'train_graph': self.visualize_results(X_train, y_train,weights,biases, 'Eğitim Seti Karar Çizgisi'),
                'test_graph': self.visualize_results(X_test, y_test,weights,biases, 'Test Seti Karar Çizgisi'),
                'loss_graph': self.loss_graph(loss_history, "Training Loss"),
                'val_loss_graph': self.loss_graph(val_loss_history, "Validation Loss")}
            return {"weights": weights, "bias":biases, "graphs": graphs, "test_score": test_score}
        except RuntimeError as e:
            return

    