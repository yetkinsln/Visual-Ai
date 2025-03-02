import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NavBar from '../mainPage/navbar'
import '../../styles/login.css'

const LoginScreen = () => {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({ username: '', password: '' })
    const [errorMessage, setErrorMessage] = useState("");
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            navigate('/'); // Eğer giriş yapıldıysa başka sayfaya yönlendir
        }
    }, [navigate]);


    function handleChange(event) {
        setFormData({ ...formData, [event.target.name]: event.target.value })
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrorMessage("");
        const formData = new FormData(event.target);
        const loginData = {
            username: formData.get("username"),
            password: formData.get("password"),
        };
    
        try {
            const response = await fetch("http://localhost:3000/users/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(loginData),
            });
    
            const data = await response.json();;
            setErrorMessage(data.message)
            if (response.ok) {
                localStorage.setItem("token", data.token); // Kullanıcıyı oturumda tut
                navigate("/"); // Kullanıcıyı yönlendir
            }
        } catch (error) {
            console.error("Login error:", error);
            alert("An error occurred. Please try again.");
        }
    };
    

    function signup(event) {
        event.preventDefault()
        navigate('/signup')
    }

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
                    <input type="text" name="username" id="login_username" onChange={handleChange} />

                    <label htmlFor="login_password">Password </label>
                    <input type="password" name="password" id="login_password" onChange={handleChange} />
                    {errorMessage && <p className="error-message">{errorMessage}</p>} {/* Hata mesajını göster */}
                    <button type="submit">Login</button>
                    <span>
                        Do you have not an account yet?
                        <button type="button" onClick={signup}>Sign up</button>
                    </span>
                </form>
            </div>
        </>
    )
}

export default LoginScreen
