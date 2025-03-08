import numpy as np 

def linear_regression(X, y, alpha=0.25, epochs=50, tolerance= 1e-5,  split_count=0.8):

   log = []
   try:
    weight = np.random.rand(X.shape[1] if X.ndim > 1 else 1)
    bias = np.random.rand()
    M = len(y)
    split_index = int(split_count * len(y))

    X_train = X[:split_index]
    x_test = X[split_index:]

    y_train = y[:split_index]
    y_test = y[split_index:]

    err = mse( X, y, weight, bias)

    while err > tolerance and i< epochs:
        weight = w_update(X, y, weight, bias, alpha)
        bias = b_update(X, y, weight, bias, alpha)
        err = J(X, y, weight, bias)

        log.append({"Iteration": i, "Loss": err})

        i+=1
    return {"weight": weight, "bias": bias, "log": log}
   except Exception as e:
        return(e)

def h(X, weight, bias):
    
    return np.dot(X, weight) + bias


def mse(X, y, weight, bias):

    m = len(y)
    y_hat = h(X, weight, bias)
    loss = np.sum((y_hat - y)**2) / (2 * m)
    return loss

def w_update(X, y, weight, bias, alpha):
    m = len(y)
    y_hat = h(X, weight, bias)
    gradient = np.dot(X.T, (y_hat - y)) / m
    return weight - alpha * gradient  

def b_update(X, y, weight, bias, alpha):
    m = len(y)
    y_hat = h(X, weight, bias)
    bias_gradient = np.sum(y_hat - y) / m  # Bias türevi hesaplanır
    return bias - alpha * bias_gradient