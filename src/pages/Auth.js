import React, { useState, useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import './Auth.css';

function Auth() {
  const { login, user } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const initialForm = queryParams.get('form') || 'login';
  const [formType, setFormType] = useState(initialForm);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ 
      ...formData, 
      [e.target.name]: e.target.value 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = formType === 'signup' 
      ? 'http://localhost:3317/auth/signup'
      : 'http://localhost:3317/auth/login';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        alert(`✅ ${formType === 'signup' ? 'Registrazione' : 'Login'} riuscito!`);

        localStorage.setItem('token', data.token);
        login({ ...data.user, token: data.token });

        navigate('/dashboard');
      } else {
        alert(data.message || 'Errore');
      }
    } catch (err) {
      console.error(err);
      alert('Errore di rete');
    }
  };

  return (
    <div className="auth-container">
      <h1>{formType === 'signup' ? ' Registrati' : ' Accedi'}</h1>

      <div className="form-toggle">
        <button 
          className={formType === 'login' ? 'active' : ''} 
          onClick={() => setFormType('login')}
        >
          Login
        </button>
        <button 
          className={formType === 'signup' ? 'active' : ''} 
          onClick={() => setFormType('signup')}
        >
          Signup
        </button>
      </div>

      <form onSubmit={handleSubmit} className="auth-form">
        {formType === 'signup' && (
          <input 
            type="text" 
            name="username" 
            placeholder="Username" 
            onChange={handleChange} 
            required 
          />
        )}
        <input 
          type="email" 
          name="email" 
          placeholder="Email" 
          onChange={handleChange} 
          required 
        />
        <input 
          type="password" 
          name="password" 
          placeholder="Password" 
          onChange={handleChange} 
          required 
        />
        <button type="submit">
          {formType === 'signup' ? 'Registrati' : 'Accedi'}
        </button>
      </form>
    </div>
  );
}

export default Auth;
