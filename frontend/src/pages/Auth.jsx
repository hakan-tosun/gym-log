import React, { useState } from 'react';
import axios from 'axios';

const Auth = ({ setToken }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isLogin) {
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);
        
        const response = await axios.post('https://logym-api.onrender.com/login', formData);
        const token = response.data.access_token;
        
        localStorage.setItem('logym_token', token);
        localStorage.setItem('logym_username', username);
        setToken(token);
      } else {
        await axios.post('https://logym-api.onrender.com/register', {
          username: username,
          password: password
        });
        
        alert("Kayıt başarılı! Şimdi giriş yapabilirsiniz.");
        setIsLogin(true);
        setPassword('');
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Bir hata oluştu.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">LOGYM</h1>
        <h2 className="auth-subtitle">{isLogin ? 'Giriş Yap' : 'Kayıt Ol'}</h2>
        
        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <input 
            type="text" 
            placeholder="Kullanıcı Adı" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required 
            className="auth-input"
          />
          <input 
            type="password" 
            placeholder="Şifre" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            className="auth-input"
          />
          <button type="submit" className="auth-button">
            {isLogin ? 'Giriş' : 'Kayıt Ol'}
          </button>
        </form>

        <p className="auth-switch">
          {isLogin ? "Hesabın yok mu? " : "Zaten hesabın var mı? "}
          <span onClick={() => { setIsLogin(!isLogin); setError(''); }}>
            {isLogin ? "Kayıt Ol" : "Giriş Yap"}
          </span>
        </p>
      </div>
    </div>
  );
};

export default Auth;