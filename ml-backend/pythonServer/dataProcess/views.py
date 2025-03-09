import pandas as pd
import os
import numpy as np
from django.core.files.storage import default_storage
from django.http import JsonResponse
from rest_framework.decorators import api_view

def fill_missing_values(df):
    for col in df.columns:
        if df[col].isnull().sum() > 0:
            if df[col].dtype == 'O':
                df[col].fillna(df[col].mode()[0], inplace=True)
            else:
                df[col].fillna(df[col].mean(), inplace=True)
    return df

def encode_categorical_columns(df):
    categorical_columns = df.select_dtypes(include=['object']).columns
    encoded_mappings = {}
    for col in categorical_columns:
        df[col] = df[col].astype(str)
        unique_values = df[col].unique()
        mapping = {val: idx for idx, val in enumerate(unique_values)}
        df[col] = df[col].map(mapping)
        encoded_mappings[col] = mapping
    return df, encoded_mappings

def scale_numeric_columns(df):
    numeric_columns = df.select_dtypes(include=[np.number]).columns
    for col in numeric_columns:
        min_val = df[col].min()
        max_val = df[col].max()
        if max_val - min_val != 0:
            df[col] = (df[col] - min_val) / (max_val - min_val)
    return df

@api_view(['POST'])
def preprocess_csv(request):
    if 'file' not in request.FILES:
        return JsonResponse({'message': 'Dosya yüklenmedi!'}, status=400)

    file = request.FILES['file']
    file_name = default_storage.save(file.name, file)
    file_path = default_storage.path(file_name)

    try:
        df = pd.read_csv(file_path)
        df = fill_missing_values(df)
        df, encoded_mappings = encode_categorical_columns(df)
        df = scale_numeric_columns(df)

        cleaned_data = df.to_dict(orient='records')
        response_data = {
            'message': 'Veri başarıyla işlendi!',
            'cleaned_data': cleaned_data,
            'encoded_mappings': encoded_mappings
        }

        return JsonResponse(response_data, json_dumps_params={'ensure_ascii': False})
    except Exception as e:
        return JsonResponse({'message': f'Hata oluştu: {str(e)}'}, status=500)
    finally:
        os.remove(file_path)