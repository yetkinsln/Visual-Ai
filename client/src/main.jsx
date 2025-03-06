import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import ProtectedRoute from './components/loginAndSignup/ProtectedRoute';
import MainPage from './components/mainPage/main_page';
import SignupScreen from './components/loginAndSignup/signup';
import Login from './components/loginAndSignup/login';
import ModelCreate from './components/model_create/create_page'
import PreTrain from './components/model_create/pre_train';



createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <Routes>
        
        {/* Giriş yapmadan sadece bu sayfalara erişilebilir */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignupScreen />} />

        {/* Diğer tüm sayfalara giriş yapılmadan erişilemez */}
        <Route 
          path="/" 
          element={<ProtectedRoute><MainPage /></ProtectedRoute>} 
        />
        <Route path='/model_create' element={<ProtectedRoute><ModelCreate></ModelCreate></ProtectedRoute>}/>
        <Route path='/train' element={<ProtectedRoute><PreTrain></PreTrain></ProtectedRoute>}/>

        {/* Yanlış URL girildiğinde login sayfasına yönlendir */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  </StrictMode>
);
