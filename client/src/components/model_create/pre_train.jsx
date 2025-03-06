import { useLocation } from 'react-router-dom';
import React from 'react';

const Train = () => {
  const location = useLocation();
  const { feature, data, analyze } = location.state || {}; // Eğer state boşsa hata almamak için varsayılan boş obje veriyoruz
  if (!feature || !data || !analyze) {
    return <h2>Veri yüklenemedi! Lütfen tekrar deneyin.</h2>;
  }

  return (
    <div>
      <h1>Model Eğitimi {analyze}</h1>
      <h2>Seçilen Özellik: {feature}</h2>
      <h3>Yüklenen Veri:</h3>
      <table border="1">
        <thead>
          <tr>
            {Object.keys(data[0]).map((key) => (
              <th key={key}>{key}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.slice(0, 5).map((row, index) => (
            <tr key={index}>
              {Object.values(row).map((value, idx) => (
                <td key={idx}>{value}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Train;
