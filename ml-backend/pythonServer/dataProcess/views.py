import pandas as pd
import os
import numpy as np
from django.core.files.storage import default_storage
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.parsers import MultiPartParser, FormParser

def fill_missing_values(df, imputation_strategy='mean', constant_value=None):
    """
    Eksik değerleri belirtilen stratejiye göre doldurur.

    Args:
        df (pd.DataFrame): İşlenecek DataFrame.
        imputation_strategy (str, optional): Doldurma stratejisi. 'mean', 'median', 'mode' veya 'constant' olabilir. Varsayılan 'mean'.
        constant_value: Eğer strateji 'constant' ise kullanılacak sabit değer.

    Returns:
        pd.DataFrame: Eksik değerleri doldurulmuş DataFrame.
    """
    for col in df.columns:
        if df[col].isnull().sum() > 0:
            if df[col].dtype == 'O': # Kategorik sütun
                df[col].fillna(df[col].mode()[0], inplace=True) # Kategorik için her zaman mod
            else: # Sayısal sütun
                if imputation_strategy == 'mean':
                    df[col].fillna(df[col].mean(), inplace=True)
                elif imputation_strategy == 'median':
                    df[col].fillna(df[col].median(), inplace=True)
                elif imputation_strategy == 'mode':
                    df[col].fillna(df[col].mode()[0], inplace=True)
                elif imputation_strategy == 'constant' and constant_value is not None:
                    df[col].fillna(constant_value, inplace=True)
                else:
                    # Varsayılan olarak ortalama doldurma veya geçersiz strateji durumu
                    df[col].fillna(df[col].mean(), inplace=True)
    return df


def encode_categorical_columns(df):
    """
    Kategorik sütunları etiket kodlama (Label Encoding) ile sayısal değerlere dönüştürür.

    Args:
        df (pd.DataFrame): İşlenecek DataFrame.

    Returns:
        tuple: (DataFrame, dict) - Kodlanmış DataFrame ve kodlama eşlemelerinin sözlüğü.
    """
    categorical_columns = df.select_dtypes(include=['object']).columns
    encoded_mappings = {}
    for col in categorical_columns:
        df[col] = df[col].astype(str)
        unique_values = df[col].unique()
        mapping = {val: idx for idx, val in enumerate(unique_values)}
        df[col] = df[col].map(mapping)
        encoded_mappings[col] = mapping
    return df, encoded_mappings

def scale_numeric_columns(df, scaling_method='minmax'):
    """
    Sayısal sütunları belirtilen yönteme göre ölçeklendirir.

    Args:
        df (pd.DataFrame): İşlenecek DataFrame.
        scaling_method (str, optional): Ölçeklendirme yöntemi. 'minmax' veya 'standard' olabilir. Varsayılan 'minmax'.

    Returns:
        pd.DataFrame: Ölçeklendirilmiş DataFrame.
    """
    numeric_columns = df.select_dtypes(include=[np.number]).columns
    for col in numeric_columns:
        min_val = df[col].min()
        max_val = df[col].max()
        std_dev = df[col].std() # Standart sapma

        if scaling_method == 'minmax':
            if max_val - min_val != 0:
                df[col] = (df[col] - min_val) / (max_val - min_val)
        elif scaling_method == 'standard': # Standardizasyon (Z-skor)
            if std_dev != 0: # Standart sapma sıfır değilse
                 df[col] = (df[col] - df[col].mean()) / std_dev
        # 'minmax' varsayılan olarak uygulanır, veya geçersiz yöntem durumunda bir şey yapılmaz.
    return df

