import { useLocation } from "react-router-dom";
import { useState } from "react";
import "../../styles/work_with_model.css";
import Navbar from "../mainPage/navbar";
import Papa from "papaparse";
import { saveAs } from "file-saver";

const WorkWithModel = () => {
  const location = useLocation();
  const { model } = location.state;

  const [inputs, setInputs] = useState({});
  const [result, setResult] = useState(null);
  const [data, setData] = useState({});
  const [file, setFile] = useState(null);

  const handleChange = (e, column) => {
    setInputs({
      ...inputs,
      [column]: e.target.value
    });
  };
    const handleFileUpload = (event) => {
      const selectedFile = event.target.files[0];
      if (!selectedFile) return;
  
      if (selectedFile.type !== "text/csv") {
        alert("Lütfen sadece CSV dosyası seçin.");
        return;
      }
  
      setFile(selectedFile);

  
      Papa.parse(selectedFile, {
        complete: (result) => {
          setData(result.data);
        },
        header: true,
        skipEmptyLines: true,
      });
    };
  const Predict = async () => {
    // Tüm model sütunlarına göre eksik alanları doldur
    const parsedInputs = {};
    model.columns.forEach(column => {
      if (column !== model.target) {
        const value = inputs[column];
        parsedInputs[column] = isNaN(value) ? value : parseFloat(value);
      }
    });

    const token = localStorage.getItem("token");
    const response = await fetch("http://localhost:8000/api/predict/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        model: model,
        data: parsedInputs,
      }),
    });

    const data = await response.json();
    setResult(data);
  };
 // file-saver kullanımı

  const handleFilePredict = async () => {
    const token = localStorage.getItem("token");
    console.log(model)
    const response = await fetch("http://localhost:8000/api/predict/", {
      
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        model: model,
        data: data,
      }),
    });
  
    const result = await response.json();
  
    // Eğer hata varsa sadece sonucu göster
    if (result.error) {
      setResult(result);
      return;
    }
  
    // Eğer result bir listeyse: data + tahminleri birleştir
    const predictions = Array.isArray(result) ? result : [result];
    const targetName = model.target || "prediction";
    const merged = data.map((item, idx) => ({
      ...item,
      [targetName]: predictions[idx],
    }));
  
    // merged'i CSV'ye çevir ve indir
    const csvContent = convertToCSV(merged);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "predictions.csv");
  
    setResult(merged);
  };
  const convertToCSV = (arr) => {
    if (arr.length === 0) return "";
  
    const keys = Object.keys(arr[0]);
    const header = keys.join(",");
    const rows = arr.map((obj) =>
      keys.map((key) => `"${obj[key]}"`).join(",")
    );
  
    return [header, ...rows].join("\n");
  };
  
  return (
    <>
      <Navbar />
      <h3 className="wwm-model-name">Current Model: <strong>{model.name}</strong> </h3>
      <div className="wwm-body">
        <div className="wwm-page-container">
          <div className="wwm-form-section">
            <h2 className="wwm-form-title">Single Input Form</h2>
            <form onSubmit={(e) => e.preventDefault()}>
              {model.columns.map((column, index) => (
                column !== model.target && (
                  <div key={index} className="wwm-form-field">
                    <label htmlFor={column} className="wwm-form-label">{column}</label>
                    <input
                      type="text"
                      id={column}
                      value={inputs[column] || ""}
                      onChange={(e) => handleChange(e, column)}
                      className="wwm-form-input"
                    />
                  </div>
                )
              ))}
              <button type="submit" className="wwm-form-button" onClick={Predict}>Predict</button>
            </form>
          </div>
          <div className="wwm-upload-file">
            <label className="wwm-file-upload">
              Or Choose File
              <input className="wwm-upload-input" type="file" accept=".csv" onChange={handleFileUpload}/>
              {file && <><button className="wwm-pd" onClick={handleFilePredict}>Predict & Download File</button> <label htmlFor="">{file.name}</label></> }
            </label>
            
          </div>
          <div className="wwm-result-section">
           <small>Result</small> <h3>{model.target}</h3>
            <pre>{result ? JSON.stringify(result, null, 2) : "Henüz veri yok"}</pre>
          </div>
        </div>
      </div>
    </>
  );
};

export default WorkWithModel;
