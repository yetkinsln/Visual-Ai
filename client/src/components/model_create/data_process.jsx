import { useState, useEffect } from "react";

const PreprocessCSV = ({ file }) => {
  const [processedData, setProcessedData] = useState(null);
  const [advanced, setAdvanced] = useState(false);
  const [algorithm, setAlgorithm] = useState("linear_regression");
  const [epoch, setEpoch] = useState(100);
  const [tolerance, setTolerance] = useState(0.001);
  const [learningRate, setLearningRate] = useState(0.01);

  useEffect(() => {
    if (!file) return;

    const handlePreprocess = async () => {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("http://localhost:8000/api/preprocess/", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();
        setProcessedData(result.cleaned_data);
      } catch (error) {
        console.error("Preprocessing error:", error);
      }
    };

    handlePreprocess();
  }, [file]);

  const handleAlgorithmChange = (event) => {
    setAlgorithm(event.target.value);
  };

  const handleEpochChange = (event) => {
    setEpoch(event.target.value);
  };

  const handleToleranceChange = (event) => {
    setTolerance(event.target.value);
  };

  const handleLearningRateChange = (event) => {
    setLearningRate(event.target.value);
  };

  function advancedButton() {
    setAdvanced((prev) => !prev);
  }

  return (
    <>
      {processedData ? (
        <>
          <table border="1">
            <thead>
              <tr>
                {processedData.length > 0 && typeof processedData[0] === "object" ? (
                  Object.keys(processedData[0]).map((key) => <th key={key}>{key}</th>)
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
                  <option value="logistic_regression">Lojistik Regresyon</option>
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
          <a className="dp-button" href="">
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
