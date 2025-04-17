from .Classification import Classification
from .Regression import Dense, Tanh
import pandas as pd
from sklearn.preprocessing import StandardScaler
import numpy as np

def Predict(model, data):
    try:
        if model['model_type'] == 'regression':
            network = []

            # Ağı yeniden oluştur
            for layer in model['weights']:
                if 'activation' in layer and layer['activation'] == "tanh":
                    network.append(Tanh())
                else:
                    dense = Dense(layer['input_shape'], layer['output_Shape'])
                    dense.weights = np.array(layer['weights'])
                    dense.bias = np.array(layer['bias'])
                    network.append(dense)
            print(network)
            # StandardScaler yükle
            scaler = StandardScaler()
            scaler.mean_ = np.array(model['scaler']['mean'])
            scaler.scale_ = np.array(model['scaler']['scale'])
            if type(data) == list:
                sch = {}
                for item in data:
                    for k,v in item.items():
                        if k not in sch:
                            sch[k] = []
                        sch[k].append(v)
                data_df = pd.DataFrame(sch)
                
            else:
                data_df = pd.DataFrame([data])
            if model['target'] in data_df.columns:
                data_df = data_df.drop(columns=[model['target']])

            # One-hot encoding
            for col in data_df.columns:
                try:
                    data_df[col] = pd.to_numeric(data_df[col])
                except:
                    pass
            tmp_X = pd.get_dummies(data_df).astype(np.float64)
            frames = model['frames']
           
            tmp_X.columns = tmp_X.columns.str.lower()
            frames = [i.lower() for i in frames]
            for col in tmp_X.columns:
                if col not in frames:
                    return {"error": f"Eğitimde hiç '{col}' verisi kullanılmamış. Lütfen modelinizi güncel verilerle tekrar eğitin."}
            # Eksik sütunları 0 ile tamamla ve fazla sütunları kaldır
            for col in frames:
                if col not in tmp_X.columns:
                    tmp_X[col] = 0.0
            tmp_X = tmp_X[frames]  # Doğru sıraya sok
            # Normalize et
            tmp_X = scaler.transform(tmp_X)


            # Tahmin
            output = tmp_X.T
            for layer in network:
                output = layer.forward(output)

            # Normalize edilmiş çıktı eski haline çevrilir
            if model['max_y'] != 0:
                output = output.squeeze()
                output = output * model['max_y']

            return output.squeeze().tolist()  # Tek değer bile olsa liste olarak dön

        elif model['model_type'] == 'classification':
            classifier = Classification()  # Sınıfın bir örneğini oluştur
            weights = model['weights']['weights']
            bias = model['weights']['bias']
            
            # Scaler'ı hazırla
            scaler = StandardScaler()
            scaler.mean_ = np.array(model['scaler']['mean'])
            scaler.scale_ = np.array(model['scaler']['scale'])
            
            # Veriyi doğru formata dönüştürme
            if type(data) == list:
                sch = {}
                for item in data:
                    for k,v in item.items():
                        if k not in sch:
                            sch[k] = []
                        sch[k].append(v)
                data_df = pd.DataFrame(sch)
            else:
                data_df = pd.DataFrame([data])
            
            # Hedef değişkeni kaldır (eğer varsa)
            if model['target'] in data_df.columns:
                data_df = data_df.drop(columns=[model['target']])
            frames = model['frames']
            if model['target'] in frames:
                frames.remove(model['target'])
            # Sayısal dönüşümleri yap
            for col in data_df.columns:
                try:
                    data_df[col] = pd.to_numeric(data_df[col])
                except:
                    pass
            
            # One-hot encoding işlemi
            tmp_X = pd.get_dummies(data_df).astype(np.float64)
            
            
            # Sütun isimlerini küçült
            tmp_X.columns = tmp_X.columns.str.lower()
            frames = [i.lower() for i in frames]
            
            # Eksik sütunları kontrol et
            for col in tmp_X.columns:
                if col not in frames:
                    return {"error": f"Eğitimde hiç '{col}' verisi kullanılmamış. Lütfen modelinizi güncel verilerle tekrar eğitin."}
            
            # Eksik sütunları 0 ile doldur
            for col in frames:
                if col not in tmp_X.columns:
                    tmp_X[col] = 0.0
            
            # Sütunları doğru sıraya koy
            tmp_X = tmp_X[frames]
            # Standartlaştır
            tmp_X = scaler.transform(tmp_X)
            
            # Tahmin yap
            # Olasılıklar yerine sınıf indeksleri elde et
            
            predictions = classifier.predict(tmp_X, weights, bias)
            
            # Orijinal sınıf etiketlerine dönüştür
            predictions = classifier.map_predictions(predictions, model['mapping'])
            
            
            return predictions.tolist()
    except Exception as e:
            return {"error": "Bir hata oluştu. Veri formatınızın eğitim formatıyla aynı olduğundan emin olun. Kategorik verileriniz varsa ve çok az eğitim örneği ile eğitildiyse, boyut uyuşmazlıkları olabilir." + str(e)}



    