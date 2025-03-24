import pandas as pd
import numpy as np

class Logistic_Regression:
    def __init__(self, data):
        if not data:
            raise ValueError("Veri sağlanmadı!")
        self.weights = None
        self.bias = 0
        self.target = data['target']
        self.dataframe = pd.DataFrame(data['df'])
        self.preprocess_log = {}

    def preprocess(self, train_ratio=0.7, validation_ratio=0.15, test_ratio=0.15):
        # Sayısal dönüşüm ve eksik değer temizleme
        for column in self.dataframe.columns:
            try:
                self.dataframe[column] = pd.to_numeric(self.dataframe[column])
            except ValueError:
                print(f"Sütun '{column}' sayısal değere dönüştürülemedi.")
        
        self.dataframe.replace(['', ' '], np.nan, inplace=True)
        self.dataframe.dropna(inplace=True)
        
        y = self.dataframe[self.target].astype(int)
        X = self.dataframe.drop(self.target, axis=1)
        
        # Eksik verileri ortalama ile doldur ve kategorik verileri dönüştür
        for column in X.columns:
            if X[column].dtype != 'object':
                X[column].fillna(X[column].mean(), inplace=True)
        
        X = pd.get_dummies(X, dtype=int)  # Kategorik sütunları dönüştür
        
        # Normalizasyon
        self.preprocess_log['normalization_coefficients'] = {}
        for column in X.columns:
            max_value = X[column].max()
            if max_value:
                X[column] /= max_value
                self.preprocess_log['normalization_coefficients'][column] = max_value
        
        # Veri setini bölme
        total_size = len(y)
        train_size = int(total_size * train_ratio)
        validation_size = int(total_size * validation_ratio)

        X_train, y_train = X[:train_size], y[:train_size]
        X_validation, y_validation = X[train_size:train_size + validation_size], y[train_size:train_size + validation_size]
        X_test, y_test = X[train_size + validation_size:], y[train_size + validation_size:]
        
        return X_train.to_numpy(), y_train.to_numpy(), X_validation.to_numpy(), y_validation.to_numpy(), X_test.to_numpy(), y_test.to_numpy()

    def sigmoid(self, z):
        return 1 / (1 + np.exp(-z))

    def initialize_parameters(self, dim):
        w = np.zeros(dim)
        b = 0
        return w, b

    def propagate(self, w, b, X, Y):
        m = X.shape[0]
        A = self.sigmoid(np.dot(X, w) + b)
        cost = (-1 / m) * np.sum(Y * np.log(A) + (1 - Y) * np.log(1 - A))
        
        dw = (1 / m) * np.dot(X.T, (A - Y))
        db = (1 / m) * np.sum(A - Y)
        
        return {"dw": dw, "db": db}, cost

    def optimize(self, w, b, X, Y, num_iterations, learning_rate, print_cost=False):
        costs = []
        for i in range(num_iterations):
            grads, cost = self.propagate(w, b, X, Y)
            w -= learning_rate * grads["dw"]
            b -= learning_rate * grads["db"]
            if i % 100 == 0:
                costs.append(cost)
                if print_cost:
                    print(f"Iteration {i}: Cost {cost}")
        return {"w": w, "b": b}, costs

    def predict(self, w, b, X):
        A = self.sigmoid(np.dot(X, w) + b)
        return (A >= 0.5).astype(int)

    def fit(self, num_iterations=2000, learning_rate=0.5, print_cost=False):
        X_train, y_train, X_validation, y_validation, X_test, y_test = self.preprocess()
        
        dim = X_train.shape[1]
        w, b = self.initialize_parameters(dim)
        params, costs = self.optimize(w, b, X_train, y_train, num_iterations, learning_rate, print_cost)
        
        w, b = params["w"], params["b"]
        Y_pred_test = self.predict(w, b, X_test)
        Y_pred_train = self.predict(w, b, X_train)

        if Y_pred_test.shape != y_test.shape:
            print("Boyut uyuşmazlığı!")
            return None

        train_acc = 100 - np.mean(np.abs(Y_pred_train - y_train)) * 100
        test_acc = 1 - np.mean(np.abs(Y_pred_test - y_test))
        print(f"Train Accuracy: {train_acc:.2f}%")
        print(f"Test Accuracy: {test_acc*100:.2f}%")
        
        history = []
        i = 0
        for h in costs:
            history.append({"iteration": costs.index(h),
                            "loss": h,
                            "validation_loss": 0})


        return {
            "weights": w.tolist(),
            "bias": float(b),
            "learning_rate": learning_rate,
            "num_iterations": num_iterations,
            "train_accuracy": train_acc,
            "test_score": test_acc,
            "history": history
        }
