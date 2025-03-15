import React, { useState, useEffect } from "react";
import NavBar from "../mainPage/navbar";
import { useLocation } from "react-router-dom";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "../../styles/train_results.css"; // CSS dosyasını içe aktar

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const TrainModel = () => {
  const [res, setRes] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const { data, algorithm, epoch, tolerance, learningRate, target, split } =
    location.state || {};

  useEffect(() => {
    const trainModel = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:8000/api/buildmodel/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data,
            algorithm,
            epoch,
            tolerance,
            learningRate,
            target,
            split,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            `HTTP error! status: ${response.status}, message: ${errorData.error}`
          );
        }

        const result = await response.json();
        setRes(result);
      } catch (err) {
        console.error("Model eğitim hatası:", err);
        setError(err.message || "Model eğitimi sırasında bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    };

    if (data) {
      trainModel();
    }
  }, [data, algorithm, epoch, tolerance, learningRate]);

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader-content">
          <div className="loader"></div>
          <p>Model eğitiliyor... Lütfen bekleyin.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <p className="error-message">Hata: {error}</p>;
  }

  if (!res) {
    return null;
  }

  const chartData = {
    labels: res.history.map((item) => item.iteration),
    datasets: [
      {
        label: "Kayıp (Loss)",
        data: res.history.map((item) => item.loss),
        fill: false,
        backgroundColor: "rgb(75, 192, 192)",
        borderColor: "rgba(75, 192, 192, 0.2)",
      },
    ],
  };

  const chartOptions = {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <>
    <NavBar></NavBar>
    <div className="train-model-container">
      <h2>Model Eğitim Sonuçları</h2>
      <div className="chart-container">
        <Line data={chartData} options={chartOptions} />
      </div>
      <div>
        <h3>Model Bilgileri</h3>
        <pre>{JSON.stringify(res, null, 2)}</pre>
      </div>
    </div></>
  );
};

export default TrainModel;