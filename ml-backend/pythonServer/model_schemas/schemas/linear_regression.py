import numpy as np
import pandas as pd
import json
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score
import matplotlib.pyplot as plt
from io import BytesIO
import base64
import copy
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
        self.inp_size = input_size
        self.outp_size = output_size

    def forward(self, input):
        self.input = input
        return np.dot(self.weights, self.input) + self.bias

    def backward(self, output_gradient, learning_rate):
        weights_gradient = np.dot(output_gradient, self.input.T.reshape(1, -1))  # Düzenlendi
        self.weights -= learning_rate * weights_gradient
        self.bias -= learning_rate * output_gradient
        return np.dot(self.weights.T, output_gradient)
    def to_dict(self):
        return {
            "input_shape": self.inp_size,
            "output_Shape": self.outp_size,
            "weights": self.weights.astype(float).tolist(),
            "bias": self.bias.astype(float).tolist()
        }

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
    def to_dict(self):

        return {"activation": "tanh"}
class load_best_weights:

    def __init__(self, network):
        self.network = network
    
    def update(self, network):
        self.network = network
    
    def load(self):
        return self.network

def mse(y_true, y_pred):
    return np.mean(np.power(y_true - y_pred, 2))

def mse_prime(y_true, y_pred):
    return 2 * (y_pred - y_true) / np.size(y_true)

def loss_graph(err,title):
        plt.figure(figsize=(6, 4))
        plt.plot(err, label='Loss', color='red')
        plt.xlabel('Epoch')
        plt.ylabel('Loss')
        plt.title(title)
        plt.axvline(x=err.index(np.min(err)), linestyle = "--", color="green")
        plt.legend()
        
        buf = BytesIO()
        plt.savefig(buf, format='png')
        buf.seek(0)
        image_base64 = base64.b64encode(buf.getvalue()).decode('utf-8')
        plt.close()
        
        return image_base64

def fit(df, target, epochs=100, learning_rate=0.01, num_layer=3):
    
    tmp_X = pd.get_dummies(df.drop(target, axis=1)).astype(np.float64)
    scaler = StandardScaler()
    tmp_X = scaler.fit_transform(tmp_X)
    
    err = []
    val_err = []  # Doğrulama hatası listesi
    
    X = np.reshape(tmp_X, (tmp_X.shape[0], tmp_X.shape[1], 1))
    Y = np.reshape(df[target], (tmp_X.shape[0], 1, 1))
    my = np.max(Y)
    if my != 0:
        Y = Y / my
    
    X_train, X_temp, y_train, y_temp = train_test_split(X, Y, test_size=0.3, random_state=42)
    X_test, X_val, y_test, y_val = train_test_split(X_temp, y_temp, test_size=0.5, random_state=42)
    
    X = X_train
    Y = y_train
    
    if np.max(Y) != 0:
        Y = Y / np.max(Y)
    
    network = []
    inp, out = X.shape[1], 16

    for i in range(num_layer + 1):
        network.append(Dense(inp, out))
        
        if out != 1:
            network.append(Tanh())
            
        inp = out
        if i == num_layer - 1:
            out = 1
    best_network = load_best_weights(network)
    val_err = [np.inf]
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
        err.append(error)
        
        # Doğrulama hatasını hesapla

        val_error = 0
        for x, y in zip(X_val, y_val):
            output = x
            for layer in network:
                output = layer.forward(output)
            val_error += mse(y, output)
        
        val_error /= len(X_val)
        if np.min(val_err) == val_error and len(val_err) != 0:
            best_network.update(copy.deepcopy(network))
        val_err.append(val_error)
        print(f"Epoch: {e} err: {error} ")
        
    
    # Test hatasını hesapla

    test_error = 0
    for x, y in zip(X_test, y_test):
            output = x
            for layer in best_network.load():
                output = layer.forward(output)
            test_error += mse(y, output)
        
    test_error /= len(X_val)
    print(test_error)
    test_score = (1 - test_error) / (1 + test_error)

    network_architecture = [n.to_dict() for n in best_network.load()]
    graphs = {"err_per_epoch": loss_graph(err,'Train Error per Epoch'),
              "val_err_per_epoch": loss_graph(val_err,'Validation Error per Epoch')}
    
    return {"weights": json.dumps(network_architecture), "graphs": graphs, "test_score": test_score}
