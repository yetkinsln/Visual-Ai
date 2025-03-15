from django.http import JsonResponse
from . import schemas
from django.views.decorators.csrf import csrf_exempt
import json
import pandas as pd
from io import StringIO

@csrf_exempt
def build_model(request):
    if request.method == 'POST':
        try:
            params = json.loads(request.body)
            algorithm = params['algorithm']
            epoch = params['epoch']
            tolerance = params['tolerance']
            learningRate = params['learningRate']
            df = pd.read_json(StringIO(json.dumps(params['processedData'])))
            target = params['target']
            X = df.drop(target, axis=1)
            y = df[target]
            model = schemas.linear_regression(X, y,learningRate,epoch,tolerance)
            result = {"message": "Model oluşturuldu", "predictions": model} #Direkt modeli döndürdüm.
            return JsonResponse(result)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Geçersiz JSON"}, status=400)
        except KeyError as e:
            if str(e) == f"'{params['target']}'":
                return JsonResponse({"error": f"'{target}' sütunu bulunamadı"}, status=400)
            else:
                return JsonResponse({"error": f"Anahtar hatası: {e}"}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    else:
        return JsonResponse({"error": "Sadece POST istekleri kabul edilir"}, status=405)