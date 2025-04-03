import json
import numpy as np
import pandas as pd
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .schemas.linear_regression import fit as regression_fit
from .schemas.logistic_regression import Classification
from io import StringIO

# NumPy dizilerini JSON uyumlu hale getiren yardımcı fonksiyon
def convert_to_serializable(obj):
    """Tüm NumPy dizilerini JSON uyumlu hale getirir."""
    if isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, dict):
        return {key: convert_to_serializable(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [convert_to_serializable(value) for value in obj]
    elif isinstance(obj, np.generic):  # NumPy'nin diğer özel veri türleri için
        return obj.item()
    return obj

class Model:
    def __init__(self, request):
        if request.method != 'POST':
            self.error = "Invalid request method. Only POST is allowed."
            return

        try:
            params = json.loads(request.body)
            self.algorithm = params.get('algorithm')
            self.target = params.get('target')
            self.epoch = params.get('epoch')
            self.tolerance = params.get('tolerance')
            self.learningRate = params.get('learningRate')
            self.split = params.get('split')
            self.data = pd.read_json(StringIO(json.dumps(params.get('data', {}))))

            if not all([self.algorithm, self.target, self.epoch, self.tolerance, self.learningRate, self.split]):
                self.error = "Missing required parameters."
        
        except Exception as e:
            self.error = str(e)

    def to_dict(self):
        return {
            "algorithm": self.algorithm,
            "epoch": self.epoch,
            "tolerance": self.tolerance,
            "learningRate": self.learningRate
        }

@csrf_exempt
def build_model(request):
    model = Model(request)

    if hasattr(model, 'error'):
        return JsonResponse({"error": model.error}, status=400)

    if model.algorithm == 'linear_regression':
        train_ratio = model.split
        test_ratio = (1 - train_ratio) / 2
        validation_ratio = test_ratio
        result = regression_fit(model.data, model.target)

    elif model.algorithm == 'logistic_regression':
        ml_model = Classification()
        result = ml_model.fit(df=model.data, target=model.target, layer_sizes=[64, 32])

    else:
        return JsonResponse({"error": "Unsupported algorithm specified."}, status=400)

    # Tüm sonuçları JSON formatına uygun hale getir
    serializable_result = convert_to_serializable(result)

    return JsonResponse(serializable_result, safe=False)