@api_view(['POST'])
def preprocess_csv(request):
    """
    CSV dosyasını alır, ön işleme adımlarını uygular ve sonucu JSON formatında döndürür.

    Ön işleme adımları:
        1. Eksik değerleri doldurma (strateji isteğe bağlı olarak yapılandırılabilir).
        2. Kategorik sütunları etiket kodlama ile dönüştürme.
        3. Sayısal sütunları min-max ölçeklendirme ile ölçeklendirme.

    İstek Gövdesi (multipart/form-data):
        - file: Yüklenecek CSV dosyası (zorunlu).
        - imputation_strategy (isteğe bağlı): Eksik değer doldurma stratejisi ('mean', 'median', 'mode', 'constant').
        - constant_value (isteğe bağlı): Eğer 'constant' stratejisi seçilirse kullanılacak değer.
        - scaling_method (isteğe bağlı): Sayısal sütun ölçeklendirme yöntemi ('minmax', 'standard').

    Yanıt (JSON):
        - message: İşlem sonucu mesajı (başarı veya hata).
        - cleaned_data: Ön işlenmiş veri (kayıtlar listesi şeklinde).
        - encoded_mappings (isteğe bağlı): Kategorik sütunlar için kodlama eşlemeleri (sadece kodlama yapıldıysa).
        - preprocessing_steps_applied: Uygulanan ön işleme adımlarının listesi.
    """
    if 'file' not in request.FILES:
        return JsonResponse({'message': 'Dosya yüklenmedi!'}, status=400)

    file = request.FILES['file']

    if not file.name.endswith('.csv'):
        return JsonResponse({'message': 'Lütfen bir CSV dosyası yükleyin.'}, status=400)

    file_name = default_storage.save(file.name, file)
    file_path = default_storage.path(file_name)
    preprocessing_steps_applied = [] # Uygulanan adımları takip etmek için liste

    try:
        df = pd.read_csv(file_path)

        # 1. Eksik Değer Doldurma (Parametrik)
        imputation_strategy = request.POST.get('imputation_strategy', 'mean') # Varsayılan strateji: ortalama
        constant_value_str = request.POST.get('constant_value')
        constant_value = None
        if constant_value_str:
            try:
                constant_value = float(constant_value_str) # Sayısal sabit değer
            except ValueError:
                return JsonResponse({'message': 'Sabit değer sayısal olmalıdır.'}, status=400)


        df = fill_missing_values(df, imputation_strategy, constant_value)
        preprocessing_steps_applied.append(f"Eksik değerler '{imputation_strategy}' stratejisi ile dolduruldu.")
        if imputation_strategy == 'constant' and constant_value is not None:
            preprocessing_steps_applied.append(f"Sabit değer olarak '{constant_value}' kullanıldı.")


        # 2. Kategorik Sütun Kodlama
        df, encoded_mappings = encode_categorical_columns(df)
        preprocessing_steps_applied.append("Kategorik sütunlar etiket kodlama ile dönüştürüldü.")

        # 3. Sayısal Sütun Ölçeklendirme (Parametrik)
        scaling_method = request.POST.get('scaling_method', 'minmax') # Varsayılan: min-max
        df = scale_numeric_columns(df, scaling_method)
        preprocessing_steps_applied.append(f"Sayısal sütunlar '{scaling_method}' yöntemi ile ölçeklendirildi.")


        cleaned_data = df.to_dict(orient='records')
        response_data = {
            'message': 'Veri başarıyla işlendi!',
            'cleaned_data': cleaned_data,
            'preprocessing_steps_applied': preprocessing_steps_applied,
        }
        if encoded_mappings: # Sadece kategorik kodlama yapıldıysa ekle
            response_data['encoded_mappings'] = encoded_mappings

        return JsonResponse(response_data, json_dumps_params={'ensure_ascii': False})

    except pd.errors.ParserError as e:
        return JsonResponse({'message': f'CSV ayrıştırma hatası: {str(e)} Lütfen CSV dosyasının doğru formatta olduğundan emin olun.'}, status=400)
    except FileNotFoundError:
        return JsonResponse({'message': 'Dosya bulunamadı!'}, status=404)
    except Exception as e:
        return JsonResponse({'message': f'Sunucu hatası oluştu: {str(e)}'}, status=500)
    finally:
        default_storage.delete(file_name) # Dosyayı güvenli şekilde silmek için default_storage kullanılıyor