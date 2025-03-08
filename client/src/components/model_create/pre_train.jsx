import { useLocation } from "react-router-dom";
import Navbar from "../mainPage/navbar";
import Dataprocess from "./data_process"
import React from "react";
import '../../styles/pre_train.css'


const Train = () => {
  const location = useLocation();
  const { feature, data, analyze, file } = location.state || {};

  // Hata kontrolü: Eksik veri veya boş dizi olup olmadığını kontrol ediyoruz
  if (!feature || !data || !analyze || !Array.isArray(data) || data.length === 0) {
    return <h2>Bir sorun oluştu. Veri yüklenemedi.</h2>;
  }

  return (
    <>
  
      <Navbar />
    <div className="pt-body">
      <div className="pt-body-1">

      <h1>Problem Türü</h1>
      <small>Problem türünün yanlış analiz edildiğini düşünüyorsanız değiştirebilirsiniz.</small>
      <select defaultValue={analyze}>
        {["Regression", "Classification", "Time Series"].map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
      </div>
    
     

      <div className="pt-body-2">

      <h2>Seçilen Özellik: <strong>{feature}</strong></h2>
      <h3>Yüklenen Veri Önizlemesi</h3>
      <table border="1">
        <thead>
          <tr>
            {data.length > 0 && typeof data[0] === "object" ? (
              Object.keys(data[0]).map((key) => <th key={key}>{key}</th>)
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
    
      </div>
      <div className="pt-body-3">
        <h3>İşlenen Veri Önizlemesi</h3>
        <small>Boş veriler düzeltildi, tüm veriler numerik değere çevrildi, normalize edildi.</small>
      <Dataprocess file={file}></Dataprocess>
      </div>
     
    </div> </>
  );
};

export default Train;
