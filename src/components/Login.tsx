import React, { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/login.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const navigate = useNavigate();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phone, password }),
      });

      const data = await response.json();

      if (data.success) {
        showAlert('Login successful!', 'success');

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        setTimeout(() => {
          navigate('/home');
        }, 1000);
      } else {
        showAlert(data.message || 'Login failed!', 'error');
      }
    } catch (error) {
      console.error('Login error:', error);
      showAlert('An error occurred during login. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = email && password;

  function showAlert(message: string, type: 'success' | 'error' = 'success') {
    const alertBox = document.createElement('div');
    alertBox.textContent = message;
    alertBox.style.position = 'fixed';
    alertBox.style.top = '20px';
    alertBox.style.right = '20px';
    alertBox.style.padding = '15px 20px';
    alertBox.style.fontFamily = 'Poppins, sans-serif';
    alertBox.style.fontSize = '14px';
    alertBox.style.fontWeight = '500';
    alertBox.style.color = '#333';
    alertBox.style.background = '#fff';
    alertBox.style.borderLeft = `5px solid ${type === 'error' ? '#f44336' : '#4CAF50'}`;
    alertBox.style.borderRadius = '8px';
    alertBox.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    alertBox.style.zIndex = '9999';
    alertBox.style.opacity = '0';
    alertBox.style.transform = 'translateX(100%)';
    alertBox.style.transition = 'all 0.4s ease';

    document.body.appendChild(alertBox);

    requestAnimationFrame(() => {
      alertBox.style.opacity = '1';
      alertBox.style.transform = 'translateX(0)';
    });

    setTimeout(() => {
      alertBox.style.opacity = '0';
      alertBox.style.transform = 'translateX(100%)';
      setTimeout(() => alertBox.remove(), 400);
    }, 3000);
  }

  return (
    <div className="login-page">
      {/* FontAwesome Icons */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />

      {/* Background */}
      <div className="login-background">
        <div className="background-slide"></div>
        <div className="background-slide"></div>
        <div className="background-slide"></div>
        <div className="background-slide"></div>
        <div className="background-slide"></div>
      </div>

      {/* Container */}
      <div className="login-container">
        <h2>
          <i className="fas fa-sign-in-alt"></i> Login
        </h2>

        <form onSubmit={handleLogin}>

          {/* EMAIL */}
          <div className="form-group">
            <label>
              <i className="fas fa-envelope"></i> Email:
            </label>
            <div className="input-with-icon">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
              />
              <i className="fas fa-envelope input-icon"></i>
            </div>
          </div>

          {/* PHONE */}
          <div className="form-group">
            <label>
              <i className="fas fa-phone"></i> Phone:
            </label>
            <div className="input-with-icon">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone (optional)"
              />
              <i className="fas fa-phone input-icon"></i>
            </div>
          </div>

          {/* PASSWORD WITH EYE ICON */}
          <div className="form-group">
            <label>
              <i className="fas fa-eye"></i> Password:
            </label>

            <div className="input-with-icon" style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
              />

              {/* CLICKABLE EYE ICON */}
              <i
                className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"}
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  cursor: "pointer", // inline pointer
                  fontSize: "18px",
                  color: "#7f8c8d",
                  zIndex: 10,
                }}
              ></i>
            </div>
          </div>

          {/* Remember Me */}
          <div className="form-group checkbox-group">
            <input type="checkbox" id="rememberMe" />
            <label className="checkbox-label" htmlFor="rememberMe">
              Remember me
            </label>
          </div>

          <button type="submit" disabled={!isFormValid || isLoading}>
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Logging in...
              </>
            ) : (
              <>
                <i className="fas fa-sign-in-alt"></i> Login
              </>
            )}
          </button>
        </form>

        {/* Links */}
        <div className="login-links">
          <p>
            <Link to="/forget">
              <i className="fas fa-key"></i> Forgot Password?
            </Link>
          </p>

          <p>
            Don't have an account?{' '}
            <Link to="/">
              <i className="fas fa-user-plus"></i> Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
