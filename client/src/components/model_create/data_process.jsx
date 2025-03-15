import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const PreprocessCSV = ({ data, target }) => {
  const [advanced, setAdvanced] = useState(false);
  const [algorithm, setAlgorithm] = useState("linear_regression"); // Varsayılan değer
  const [epoch, setEpoch] = useState(1000);
  const [split, setSplit] = useState(0.8);
  const [tolerance, setTolerance] = useState(0.00001);
  const [learningRate, setLearningRate] = useState(0.25);
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
  const handleSplitChange = (event) => {
    const splitValue = Number(event.target.value);
    if (isNaN(splitValue) || splitValue <= 0 || splitValue > 1) {
      alert("Eğitim/Test verisi oranı 0 ile 1 arasında olmalıdır (0 hariç)!");
      return;
    }
    setSplit(splitValue);
  };

  const handleToleranceChange = (event) => {
    const toleranceValue = Number(event.target.value);
    if (isNaN(toleranceValue) || toleranceValue < 0) {
      alert("Tolerance değeri pozitif bir sayı olmalıdır!");
      return;
    }
    setTolerance(toleranceValue);
  };

  const handleLearningRateChange = (event) => {
    const learningRateValue = Number(event.target.value);
    if (isNaN(learningRateValue) || learningRateValue <= 0 || learningRateValue > 1) {
      alert("Learning rate değeri 0 ile 1 arasında olmalıdır (0 hariç)!");
      return;
    }
    setLearningRate(learningRateValue);
  };

  const advancedButton = () => {
    setAdvanced((prev) => !prev);
  };

  const handleTrain = () => {
    if (!algorithm || !data) {
      alert("Bir sorun oluştu.");
      return;
    } else {
      navigate("/train_model", {
        state: { data, algorithm, epoch, tolerance, learningRate, target, split },
      });
    }
  };


  return (
    <>
      {data ? (
        <>
          <table border="1">
            <thead>
              <tr>
                {data.length > 0 &&
                typeof data[0] === "object" ? (
                  Object.keys(data[0]).map((key) => (
                    <th key={key}>{key}</th>
                  ))
                ) : (
                  <th>Veri Yok</th>
                )}
              </tr>
            </thead>
            <tbody>
              {data.length > 0 &&
                typeof data[0] === "object" &&
                data.slice(0, 5).map((row, index) => (
                  <tr key={index}>
                    {Object.values(row).map((value, idx) => (
                      <td key={idx}>{value}</td>
                    ))}
                  </tr>
                ))}
            </tbody>
          </table>

          <a className="dp-button-2" onClick={advancedButton}>
            Gelişmiş Ayarlar
          </a>

          {advanced && (
            <div className="advanced-settings">
              <h3>Gelişmiş Ayarlar</h3>
              <div>
                <label>Algoritma Seçin:</label>
                <select value={algorithm} onChange={handleAlgorithmChange}>
                  <option value="linear_regression">Lineer Regresyon</option>
                  <option value="logistic_regression">
                    Lojistik Regresyon
                  </option>
                  <option value="decision_tree">Karar Ağaçları</option>
                </select>
              </div>
              <div>
                <label>Epoch Sayısı:</label>
                <input
                  type="number"
                  value={epoch}
                  onChange={handleEpochChange}
                  min="1"
                />
              </div>
              <div>
                <label>Tolerans:</label>
                <input
                  type="number"
                  value={tolerance}
                  onChange={handleToleranceChange}
                  step="0.001"
                  min="0"
                />
              </div>
              <div>
                <label>Öğrenme Oranı:</label>
                <input
                  type="number"
                  value={learningRate}
                  onChange={handleLearningRateChange}
                  step="0.001"
                  min="0"
                />
              </div>
              <div>
                <label>Eğitim/Test Verisi Oranı Sayısı(0-1, Eğitim Oranı=):</label>
                <input
                  type="number"
                  value={split}
                  onChange={handleSplitChange}
                  step="0.001"
                  max="1"
                  min="0"
                />
              </div>
            </div>
          )}
          <a className="dp-button" onClick={handleTrain}>
            Modeli Eğit
          </a>
        </>
      ) : (
        <p>İşlenmiş veri bekleniyor...</p>
      )}
    </>
  );
};

export default PreprocessCSV;