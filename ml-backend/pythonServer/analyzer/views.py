from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

@csrf_exempt
def analyze_csv(request):
    if request.method == "POST":
        try:
            # Gelen JSON verisini al
            body = json.loads(request.body.decode("utf-8"))
            data = body.get("data", [])
            target_feature = body.get("selectedFeature", None)  # Hangi sütunun analiz edileceği

            if not data:
                return JsonResponse({"error": "Boş CSV verisi gönderildi."}, status=400)

            if not target_feature or target_feature not in data[0]:
                return JsonResponse({"error": "Geçerli bir hedef sütun seçilmedi."}, status=400)

            # Seçilen hedef sütunun tüm değerlerini al
            target_values = [row[target_feature] for row in data]

            # Eğer hedef sütun sayısalsa "Regression", değilse "Classification"
            is_numeric = all(str(value).replace(".", "").isdigit() for value in target_values)
            problem_type = "Regression" if is_numeric else "Classification"

            return JsonResponse({"problem_type": problem_type}, status=200)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Geçersiz JSON formatı"}, status=400)

    return JsonResponse({"error": "Sadece POST istekleri kabul edilir"}, status=405)
