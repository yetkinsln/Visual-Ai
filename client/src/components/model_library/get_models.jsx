import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from '../mainPage/navbar'
import '../../styles/get_models.css';
import { useNavigate } from "react-router-dom";

const UserModels = () => {
  const [models, setModels] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchUserModels = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:3000/user_models", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setModels(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Modeller alınırken hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserModels();
  }, []);

  const handleDelete = async (modelId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:3000/user_models/${modelId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchUserModels();
    } catch (err) {
      setError(err.response?.data?.message || "Model silinirken hata oluştu.");
    }
  };

  const use_model = (model) => { 
    navigate("/work_with_model", { state: { model: model } });
  }


  const downloadModel = (model) => {
    const json = JSON.stringify(model, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const href = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = href;
    link.download = `model_${model._id}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
  };

  if (loading) {
    return <div className="loading-message">Modeller yükleniyor...</div>;
  }

  if (error) {
    return <div className="error-message">Hata: {error}</div>;
  }

  return (
    <>
    <Navbar></Navbar>
    <div className="user-models-container">
      <h2 className="title">Modellerim</h2>
      <ul className="models-list">
        {models.map((model) => (
          <li key={model._id} className="model-item">
            <div>
              <p className="model-title">{model.name}</p>
              <p className="model-create-date">
                {new Date(model.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="model-buttons">
              <button className="use-model-button"onClick={() => use_model(model)}>Kullan</button>
            <button className="download-button" onClick={() => downloadModel(model)}>
                Modeli İndir
              </button>
              <button className="delete-button" onClick={() => handleDelete(model._id)}>
                Sil
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
    </>
  );
};

export default UserModels;