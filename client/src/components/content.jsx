import "../styles/content.css";

const MainContent = () => {
  return (
    <>
      <div className="container">
        <div className="create-model">
          <div className="card">
            <div className="img-container">
            <div className="card-img-txt">
            <strong className="content-title">Create a Model</strong>
            </div>
            <img
              src="https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExazQ1ZXptajJzZzJiaWF3NHNxeWd2aGFramFkbnlnZXFkZTEzOGhnNCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3ov9jJikNnrKktK1Wg/giphy.gif"
              className="content-img"
              alt="Model oluşturma ikonu"
            />
            </div>
            
            <p>Load data and create a new model.</p>
            <a href="/model_create" className="content-button">
              Start
            </a>
          </div>
        </div>
        <div className="my-models">
          <div className="card">
          <div className="img-container">
            <div className="card-img-txt">
            <strong className="content-title">My Models</strong>
            </div>
            <img
              src="https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExMmZhMGI4bTRjeDFsbDhnaTZhNmRiODJ2aGRycmN0MHFzcHR3cGdwbSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/z46A9gomCzIZWdOrYy/giphy.gif"
              className="content-img"
              alt="Model Library"
            />
            </div>
            <p>Browse through your saved models.</p>
            <a href="/user_models" className="content-button">
              Model Library
            </a>
          </div>
        </div>
        <div className="upload-model">
          <div className="card">
            <div className="img-container">
            <div className="card-img-txt">
            <strong className="content-title">How do I use ?</strong>
            </div>
            <img
              src="https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExMmwwYWxzM3FwNzV4MGkxdnFic3Q4Y3ZtZjBiNjVka3hoMHhsaHNvNSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/lKaeQAunM3hZaqsOpj/giphy.gif"
              className="content-img"
              alt="Image"
            />
            </div>
            <p>Learn how to use this platform.</p>
            <a href="/upload_model" className="content-button">
              Begin
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default MainContent;