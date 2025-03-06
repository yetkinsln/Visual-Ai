from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from dateutil.parser import parse
import re

def is_date(string):
    try:
        if len(string) < 4:
            return False
        parsed_date = parse(string, fuzzy=False)
        if parsed_date.year < 1900 or parsed_date.year > 2100:
            return False
        return True
    except (ValueError, TypeError):
        return False

def is_numeric(value):
    try:
        value = re.sub(r"[^\d.]", "", value)  # Sayısal olmayan karakterleri temizle
        float(value)
        return True
    except ValueError:
        return False

def clean_numeric(value):
    """Fiyat gibi string içindeki sayıları temizler."""
    return float(re.sub(r"[^\d.]", "", value)) if is_numeric(value) else value

@csrf_exempt
def analyze_csv(request):
    if request.method == "POST":
        try:
            body = json.loads(request.body.decode("utf-8"))
            data = body.get("data", [])
            target_feature = body.get("selectedFeature", None)

            if not data:
                return JsonResponse({"error": "Boş CSV verisi gönderildi."}, status=400)

            if not target_feature or target_feature not in data[0]:
                return JsonResponse({"error": "Geçerli bir hedef sütun seçilmedi."}, status=400)

            # Veriyi temizleyelim
            target_values = [str(row.get(target_feature, "")).strip() for row in data if row.get(target_feature) is not None]

            if not target_values:
                return JsonResponse({"error": "Seçilen sütun boş."}, status=400)

            # 1. Tarih olup olmadığını kontrol edelim
            date_count = sum(is_date(item) for item in target_values)
            date_ratio = date_count / len(target_values)

            if date_ratio > 0.75:
                return JsonResponse({"problem_type": "Time Series"}, status=200)

            # 2. Sayısal olup olmadığını kontrol edelim
            numeric_values = [clean_numeric(item) for item in target_values if is_numeric(item)]
            numeric_ratio = len(numeric_values) / len(target_values)

            unique_values = set(target_values)
            unique_ratio = len(unique_values) / len(target_values)

            # 3. Karar Ağaçları
            if target_feature.lower() in ["doors", "make", "colour"]:  # Açıkça kategorik olan sütunlar
                return JsonResponse({"problem_type": "Classification"}, status=200)

            if numeric_ratio > 0.9:  # Çoğunlukla sayısal
                if unique_ratio < 0.2:  # Eğer eşsiz değer oranı %20'den düşükse Classification
                    return JsonResponse({"problem_type": "Classification"}, status=200)
                return JsonResponse({"problem_type": "Regression"}, status=200)

            if numeric_ratio < 0.4:  # Sayısal veri az, muhtemelen kategorik
                return JsonResponse({"problem_type": "Classification"}, status=200)

            if unique_ratio > 0.5:  # %50'den fazla benzersiz değer varsa Regression
                return JsonResponse({"problem_type": "Regression"}, status=200)

            return JsonResponse({"problem_type": "Classification"}, status=200)  # Varsayılan olarak Classification

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)


    return JsonResponse({"error": "Sadece POST istekleri kabul edilir"}, status=405)
