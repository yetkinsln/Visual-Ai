import { useState, useEffect } from "react";
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
import "../../styles/train_results.css";

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
  }, [data, algorithm, epoch, tolerance, learningRate,target,split]);

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
    return (
      <div className="error-container">
        <p className="error-message">Hata: {error}</p>
      </div>
    );
  }

  if (!res) {
    return null;
  }

  let chartData = null;
  let chartData_v = null;

  if (res && res.history && Array.isArray(res.history)) {
    chartData = {
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
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
    plugins: {
      title: {
        display: true,
        text: "Eğitim Kayıp Grafiği",
        font: {
          size: 16,
        },
      },
    },
  };

  const downloadLogs = () => {
    if (res && res.history && Array.isArray(res.history)) {
      const csv = convertToCSV(res.history);
      const element = document.createElement("a");
      const file = new Blob([csv], { type: "text/csv" });
      element.href = URL.createObjectURL(file);
      element.download = "model_egitim_loglari.csv";
      document.body.appendChild(element);
      element.click();
    }
  };
  
  const convertToCSV = (data) => {
    const header = Object.keys(data[0]).join(",");
    const rows = data.map((item) => Object.values(item).join(","));
    return `${header}\n${rows.join("\n")}`;
  };

  if (res && res.history && Array.isArray(res.history)) {
    chartData_v = {
      labels: res.history.map((item) => item.iteration),
      datasets: [
        {
          label: "Validation Loss",
          data: res.history.map((item) => item.validation_loss),
          fill: false,
          backgroundColor: "rgb(87, 75, 192)",
          borderColor: "rgba(75, 192, 192, 0.2)",
        },
      ],
    };
  }

  const chartOptions_v = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
    plugins: {
      title: {
        display: true,
        text: "Validasyon Kayıp Grafiği",
        font: {
          size: 16,
        },
      },
    },
  };

  const testScore = res?.test_score || 0;
  const barWidth = testScore === 0 ? "10px" : `${testScore * 100}%`;
  const red = Math.round(255 * (1 - testScore));
  const green = Math.round(255 * testScore);
  const barColor = `rgb(${red}, ${green}, 0)`;
  const textColor = testScore === 0 ? "black" : "white";
  


  return (
    <>
      <NavBar />
      <div className="train-model-container">
        <h2>Model Eğitim Sonuçları</h2>
       <small> <strong style={{"color": "red"}}>Önemli: </strong>Grafikler, çok boyutludan 2 boyutluya çevrilmiştir. Renk sapması bu yüzden normal kabul edilmelidir.</small>
        <hr />
{chartData && (
        <div className="tm-container">
          
            <div className="chart-container-2">
              <Line data={chartData} options={chartOptions} />
            </div>
         
          {chartData_v && (
            <div className="chart-container">
              <Line data={chartData_v} options={chartOptions_v} />
            </div>
          )}
        </div>
 )}

{res.graphs && (
  <div className="plots">
    {Object.values(res.graphs).map((graph, index) => (
      <img key={index} src={`data:image/png;base64,${graph}`} alt={`Graph ${index + 1}`} />
    ))}
  </div>
)}

        <div>
        <h3 className="test_title">Test Doğruluk Skoru</h3>
          <div className="test-score-bar-container">
            
          <div
  className="test-score-bar"
  style={{ width: barWidth, backgroundColor: barColor, color: textColor }}
>
  {testScore.toFixed(4)}
</div>

          </div>
          <div className="log_download_button_container">
          <button className="log_download_button" onClick={downloadLogs}>Log Dosyalarını İndir</button>
          </div>
          <h3>Model Bilgileri</h3>
          <pre>{JSON.stringify(res, null, 2)}</pre>
        </div>
      </div>
    </>
  );
};

export default TrainModel;