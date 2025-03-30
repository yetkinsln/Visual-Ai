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
    def initialize_weights(self,input_size, hidden_sizes, output_size):
        weights = []
        biases = []
        momentums_w = []
        momentums_b = []
        velocities_w = []
        velocities_b = []

        weights.append(np.random.randn(input_size, hidden_sizes[0]) * 0.01)
        biases.append(np.zeros((1, hidden_sizes[0])))
        momentums_w.append(np.zeros_like(weights[-1]))
        momentums_b.append(np.zeros_like(biases[-1]))
        velocities_w.append(np.zeros_like(weights[-1]))
        velocities_b.append(np.zeros_like(biases[-1]))

        for i in range(1, len(hidden_sizes)):
            weights.append(np.random.randn(hidden_sizes[i - 1], hidden_sizes[i]) * 0.01)
            biases.append(np.zeros((1, hidden_sizes[i])))
            momentums_w.append(np.zeros_like(weights[-1]))
            momentums_b.append(np.zeros_like(biases[-1]))
            velocities_w.append(np.zeros_like(weights[-1]))
            velocities_b.append(np.zeros_like(biases[-1]))

        weights.append(np.random.randn(hidden_sizes[-1], output_size) * 0.01)
        biases.append(np.zeros((1, output_size)))
        momentums_w.append(np.zeros_like(weights[-1]))
        momentums_b.append(np.zeros_like(biases[-1]))
        velocities_w.append(np.zeros_like(weights[-1]))
        velocities_b.append(np.zeros_like(biases[-1]))

        return weights, biases, momentums_w, momentums_b, velocities_w, velocities_b

    def relu(self,x):
        return np.maximum(0, x)

    def relu_derivative(self,x):
        return (x > 0).astype(float)

    def sigmoid(self,x):
        return 1 / (1 + np.exp(-x))

    def sigmoid_derivative(self,x):
        return self.sigmoid(x) * (1 - self.sigmoid(x))

    def binary_cross_entropy_loss(self,y_true, y_pred):
        y_pred = np.clip(y_pred, 1e-15, 1 - 1e-15)
        return -np.mean(y_true * np.log(y_pred) + (1 - y_true) * np.log(1 - y_pred))

    def train_mlp_adam(self,X, y,X_val, y_val, hidden_sizes=[128, 64, 32], lr=0.001, epochs=4000, beta1=0.9, beta2=0.999, epsilon=1e-8):
        loss_history = []
        val_loss_history = []
        input_size = X.shape[1]
        output_size = 1 if len(np.unique(y)) == 2 else len(np.unique(y))
        y_one_hot = y.reshape(-1, 1) if output_size == 1 else np.eye(output_size)[y]

        weights, biases, momentums_w, momentums_b, velocities_w, velocities_b = self.initialize_weights(input_size, hidden_sizes, output_size)

        best_loss = float('inf')
        best_weights = weights[:]
        best_biases = biases[:]

        for epoch in range(epochs):
            activations = [X]
            for i in range(len(hidden_sizes)):
                Z = np.dot(activations[-1], weights[i]) + biases[i]
                A = self.relu(Z)
                activations.append(A)

            Z_output = np.dot(activations[-1], weights[-1]) + biases[-1]
            A_output = self.sigmoid(Z_output) if output_size == 1 else np.exp(Z_output) / np.sum(np.exp(Z_output), axis=1, keepdims=True)

            loss = self.binary_cross_entropy_loss(y_one_hot, A_output) if output_size == 1 else -np.mean(y_one_hot * np.log(A_output + 1e-8))
            val_loss =1- np.mean(np.abs(y_val - self.predict(X_val,y,weights,biases)))
            val_loss_history.append(val_loss)
            loss_history.append(loss)
            dZ = A_output - y_one_hot
            dW = np.dot(activations[-1].T, dZ) / X.shape[0]
            db = np.sum(dZ, axis=0, keepdims=True) / X.shape[0]

            d_weights = [dW]
            d_biases = [db]

            for i in range(len(hidden_sizes) - 1, -1, -1):
                dA = np.dot(dZ, weights[i + 1].T)
                dZ = dA * self.relu_derivative(activations[i + 1])
                dW = np.dot(activations[i].T, dZ) / X.shape[0]
                db = np.sum(dZ, axis=0, keepdims=True) / X.shape[0]
                d_weights.insert(0, dW)
                d_biases.insert(0, db)

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
                best_weights = weights[:]
                best_biases = biases[:]

            if epoch % 500 == 0:
                print(f"Epoch {epoch}, Loss: {loss:.4f}")

        return best_weights, best_biases, loss_history, val_loss_history

    def predict(self,X,y, weights, biases):
        activations = [X]
        for i in range(len(weights) - 1):
            Z = np.dot(activations[-1], weights[i]) + biases[i]
            A = self.relu(Z)
            activations.append(A)

        Z_output = np.dot(activations[-1], weights[-1]) + biases[-1]
        A_output = self.sigmoid(Z_output) if len(np.unique(y)) == 2 else np.exp(Z_output) / np.sum(np.exp(Z_output), axis=1, keepdims=True)
        return (A_output > 0.5).astype(int) if len(np.unique(y)) == 2 else np.argmax(A_output, axis=1)

    def visualize_results(self,X, y, weights, biases, title):
        pca = PCA(n_components=2)
        X_pca = pca.fit_transform(X)

        x_min, x_max = X_pca[:, 0].min() - 1, X_pca[:, 0].max() + 1
        y_min, y_max = X_pca[:, 1].min() - 1, X_pca[:, 1].max() + 1
        xx, yy = np.meshgrid(np.arange(x_min, x_max, 0.1),
                            np.arange(y_min, y_max, 0.1))
        grid = np.c_[xx.ravel(), yy.ravel()]

        Z = self.predict(pca.inverse_transform(grid),y, weights, biases)
        Z = Z.reshape(xx.shape)

        plt.figure(figsize=(10, 6))
        plt.contourf(xx, yy, Z, alpha=0.3, cmap='cool')
        plt.scatter(X_pca[:, 0], X_pca[:, 1], c=y, cmap='cool', edgecolors='k')
        plt.title(title)
        plt.xlabel('PCA Boyut 1')
        plt.ylabel('PCA Boyut 2')
        plt.colorbar()
        buf = BytesIO()
        plt.savefig(buf, format='png')
        buf.seek(0)
        image_base64 = base64.b64encode(buf.getvalue()).decode('utf-8')
        plt.close()

        return image_base64
    def visualize_fp_fn(self,X_test, y_test, predictions):
        pca = PCA(n_components=2)
        X_test_pca = pca.fit_transform(X_test)

        fp_indices = np.where((predictions == 1) & (y_test == 0))[0]
        fn_indices = np.where((predictions == 0) & (y_test == 1))[0]

        plt.figure(figsize=(10, 6))
        plt.scatter(X_test_pca[:, 0], X_test_pca[:, 1], c=y_test, cmap='cool', edgecolors='k')
        plt.scatter(X_test_pca[fp_indices, 0], X_test_pca[fp_indices, 1], c='red', marker='x', s=100, label='False Positive')
        plt.scatter(X_test_pca[fn_indices, 0], X_test_pca[fn_indices, 1], c='blue', marker='x', s=100, label='False Negative')
        plt.title('Test Verisi False Positive ve False Negative')
        plt.xlabel('PCA Boyut 1')
        plt.ylabel('PCA Boyut 2')
        plt.legend()
        buf = BytesIO()
        plt.savefig(buf, format='png')
        buf.seek(0)
        image_base64 = base64.b64encode(buf.getvalue()).decode('utf-8')
        plt.close()
        return image_base64
        print(f"Yanlış Pozitif Sayısı: {len(fp_indices)}")
        print(f"Yanlış Negatif Sayısı: {len(fn_indices)}")

    def loss_graph(self,loss_history,title):
        """Loss değerleri için grafik oluşturup base64 string döndürür."""
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
    
    def vai_code(self,df):
        """
        DataFrame'deki kategorik değişkenleri, aynı değerleri aynı sayılarla değiştirerek kodlar.

        Args:
            df (pd.DataFrame): İşlenecek DataFrame.

        Returns:
            pd.DataFrame: Kodlanmış DataFrame.
        """

        for sutun in df.columns:
            try:
                # Sütunu sayısal verilere dönüştürmeyi dene
                pd.to_numeric(df[sutun])
            except ValueError:
                # Dönüştürme başarısız olursa, kategorik değişken olarak kabul et
                degerler = df[sutun].unique()
                deger_sozlugu = {deger: i for i, deger in enumerate(degerler)}
                df[sutun] = df[sutun].map(deger_sozlugu)

        return df



    # Veri seti yükleme ve ön işleme
    def fit(self,df, target, layer_sizes):
     try:
        df = self.vai_code(df)
        X = df.drop(target, axis=1).values
        y = df[target].values

        scaler = StandardScaler()
        X = scaler.fit_transform(X)

        X_train, X_temp, y_train, y_temp = train_test_split(X, y, test_size=0.3, random_state=42)
        X_test, X_val, y_test, y_val = train_test_split(X_temp, y_temp, test_size=0.5, random_state=42)

        weights, biases, loss_history,val_loss_history = self.train_mlp_adam(X_train, y_train,X_val, y_val, hidden_sizes=layer_sizes)
        predictions = self.predict(X_test,y, weights, biases).flatten() # predictions'ı düzleştir
        test_score = 1 -np.mean(np.abs(y_test - predictions))
        graphs = {
        'train_graph': self.visualize_results(X_train, y_train, weights, biases, 'Eğitim Seti Karar Çizgisi'),
        'test_graph': self.visualize_results(X_test, y_test, weights, biases, 'Test Seti Karar Çizgisi'),
        'validation_graph': self.visualize_results(X_val, y_val, weights, biases, 'Doğrulama Seti Karar Çizgisi'),
        'fp_fn_graph': self.visualize_fp_fn(X_test, y_test, predictions),
        'loss_graph': self.loss_graph(loss_history, "Training Loss"),
        'val_loss_graph': self.loss_graph(val_loss_history, "Validation Loss")}
        return {"weights": weights, "bias":biases, "graphs": graphs, "test_score": test_score}
     except RuntimeError as e:
        return

    