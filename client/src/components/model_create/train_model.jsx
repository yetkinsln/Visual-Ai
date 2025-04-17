import { useState, useEffect,useRef } from "react";
import NavBar from "../mainPage/navbar";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { v4 as uuidv4 } from 'uuid';
import "../../styles/train_results.css";

const TrainModel = () => {
  const [res, setRes] = useState();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modelName, setModelName] = useState("");
  const location = useLocation();
  const { data, algorithm, epoch, learningRate, target, layers } = location.state || {};
  const [channel, setChannel] = useState(null);
  const didRunRef = useRef(false);
  useEffect(() => {
    if (!data || didRunRef.current) return;
    const trainModel = async () => {
      try {
        setLoading(true);
        const newChannel = uuidv4();
        setChannel(newChannel);
  
        const response = await axios.post("http://localhost:8000/api/buildmodel/", {
          data,
          algorithm,
          epoch,
          learningRate,
          target,
          layers,
          channel: newChannel, // channel bilgisini isteğe ekle
        });
        setRes(response.data);
      } catch (err) {
        console.error("Model eğitim hatası:", err);
        setError(err.response?.data?.error || err.message || "Bilinmeyen hata oluştu.");
      } finally {
        setLoading(false);
      }
    };
  
    if (data) {
      trainModel();
      didRunRef.current = true;
    }
  }, [data, algorithm, epoch, learningRate, target, layers]);

  const cancelTraining = async () => {
    try {
      await axios.post("http://localhost:8000/api/cancel/", { channel: channel });
      alert("Eğitim iptal edildi.");
    } catch (err) {
      console.error("İptal hatası:", err);
      setError(err.response?.data?.error || err.message || "İptal işlemi başarısız oldu.");
    }
  };
  const saveLayer = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Lütfen oturum açın.");
      return;
    }

    if (!modelName) {
      setError("Lütfen model için bir isim girin.");
      return;
    }

    try {
      await axios.post(
        "http://localhost:3000/save_model",
        {
          weights: res.weights,
          name: modelName,
          testScore: res.test_score,
          model_type:res.model_type,
          scaler: res.scaler,
          max_y: res.max_y,
          target: res.target,
          columns: res.columns,
          frames: res.frames,
          mapping: res.mapping || null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Model başarıyla kaydedildi!");
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
      setError(error.response?.data?.message || "Model kaydedilirken hata oluştu.");
    }
  };

  const downloadLogs = () => {
    if (res?.weights && typeof res.weights === "object") {
      // weights ve bias verilerini JSON formatında kaydet
      const json = JSON.stringify(
        {
          weights: res.weights,
          name: modelName,
          testScore: res.test_score,
          model_type:res.model_type,
          scaler: res.scaler,
          max_y: res.max_y,
          target: res.target,
          columns: res.columns,
          frames: res.frames,
          mapping: res.mapping || null,
        },
        null,
        2
      );
  
      const element = document.createElement("a");
      const file = new Blob([json], { type: "application/json" });
      element.href = URL.createObjectURL(file);
      element.download = "model.json"; // Dosya adı değiştirildi
      document.body.appendChild(element);
      element.click();
    } else {
      console.error("Veri formatı uygun değil.");
      setError("Veriler doğru formatta değil. Lütfen tekrar deneyin.");
    }
  };
  

  const testScore = res?.test_score || 0;
  const barWidth = testScore === 0 ? "5%" : `${Math.max(testScore * 100, 10)}%`;
  const red = Math.round(255 * (1 - testScore));
  const green = Math.round(255 * testScore);
  const barColor = `rgb(${red}, ${green}, 0)`;
  const textColor = testScore === 0 ? "black" : "white";

  return (
    <>
      <NavBar />

      {(res?.error || error) && (
        <div className="error-container">
          <p>Hata: {res?.error || error}</p>
        </div>
      )}

      {loading ? (
        <div className="loader-container">
          <div className="loader-ring"></div>
          <p className="loader-p">Model eğitiliyor, lütfen bekleyin...</p>
          {channel && (
              <button className="log_download_button" onClick={cancelTraining}>
                Eğitimi İptal Et
              </button>
            )}
        
        </div>
      ) : (
        <>
          <div className="train-model-container">
            <h2>Model Eğitim Sonuçları</h2>
            <small>
              <strong style={{ color: "red" }}>Önemli: </strong>Sınıflandırma
              modellerinde grafikler, çok boyutludan 2 boyutlaya çevrilmiştir. Renk
              sapması bu yüzden normal kabul edilmelidir.
            </small>
            <hr />

            {res?.graphs && (
              <div className="plots">
                {Object.values(res.graphs).map((graph, index) => (
                  <img
                    key={index}
                    src={`data:image/png;base64,${graph}`}
                    alt={`Graph ${index + 1}`}
                  />
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
                <button className="log_download_button" onClick={downloadLogs}>
                  Modeli İndir
                </button>
                <button
                  className="log_download_button"
                  onClick={() => setIsModalOpen(true)}
                >
                  Modeli Kütüphaneme Kaydet
                </button>
              </div>
            </div>
          </div>

          {isModalOpen && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3>Model Adı Girin</h3>
                <input
                  type="text"
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  placeholder="Modelin adı"
                />
                <div className="modal-buttons">
                  <button onClick={saveLayer}>Kaydet</button>
                  <button onClick={() => setIsModalOpen(false)}>İptal</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <div className="footer">
        <p>2025 - Visual AI</p>
        <a href="#">Hakkında</a>
        <a href="#">Yapımcı Profili</a>
      </div>
    </>
  );
};

export default TrainModel;
