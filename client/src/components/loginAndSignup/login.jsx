import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../mainPage/navbar';
import '../../styles/login.css';

const LoginScreen = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
  
    console.log("Frontend'de Saklanan Token:", token);

    if (token) {
      navigate('/');
    }
  }, [navigate]);

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        navigate('/');
      } else {
        setErrorMessage(data.message || 'Kullanıcı adı veya şifre yanlış.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const signup = (event) => {
    event.preventDefault();
    navigate('/signup');
  };

  return (
    <>
      <NavBar />
      <div className="login-header">
        <h1>Welcome to Visual AI!</h1>
        <small>Please login or sign up</small>
        <hr />
        <br />
      </div>
      <div className="login-container">
        <form onSubmit={handleSubmit} className="login-form">
          <label htmlFor="login_username">User Name </label>
          <input
            type="text"
            name="username"
            id="login_username"
            value={formData.username}
            onChange={handleChange}
          />

          <label htmlFor="login_password">Password </label>
          <input
            type="password"
            name="password"
            id="login_password"
            value={formData.password}
            onChange={handleChange}
          />
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          {loading ? (
            <p>Giriş yapılıyor...</p>
          ) : (
            <button type="submit">Login</button>
          )}
          <span>
            Do you have not an account yet?
            <button type="button" onClick={signup}>
              Sign up
            </button>
          </span>
        </form>
      </div>
    </>
  );
};

export default LoginScreen;