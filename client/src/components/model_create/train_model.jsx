import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const TrainModel = () => {
  const [res, setRes] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true); // Yükleme durumunu ekledik
  const location = useLocation();
  const { processedData, algorithm, epoch, tolerance, learningRate, target } = location.state || {};

  useEffect(() => {
    const trainModel = async () => {
      try {
        setLoading(true); // Yükleme başlangıcını belirtiyoruz
        const response = await fetch("http://localhost:8000/api/buildmodel/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ processedData, algorithm, epoch, tolerance, learningRate, target }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error}`);
        }

        const result = await response.json();
        setRes(result);
      } catch (err) {
        console.error("Model eğitim hatası:", err);
        setError(err.message || "Model eğitimi sırasında bir hata oluştu.");
      } finally {
        setLoading(false); // Yükleme bitişini belirtiyoruz
      }
    };

    if (processedData) {
      trainModel();
    }
  }, [processedData, algorithm, epoch, tolerance, learningRate]);

  if (loading) {
    return <p>Model eğitiliyor...</p>;
  }

  if (error) {
    return <p>Hata: {error}</p>;
  }

  if (!res) {
    return null; // Eğer sonuç yoksa hiçbir şey göstermiyoruz
  }

  return (
    <div>
      <pre>{JSON.stringify(res, null, 2)}</pre>
    </div>
  );
};

export default TrainModel;