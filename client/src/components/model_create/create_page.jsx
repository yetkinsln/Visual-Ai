import NavBar from "../mainPage/navbar";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import "../../styles/create_page.css";

const CsvUploader = () => {
  const [file, setFile] = useState(null);
  const [data, setData] = useState([]);
  const [info, setInfo] = useState(true);
  const [analyze, setAnalyze] = useState("");
  const [fileName, setFileName] = useState("");
  const [features, setFeatures] = useState([]);
  const [selectedFeature, setSelectedFeature] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (data.length > 0) {
      setFeatures(Object.keys(data[0]));
    } else {
      setFeatures([]);
    }
  }, [data]);

  const handleFileUpload = (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    if (selectedFile.type !== "text/csv") {
      alert("Lütfen sadece CSV dosyası seçin.");
      return;
    }

    setFile(selectedFile);
    setInfo(false);
    setFileName(selectedFile.name);
    setAnalyze("");

    Papa.parse(selectedFile, {
      complete: (result) => {
        setData(result.data);
      },
      header: true,
      skipEmptyLines: true,
    });
  };
  const handleFeatureSelect = async (e) => {
    const feature = e.target.value;
    setSelectedFeature(feature);

    try {
      const response = await fetch("http://localhost:8000/api/analyze_csv/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: data,
          selectedFeature: feature,
        }),
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`HTTP Error ${response.status}: ${errorMessage}`);
      }

      const result = await response.json();
      setAnalyze(result.problem_type || `Beklenmeyen Yanıt: ${JSON.stringify(result)}`);
    } catch (err) {
      console.error("API Hata:", err);
    } finally {
    }
  };

  const goToTraining = () => {
    if (!selectedFeature) {
      alert("Lütfen bir özellik seçin!");
      return;
    }
    navigate("/train", { state: { feature: selectedFeature, data, analyze, file } });
  };

  return (
    <>
      <NavBar />
      <div className="cp-body">
        <div className="cp-body-container">
          <div className="div">
            <strong className="file-title">{fileName}</strong>

            {data.length > 0 && (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      {Object.keys(data[0]).map((key) => (
                        <th key={key}>{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.slice(0, 10).map((row, index) => (
                      <tr key={index}>
                        {Object.values(row).map((value, idx) => (
                          <td key={idx}>{value}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {info && (
              <>
                <strong>Modeli eğitmek istediğiniz CSV dosyasını seçiniz.</strong>
                <br />
                <small>İleride diğer dosya türlerine de destek sağlanacaktır.</small>
                <br />
              </>
            )}

            <label className="file-upload">
              Dosya Seç
              <input type="file" accept=".csv" onChange={handleFileUpload} />
            </label>
          </div>
        </div>

        {features.length > 0 && (
          <div className="feature-selector">
            <label>Çıktı Özelliğini Seç:</label>
            <small>
              Diğer sütunlardaki veriler kullanılarak, tahmin edilmesini istediğiniz özelliği seçmelisiniz.
            </small>
            <hr />
            <select value={selectedFeature} onChange={handleFeatureSelect}>
              <option value="" disabled>
                Neyi tahmin ediyoruz?
              </option>
              {features.map((feature) => (
                <option key={feature} value={feature}>
                  {feature}
                </option>
              ))}
            </select>

            {analyze && (
              <div className="analysis-result">
                <h3>
                  Algılanan Problem Türü: <span className="problem-type">{analyze}</span>
                </h3>
                <small>Tahminin yanlış olduğunu düşünüyorsanız, sonraki aşamada değişebilirsiniz.</small>
              </div>
            )}

            <button onClick={goToTraining}>Devam Et</button>
            {!analyze && (
              <div className="cp-gif-main">
                <img
                  src="https://i.pinimg.com/originals/6a/32/7c/6a327caa4b5c102de396a1c3aaa20e98.gif"
                  alt=""
                />
              </div>
            )}
            {analyze === "Classification" && (
              <div className="cp-gif">
                <img src="https://i.gifer.com/E3K6.gif" alt="" />
              </div>
            )}
            {analyze === "Regression" && (
              <div className="cp-gif">
                <img
                  src="https://gbhat.com/assets/gifs/polynomial_regression.gif"
                  alt=""
                />
              </div>
            )}

            {analyze === "Time Series" && (
              <div className="cp-gif">
                <img
                  src="https://miro.medium.com/max/1400/0*bCS3EWiVfLIZqwIW.gif"
                  alt=""
                />
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default CsvUploader;