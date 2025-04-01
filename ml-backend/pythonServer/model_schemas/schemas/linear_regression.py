import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
class Layer:
    def __init__(self):
        self.input = None
        self.output = None

    def forward(self, input):
        pass

    def backward(self, output_gradient, learning_rate):
        pass


class Dense(Layer):
    def __init__(self, input_size, output_size):
        self.weights = np.random.randn(output_size, input_size)
        self.bias = np.random.rand(output_size, 1)

        print(input_size,output_size)

    def forward(self, input):
        self.input = input
        return np.dot(self.weights, self.input) + self.bias

    def backward(self, output_gradient, learning_rate):
        weights_gradient = np.dot(output_gradient, self.input.T.reshape(1, -1))  # Düzenlendi
        self.weights -= learning_rate * weights_gradient
        self.bias -= learning_rate * output_gradient
        return np.dot(self.weights.T, output_gradient)

class Activation(Layer):
    def __init__(self, activation, activation_prime):
        super().__init__()  # Eklendi
        self.activation = activation
        self.activation_prime = activation_prime

    def forward(self, input):
        self.input = input
        return self.activation(self.input)

    def backward(self, output_gradient, learning_rate):
        return np.multiply(output_gradient, self.activation_prime(self.input))

class Tanh(Activation):
    def __init__(self):
        tanh = lambda x: np.tanh(np.array(x, dtype=np.float64))  # Düzenlendi
        tanh_prime = lambda x: 1 - np.tanh(np.array(x, dtype=np.float64)) ** 2  # Düzenlendi
        super().__init__(tanh, tanh_prime)


def mse(y_true, y_pred):
    return np.mean(np.power(y_true - y_pred, 2))

def mse_prime(y_true, y_pred):
    return 2 * (y_pred - y_true) / np.size(y_true)

def fit(df, target, epochs=100, learning_rate=0.01, num_layer=1):
    tmp_X = pd.get_dummies(df.drop(target, axis=1)).astype(np.float64)
    scaler = StandardScaler()
    tmp_X = scaler.fit_transform(tmp_X)

    X = np.reshape(tmp_X, (tmp_X.shape[0], tmp_X.shape[1], 1))
    Y = np.reshape(df[target], (tmp_X.shape[0], 1, 1))
    if np.max(Y)!=0:
        Y = Y/ np.max(Y)
    network = []
    inp, out = X.shape[1], 16

    for i in range(num_layer + 1):
        network.append(Dense(inp, out))
        if out != 1:
            network.append(Tanh())
        
        inp = out
        if i == num_layer-1:  # Hata düzeltildi
            out = 1

    for e in range(epochs):
        error = 0
        for x, y in zip(X, Y):
            output = x
            for layer in network:
                output = layer.forward(output)

            error += mse(y, output)
            grad = mse_prime(y, output)
            for layer in reversed(network):
                grad = layer.backward(grad, learning_rate)

        error /= len(X)
        print('%d/%d, error=%f' % (e + 1, epochs, error))  # Düzenlendi
