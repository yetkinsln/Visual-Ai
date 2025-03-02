import {React, useEffect, useState} from 'react';

import { useNavigate } from 'react-router-dom';
import NavBar from '../mainPage/navbar';
import '../../styles/signup.css';

const SignupScreen = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            navigate('/'); // Kullanıcı giriş yaptıysa dashboard'a yönlendir
        }
    }, [navigate]);


    const [errorMessage, setErrorMessage] = useState("");

    async function handleSignup(event) {
        event.preventDefault();
        setErrorMessage("");
        const formData = new FormData(event.target);
        const userData = {
            username: formData.get("username"),
            email: formData.get("email"),
            password: formData.get("password"),
        };

        try {
            const response = await fetch("http://localhost:3000/users/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userData),
            });

            if (response.ok) {
                navigate("/login");
            } else {
                const errorData = await response.json();
                setErrorMessage(errorData.message);
            }
        } catch (error) {
            console.log(`${error.message} ermsg`)
            console.error("Signup error:", error);
            
            
            alert("An error occurred. Please try again.");
        }
    }

    return (
        <>
            <NavBar />
            <div className="signup-header">
                <h1>Create an Account</h1>
                <small>Sign up to get started</small>
                <hr />
                <br />
            </div>
            <div className='signup-container'>
                <form className='signup-form' onSubmit={handleSignup}>
                    <label htmlFor="signup_username">User Name</label>
                    <input type="text" name="username" id="signup_username" required />

                    <label htmlFor="signup_email">Email</label>
                    <input type="email" name="email" id="signup_email" required />

                    <label htmlFor="signup_password">Password</label>
                    <input type="password" name="password" id="signup_password" required />
                    {errorMessage && <p className="error-message">{errorMessage}</p>} {/* Hata mesajını göster */}

                    <button type="submit">Sign Up</button>
                    <span>
                        Already have an account?  
                        <button type="button" className="login-btn" onClick={() => navigate('/login')}>Login</button>
                    </span>
                </form>
            </div>
        </>
    );
}

export default SignupScreen;
