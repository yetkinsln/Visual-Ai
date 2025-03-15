import pandas as pd
import numpy as np

class Linear_regression():

    def __init__(self, data):
        if not data:
            return
        self.weights = []
        self.bias = 0
        self.data = data
        self.preprocessLog = {}
        for d in data['df'].keys():
            try:
                data['df'][d] = pd.to_numeric(data['df'][d])
            except ValueError:
                print(f"Sütun '{d}' sayısal değere dönüştürülemedi.")
        self.y = data['df'][data['target']]
        self.X = data['df'].drop(data['target'], axis=1)

    def preprocess(self, X, y, split_count=0.8):

        X = pd.get_dummies(X)

        if y.dtype == 'object':
            return None, None, None, None  # Hata durumunda None döndür

        self.preprocessLog.update({'normalization_coefficients': []})
        self.preprocessLog['normalization_coefficients'].append({'y': np.max(y)})
        for c in X.columns:
            log = {c: np.max(X[c])}
            self.preprocessLog['normalization_coefficients'].append(log)
            X[c] = X[c] / np.max(X[c])

        sp = round(len(y) * split_count)

        y_train = y[0:sp]
        y_test = y[sp:]

        X_train = X[:sp]
        X_test = X[sp:]

        return (X_train, y_train, X_test, y_test)

    def h(self, X, weight, bias):
        return np.dot(X, weight) + bias

    def mse(self, X, y, weight, bias):
        m = len(y)
        y_hat = self.h(X, weight, bias)
        loss = np.sum((y_hat - y) ** 2) / (2 * m)  # y_hat[0] kaldırıldı
        return loss

    def w_update(self, X, y, weight, bias, alpha):
        m = len(y)
        y_hat = self.h(X, weight, bias)
        gradient = np.dot(X.T, (y_hat - y)) / m  # y_hat[0] kaldırıldı
        return weight - alpha * gradient

    def b_update(self, X, y, weight, bias, alpha):
        m = len(y)
        y_hat = self.h(X, weight, bias)
        bias_gradient = np.sum(y_hat - y) / m  # y_hat[0] kaldırıldı
        return bias - alpha * bias_gradient

    def fit(self, learning_rate=0.25, epoch=50, tolerance=1e-5, split_count=0.8):
        X = self.X
        y = self.y
        X_train, y_train, X_test, y_test = self.preprocess(X, y)

        if X_train is None:  # preprocess hata döndürdüyse
            return "Hedef değişken sayısal değil."

        history = []

        self.weights = np.random.rand(len(X_train.columns.to_list()))  # X_train kullanıldı
        bias = np.random.rand()
        M = len(y)
        err = self.mse(X_train, y_train, self.weights, bias)  # bias kullanıldı
        i = 0

        while err > tolerance and i < epoch:
            self.weights = self.w_update(X_train, y_train, self.weights, bias, learning_rate) # bias kullanıldı
            bias = self.b_update(X_train, y_train, self.weights, bias, learning_rate)
            err = self.mse(X_train, y_train, self.weights, bias)

            history.append({"iteration": i, "loss": err})

            i += 1
        return {"weights": self.weights.tolist(), "bias": bias, "history": history, "preprocessLog": self.preprocessLog}