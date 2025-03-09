import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const PreprocessCSV = ({ file, analyze }) => {
  const [processedData, setProcessedData] = useState(null);
  const [advanced, setAdvanced] = useState(false);
  const [algorithm, setAlgorithm] = useState("linear_regression"); // Varsayılan değer
  const [epoch, setEpoch] = useState(100);
  const [tolerance, setTolerance] = useState(0.001);
  const [learningRate, setLearningRate] = useState(0.01);
  const [loading, setLoading] = useState(false); // Yükleme durumu
  const [error, setError] = useState(null); // Hata durumu
  const navigate = useNavigate();

  useEffect(() => {
    if (!file) return;

    const handlePreprocess = async () => {
      setLoading(true);
      setError(null);
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("http://localhost:8000/api/preprocess/", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        setProcessedData(result.cleaned_data);
      } catch (err) {
        console.error("Preprocessing error:", err);
        setError("Veri işlenirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    };

    handlePreprocess();
  }, [file]);

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
    if (!algorithm || !processedData) {
      alert("Bir sorun oluştu.");
      return;
    } else {
      navigate("/train_model", {
        state: { processedData, algorithm, epoch, tolerance, learningRate },
      });
    }
  };

  if (loading) return <p>Veri işleniyor...</p>;
  if (error) return <p>Hata: {error}</p>;

  return (
    <>
      {processedData ? (
        <>
          <table border="1">
            <thead>
              <tr>
                {processedData.length > 0 &&
                typeof processedData[0] === "object" ? (
                  Object.keys(processedData[0]).map((key) => (
                    <th key={key}>{key}</th>
                  ))
                ) : (
                  <th>Veri Yok</th>
                )}
              </tr>
            </thead>
            <tbody>
              {processedData.length > 0 &&
                typeof processedData[0] === "object" &&
                processedData.slice(0, 5).map((row, index) => (
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