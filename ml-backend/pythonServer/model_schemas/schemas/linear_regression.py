import pandas as pd
import numpy as np

class Linear_regression():

    def __init__(self, data):
        if not data:
            return
        self.weights = []
        self.bias = 0
        self.target = data['target']
        self.dataframe = pd.DataFrame(data['df'])
        self.preprocessLog = {}


     

    def preprocess(self, train_ratio=0.7, validation_ratio=0.15, test_ratio=0.15):


        
        for d in self.dataframe.keys():
            try:
                self.dataframe[d] = pd.to_numeric(self.dataframe[d])
            except ValueError:
                print(f"Sütun '{d}' sayısal değere dönüştürülemedi.")
        self.dataframe = self.dataframe.replace(['', ' '], np.nan)

        self.dataframe = self.dataframe.dropna()
        y = self.dataframe[self.target]
        X = self.dataframe.drop(self.target, axis=1)
        for column in X.columns:
            if X[column].dtype != "object":
                print(f'ColumnName: {column}')
                X[column] = X[column].fillna(X[column].mean())
        X = pd.get_dummies(X, dtype=int)  # Kategorik sütunları dönüştür

        if y.dtype == 'object':

            return None, None, None, None, None, None  # Hata durumunda None döndür

        self.preprocessLog.update({'normalization_coefficients': []})
        self.preprocessLog['normalization_coefficients'].append({'y': np.max(y)})
        for c in X.columns:
            log = {c: np.max(X[c])}
            self.preprocessLog['normalization_coefficients'].append(log)
            X[c] = X[c] / np.max(X[c])

        total_size = len(y)
        train_size = int(total_size * train_ratio)
        validation_size = int(total_size * validation_ratio)

        X_train = X[:train_size]
        y_train = y[:train_size]

        X_validation = X[train_size:train_size + validation_size]
        y_validation = y[train_size:train_size + validation_size]

        X_test = X[train_size + validation_size:]
        y_test = y[train_size + validation_size:]

        print( X_train.isna().sum(), y_train)

        return X_train, y_train, X_validation, y_validation, X_test, y_test

    def h(self, X, weight, bias):
        return np.dot(X, weight) + bias

    def mse(self, X, y, weight, bias):
        m = len(y)
        y_hat = self.h(X, weight, bias)
        loss = np.sum((y_hat - y) ** 2) / (2 * m)
        return loss

    def w_update(self, X, y, weight, bias, alpha):
        m = len(y)
        y_hat = self.h(X, weight, bias)
        gradient = np.dot(X.T, (y_hat - y)) / m
        return weight - alpha * gradient

    def b_update(self, X, y, weight, bias, alpha):
        m = len(y)
        y_hat = self.h(X, weight, bias)
        bias_gradient = np.sum(y_hat - y) / m
        return bias - alpha * bias_gradient

    def fit(self, learning_rate=0.25, epoch=50, tolerance=1e-5, train_ratio=0.7, validation_ratio=0.15, test_ratio=0.15):

        X_train, y_train, X_validation, y_validation, X_test, y_test = self.preprocess(train_ratio, validation_ratio, test_ratio)

        if X_train is None:
            return "Hedef değişken sayısal değil."

        history = []

        self.weights = np.random.rand(len(X_train.columns.to_list()))
        self.bias = np.random.rand()
        err = self.mse(X_train, y_train, self.weights, self.bias)
        i = 0

        while err > tolerance and i < epoch:
            self.weights = self.w_update(X_train, y_train, self.weights, self.bias, learning_rate)
            self.bias = self.b_update(X_train, y_train, self.weights, self.bias, learning_rate)
            err = self.mse(X_train, y_train, self.weights, self.bias)
            validation_loss = self.mse(X_validation, y_validation, self.weights, self.bias)

            history.append({"iteration": int(i), "loss": err, "validation_loss": validation_loss})

            i += 1
        weights_list = [float(w) for w in self.weights.tolist()]
        bias_float = float(self.bias)
        preprocess_log = {
            "normalization_coefficients": [
                {k: float(v) for k, v in item.items()} if isinstance(item, dict) else float(item["y"])
                for item in self.preprocessLog["normalization_coefficients"]
            ]
        }
        predicts = self.h(X_test, self.weights, self.bias)
        test_score = float(1 - abs(np.sum(y_test - predicts)))
        if test_score < 0: test_score = 0
        return {"weights": weights_list, "bias": bias_float, "history": history, "preprocessLog": preprocess_log, "test_score": test_score}