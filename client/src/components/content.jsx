import "../styles/content.css";

const MainContent = (props) => {
  return (
    <>
      <div className="container">
        <div className="create-model">
          <div className="card">
            <img
              src="https://cdn-icons-gif.flaticon.com/10971/10971776.gif"
              className="content-img"
              alt="Model oluşturma ikonu"
            />
            <strong className="content-title">Create a Model</strong>
            <p>Load data and create a new model.</p>
            <a href="/model_create" className="content-button">
              Create
            </a>
          </div>
        </div>
        <div className="my-models">
          <div className="card">
            <img
              src="https://cdn-icons-gif.flaticon.com/6172/6172505.gif"
              className="content-img"
              alt="Modellerim ikonu"
            />
            <strong className="content-title">My Models</strong>
            <p>Browse through your saved models.</p>
            <a href="/my_models" className="content-button">
              Models
            </a>
          </div>
        </div>
        <div className="upload-model">
          <div className="card">
            <img
              src="https://www.kulrtechnology.com/wp-content/uploads/2022/08/cloud-network.gif"
              className="content-img"
              alt="Model yükleme ikonu"
            />
            <strong className="content-title">Upload a Model</strong>
            <p>Load a model you trained and test it.</p>
            <a href="/upload_model" className="content-button">
              Upload
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default MainContent;