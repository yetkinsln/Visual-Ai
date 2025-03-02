import NavBar from '../mainPage/navbar'
import { useNavigate } from 'react-router-dom';

import React, { useState, useEffect } from "react";
import Papa from "papaparse";

import "../../styles/create_page.css";

const CsvUploader = () => {
  const [data, setData] = useState([]);
  const [info, setInfo] = useState(true);
  const [fileName, setFileName] = useState("");
  const [features, setFeatures] = useState([]);
  const [selectedFeature, setSelectedFeature] = useState("")
  const navigate = useNavigate();

  useEffect(() => {
    setFeatures([])
    if (data.length > 0) {
      setFeatures(Object.keys(data[0])); 
    }
  }, [data]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
    setInfo(false)
    setFileName(file.name)
      Papa.parse(file, {
        complete: (result) => {
          setData(result.data);
        },
        header: true,
      });
    }
  };

  const handleFeatureSelect = () => { // ✅ event kaldırıldı
    if (selectedFeature) {
      navigate("/train", { state: { feature: selectedFeature } });
    } else {
      alert("Lütfen bir özellik seçin!");
    }
  };
  

  return (
  
  <>
  <NavBar></NavBar>
  <div className="cp-body">
    

    <div className="cp-body-container">
      
      <div className="div">
      {/* Dosya Yükleme Butonu */}
      <strong className='file-title'>{fileName}</strong>

      {/* Tablo Gösterme */}
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
      )}{info && (<><strong>Modeli eğitmek istediğiniz csv dosyasını seçiniz.</strong><br></br>
      <small>İleride diğer dosya türlerine de destek sağlanacaktır.</small><br></br></>)}
      
       <label className="file-upload">
        Dosya Seç
        <input type="file" accept=".csv" onChange={handleFileUpload} />
      </label>
      </div>
    </div> 
    {features.length > 0 && (
          <div className="feature-selector">
            <label>Çıktı Özelliğini Seç:</label>
            <select 
              value={selectedFeature} 
              onChange={(e) => setSelectedFeature(e.target.value)}
            >
              <option value="" disabled>Neyi tahmin ediyoruz ?</option>
              {features.map((feature) => (
                <option key={feature} value={feature}>
                  {feature}
                </option>
              ))}
            </select>
            <button onClick={handleFeatureSelect}>Devam Et</button>
            <br />
            <small>Diğer sütunlardaki veriler kullanılarak, tahmin edilmesini istediğiniz özelliği seçmelisiniz.</small>
          </div>
        )}
     </div></>
  );
};

export default CsvUploader;
