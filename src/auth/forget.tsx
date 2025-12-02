import React, { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/forget.css';


const ForgetPassword: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const navigate = useNavigate();

 const handleResetPassword = async (e: FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  setMessage('');

  const API_URL = import.meta.env.VITE_API_URL;
  try {
    const response = await fetch(`${API_URL}/api/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (data.success) {
      showAlert("OTP has been sent to your email!", "success");

      // Store email in localStorage and navigate to reset page
      localStorage.setItem('resetEmail', email);
      
      // Redirect to reset password page
      setTimeout(() => {
        navigate('/reset', { state: { email } });
      }, 1000);

    } else {
      showAlert(data.message || "Failed to send OTP. Try again.", "error");
    }

  } catch (error) {
    console.error('Reset password error:', error);
    showAlert("Server error. Try again.", "error");
  } finally {
    setIsLoading(false);
  }
};

  // Check if email is valid
  const isFormValid = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);


  // Custom Alert Function
function showAlert(message: string, type: "success" | "error" = "success") {
  const alertBox = document.createElement("div");
  alertBox.textContent = message;
  alertBox.style.position = "fixed";
  alertBox.style.top = "20px";
  alertBox.style.right = "20px";
  alertBox.style.padding = "15px 20px";
  alertBox.style.fontFamily = "Poppins, sans-serif";
  alertBox.style.fontSize = "14px";
  alertBox.style.fontWeight = "500";
  alertBox.style.color = "#333";
  alertBox.style.background = "#fff";
  alertBox.style.borderLeft = `5px solid ${type === "error" ? "#f44336" : "#4CAF50"}`;
  alertBox.style.borderRadius = "8px";
  alertBox.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
  alertBox.style.zIndex = "9999";
  alertBox.style.opacity = "0";
  alertBox.style.transform = "translateX(100%)";
  alertBox.style.transition = "all 0.4s ease";

  document.body.appendChild(alertBox);

  requestAnimationFrame(() => {
    alertBox.style.opacity = "1";
    alertBox.style.transform = "translateX(0)";
  });

  setTimeout(() => {
    alertBox.style.opacity = "0";
    alertBox.style.transform = "translateX(100%)";
    setTimeout(() => alertBox.remove(), 400);
  }, 3000);
}



  return (
    <div className="forget-password-page">
      {/* Add Font Awesome CDN */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      
      {/* Animated Background Images */}
      <div className="forget-password-background">
        <div className="background-slide"></div>
        <div className="background-slide"></div>
        <div className="background-slide"></div>
        <div className="background-slide"></div>
        <div className="background-slide"></div>
      </div>

      {/* Reset Password Container */}
      <div className="forget-password-container">
        <h2>
          <i className="fas fa-key"></i> Reset Password
        </h2>
        
        <p className="forget-password-description">
          Enter your email address and we'll send you instructions to reset your password.
        </p>

        <form onSubmit={handleResetPassword}>
          {/* Email Input */}
          <div className="form-group">
            <label>
              <i className="fas fa-envelope"></i> Email Address:
            </label>
            <div className="input-with-icon">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your registered email"
                disabled={isLoading}
              />
              <i className="fas fa-envelope input-icon"></i>
            </div>
          </div>

          {/* Message Display */}
          {message && (
            <div className={`message ${message.includes('success') ? 'message-success' : 'message-error'}`}>
              {message}
            </div>
          )}

          <button 
            type="submit" 
            disabled={!isFormValid || isLoading}
            className="reset-button"
          >
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Sending...
              </>
            ) : (
              <>
                <i className="fas fa-paper-plane"></i> Send Reset Instructions
              </>
            )}
          </button>
        </form>

        <div className="forget-password-links">
          <p>
            <Link to="/login">
              <i className="fas fa-arrow-left"></i> Back to Login
            </Link>
          </p>
          <p>
            Don't have an account? <Link to="/">
              <i className="fas fa-user-plus"></i> Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgetPassword;