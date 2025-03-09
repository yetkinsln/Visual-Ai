from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import pandas as pd
import re

def model_chooser(num_features, analyze):
    """Veri analizi türüne ve özellik sayısına göre uygun modeli seçer."""
    if analyze == "Regression":
        return "Levenberg-Marquardt" if num_features > 1 else "Linear_Regression"
    elif analyze == "Classification":
        return "Random_Forest_Classification" if num_features > 1 else "Logistic_Regression"
    elif analyze == "Time Series":
        return "ARIMA"  # Örnek zaman serisi modeli
    else:
        return None

def is_currency(value):
    """Değerin para birimi formatında olup olmadığını kontrol eder."""
    return bool(re.match(r'^[€£\$]?\s*\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?\s*[€£\$]?$', str(value)))

@csrf_exempt
def analyze_csv(request):
    """Gelen CSV verilerini analiz eder ve uygun analiz türünü belirler."""
    if request.method != "POST":
        return JsonResponse({"error": "Sadece POST istekleri kabul edilir."}, status=405)

    try:
        body = json.loads(request.body.decode("utf-8"))
        data = body.get("data", [])
        target_feature = body.get("selectedFeature", None)

        if not data:
            return JsonResponse({"error": "Boş CSV verisi gönderildi."}, status=400)

        if not target_feature or target_feature not in data[0]:
            return JsonResponse({"error": "Geçersiz hedef sütun seçildi."}, status=400)

        target_values = pd.Series([str(row.get(target_feature, "")).strip() for row in data if row.get(target_feature) is not None])

        if target_values.empty:
            return JsonResponse({"error": "Seçilen sütun boş."}, status=400)

        numeric_values = pd.to_numeric(target_values, errors='coerce')
        numeric_count = numeric_values.notna().sum()
        numeric_ratio = numeric_count / len(target_values)

        if numeric_ratio > 0.9:
            unique_values = numeric_values.dropna().unique()
            unique_count = len(unique_values)
            unique_ratio = unique_count / len(target_values)

            # Kategorik nümerik kontrolü (geliştirilmiş)
            if unique_ratio < 0.2:  # Eşik değeri ayarlanabilir
                return JsonResponse({"problem_type": "Classification"}, status=200)

            # Lojistik sayı kontrolü (daha katı)
            if unique_count == 2 and all(val in [0, 1] for val in unique_values):
                return JsonResponse({"problem_type": "Classification"}, status=200)

            # Para birimi veya kategorik nümerik kontrolü
            if unique_count < 10 or unique_ratio < 0.4:
                return JsonResponse({"problem_type": "Classification"}, status=200)
            else:
                return JsonResponse({"problem_type": "Regression"}, status=200)
        else:
            return JsonResponse({"problem_type": "Classification"}, status=200)

        if pd.to_datetime(target_values, errors='coerce').notna().mean() > 0.75:
            return JsonResponse({"problem_type": "Time Series"}, status=200)

        currency_count = sum(target_values.apply(is_currency))
        currency_ratio = currency_count / len(target_values)

        if currency_ratio > 0.9:
            return JsonResponse({"problem_type": "Regression"}, status=200)

       

    except json.JSONDecodeError:
        return JsonResponse({"error": "Geçersiz JSON formatı."}, status=400)
    except KeyError:
        return JsonResponse({"error": "JSON verisinde eksik anahtar."}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)