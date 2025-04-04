import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/data_process.css"
const PreprocessCSV = ({ data, target }) => {
  const [advanced, setAdvanced] = useState(false);
  const [algorithm, setAlgorithm] = useState("linear_regression");
  const [epoch, setEpoch] = useState(1000);
  const [learningRate, setLearningRate] = useState(0.001);
  const [layers, setLayers] = useState([128, 64, 32]); // Varsayılan katmanlar
  const navigate = useNavigate();

  const handleAlgorithmChange = (event) => {
    setAlgorithm(event.target.value);
  };

  const handleEpochChange = (event) => {
    const epochValue = Number(event.target.value);
    if (!Number.isInteger(epochValue) || epochValue <= 0) {
      alert("Epoch değeri pozitif bir tam sayı olmalıdır!");
      return;
    }
    setEpoch(epochValue);
  };

 

  const handleLearningRateChange = (event) => {
    const learningRateValue = Number(event.target.value);
    if (isNaN(learningRateValue) || learningRateValue <= 0 || learningRateValue > 1) {
      alert("Learning rate değeri 0 ile 1 arasında olmalıdır (0 hariç)!");
      return;
    }
    setLearningRate(learningRateValue);
  };

  const toggleAdvancedSettings = () => {
    setAdvanced((prev) => !prev);
  };

  // Katman ekleme
  const addLayer = () => {
    setLayers([...layers, 32]);
  };

  // Katman kaldırma
  const removeLayer = (index) => {
    if (layers.length > 1) {
      setLayers(layers.filter((_, i) => i !== index));
    }
  };

  // Katmandaki nöron sayısını değiştirme
  const updateNeuronCount = (index, value) => {
    const updatedLayers = [...layers];
    updatedLayers[index] = value;
    setLayers(updatedLayers);
  };


  const handleTrain = () => {
    if (!algorithm || !data) {
      alert("Bir sorun oluştu.");
      return;
    } else {
      navigate("/train_model", {
        state: { data, algorithm, epoch, learningRate, target, layers },
      });
    }
  };

  return (
    <>
      {data ? (
        <>
          <div className="dp-body">
            <div className="dp-container">
      
          <a className="dp-button-2" onClick={toggleAdvancedSettings}>
            Gelişmiş Ayarlar
          </a>

          {advanced && (
            <div className="advanced-settings">
              <h3>Gelişmiş Ayarlar</h3>
              <label>Algoritma Seçin:</label>
            <select value={algorithm} onChange={handleAlgorithmChange}>
              <option value="linear_regression">Lineer Regresyon</option>
              <option value="logistic_regression">Lojistik Regresyon</option>
              <option value="decision_tree">Karar Ağaçları</option>
            </select>
              <div>
                <label>Epoch Sayısı:</label>
                <input type="number" value={epoch} onChange={handleEpochChange} min="1" />
              </div>

              <div>
                <label>Öğrenme Oranı:</label>
                <input type="number" value={learningRate} onChange={handleLearningRateChange} step="0.001" min="0" />
              </div>

              {/* Katman Ayarları */}
              <div className="layer-settings">
                <h4>Katmanlar</h4>
                {layers.map((neurons, index) => (
                  <div key={index} className="layer">
                    <label>{index + 1}. Katman:</label>
                    <input
                      type="number"
                      value={neurons}
                      onChange={(e) => updateNeuronCount(index, Number(e.target.value))}
                      min="1"
                    />
                    <button onClick={() => removeLayer(index)} disabled={layers.length === 1}>
                      Kaldır
                    </button>
                  </div>
                ))}
                <button className="layer-plus-button" onClick={addLayer}>+ Katman Ekle</button>
              </div>
            </div>
          )}

          <a className="dp-button" onClick={handleTrain}>
            Modeli Eğit
          </a>
            </div>
          </div>
        </>
      ) : (
        <p>İşlenmiş veri bekleniyor...</p>
      )}
    </>
  );
};

export default PreprocessCSV;
