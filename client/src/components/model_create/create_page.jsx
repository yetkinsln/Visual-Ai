import NavBar from '../mainPage/navbar';
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import "../../styles/create_page.css";

const CsvUploader = () => {
  const [data, setData] = useState([]);  
  const [info, setInfo] = useState(true); 
  const [analyze, setAnalyze] = useState(""); // Problem türü
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
    const file = event.target.files[0];
    if (!file) return;

    setInfo(false);
    setFileName(file.name);
    setAnalyze(""); 

    Papa.parse(file, {
      complete: (result) => {
        setData(result.data);
      },
      header: true,
      skipEmptyLines: true
    });
  };

  // 📌 Kullanıcı özellik seçtiğinde ANALİZ YAP (butona basmadan!)
  const handleFeatureSelect = async (e) => {
    const feature = e.target.value;
    setSelectedFeature(feature);

    try {
      const response = await fetch("http://localhost:8000/api/analyze_csv/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: data,
          selectedFeature: feature
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      setAnalyze(result.problem_type || "Problem Türü Analiz Edilirken Hata Oluştu.");
    } catch (error) {
      console.error("Hata:", error);
      setAnalyze("Sunucudan cevap alınamadı.");
    }
  };

  const goToTraining = () => {
    if (!selectedFeature) {
      alert("Lütfen bir özellik seçin!");
      return;
    }
    navigate("/train", { state: { feature: selectedFeature, data: data } });
  };

  return (
    <>
      <NavBar />
      <div className="cp-body">
        <div className="cp-body-container">
          <div className="div">
            <strong className='file-title'>{fileName}</strong>

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
            <select value={selectedFeature} onChange={handleFeatureSelect}>
              <option value="" disabled>Neyi tahmin ediyoruz?</option>
              {features.map((feature) => (
                <option key={feature} value={feature}>
                  {feature}
                </option>
              ))}
            </select>

            {/* 📌 Problem türü hemen ekranda gösterilecek! */}
            {analyze && (
              <div className="analysis-result">
                <h3>Algılanan Problem Türü: <span className="problem-type">{analyze}</span></h3>
              </div>
            )}

            <button onClick={goToTraining}>Devam Et</button>
            <br />
            <small>Diğer sütunlardaki veriler kullanılarak, tahmin edilmesini istediğiniz özelliği seçmelisiniz.</small>
          </div>
        )}
      </div>
    </>
  );
};

export default CsvUploader;
