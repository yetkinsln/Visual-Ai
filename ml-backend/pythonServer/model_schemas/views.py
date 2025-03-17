import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import pandas as pd
from .schemas.linear_regression import Linear_regression
from io import StringIO  

class Model():

    def __init__(self, request):
        if request.method == 'POST':
            try:
                params = json.loads(request.body)
                self.params = params  # Corrected: removed redundant json.loads
                self.algorithm = params['algorithm']
                self.target = params['target']
                self.epoch = params['epoch']
                self.tolerance = params['tolerance']
                self.learningRate = params['learningRate']
                self.split = params['split']
                self.data = pd.read_json(StringIO(json.dumps(params['data'])))

                
                # Removed return JsonResponse from here, as it belongs in the view.
            except Exception as e:
                self.error = str(e)  # Store the error for the view to handle
        else:
            self.error = "Invalid request method. Only POST is allowed."

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

    match model.algorithm:
        case 'linear_regression':
            linear_model = Linear_regression({'df':model.data, 'target':model.target})
            train_ratio = model.split
            test_ratio = (1 - train_ratio)/2
            validation_ratio = test_ratio
            result = linear_model.fit(learning_rate=model.learningRate, epoch=model.epoch, tolerance=model.tolerance, train_ratio=train_ratio, validation_ratio=validation_ratio, test_ratio=test_ratio)

            return JsonResponse(result, safe=False)

    if hasattr(model, 'error'):
        return JsonResponse({"error": model.error}, status=500)
    else:
        return JsonResponse(model.to_dict())
        # if request.method == 'POST':
        #     try:
        #         params = json.loads(request.body)
        #         algorithm = params['algorithm']
        #         epoch = params['epoch']
        #         tolerance = params['tolerance']
        #         learningRate = params['learningRate']
        #         df = pd.read_json(StringIO(json.dumps(params['data'])))
        #         target = params['target']
        #         X = df.drop(target, axis=1)
        #         y = df[target]
        #         model = schemas.linear_regression(X, y,learningRate,epoch,tolerance)
        #         result = {"message": "Model oluşturuldu", "predictions": model} #Direkt modeli döndürdüm.
        #         return JsonResponse(result)
        #     except json.JSONDecodeError:
        #         return JsonResponse({"error": "Geçersiz JSON"}, status=400)
        #     except KeyError as e:
        #         if str(e) == f"'{params['target']}'":
        #             return JsonResponse({"error": f"'{target}' sütunu bulunamadı"}, status=400)
        #         else:
        #             return JsonResponse({"error": f"Anahtar hatası: {e}"}, status=400)
        #     except Exception as e:
        #         return JsonResponse({"error": str(e)}, status=500)
        # else:
        #     return JsonResponse({"error": "Sadece POST istekleri kabul edilir"}, status=405)