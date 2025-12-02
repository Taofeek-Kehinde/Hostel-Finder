import React, { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import '../styles/reset.css';

const ResetPassword: React.FC = () => {
  const [otp, setOtp] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [, setMessage] = useState<string>('');
  const [step, setStep] = useState<'verify' | 'reset'>('verify');
  const [email, setEmail] = useState<string>('');
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get email from location state or localStorage
    const storedEmail = location.state?.email || localStorage.getItem('resetEmail');
    if (storedEmail) {
      setEmail(storedEmail);
      localStorage.setItem('resetEmail', storedEmail);
    } else {
      // If no email found, redirect back to forget password
      navigate('/forget-password');
    }
  }, [location, navigate]);

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (data.success) {
        showAlert("OTP verified successfully!", "success");
        setStep('reset');
      } else {
        showAlert(data.message || "Invalid OTP. Please try again.", "error");
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      showAlert("Server error. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      showAlert("Passwords do not match!", "error");
      setIsLoading(false);
      return;
    }

    // Validate password strength
    if (newPassword.length < 6) {
      showAlert("Password must be at least 6 characters long!", "error");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await response.json();

      if (data.success) {
        showAlert("Password reset successfully!", "success");
        
        // Clear stored email
        localStorage.removeItem('resetEmail');
        
        // Redirect to login page
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        showAlert(data.message || "Failed to reset password. Please try again.", "error");
      }
    } catch (error) {
      console.error('Reset password error:', error);
      showAlert("Server error. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        showAlert("New OTP sent to your email!", "success");
      } else {
        showAlert(data.message || "Failed to resend OTP. Please try again.", "error");
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      showAlert("Server error. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Custom Alert Function (same as in forget-password)
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

  // OTP input validation - only numbers and max 6 digits
  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
  };

  const isOtpValid = otp.length === 6;
  const isPasswordValid = newPassword.length >= 6 && newPassword === confirmPassword;

  return (
    <div className="reset-password-page">
      {/* Add Font Awesome CDN */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      
      {/* Animated Background Images */}
      <div className="reset-password-background">
        <div className="background-slide"></div>
        <div className="background-slide"></div>
        <div className="background-slide"></div>
        <div className="background-slide"></div>
        <div className="background-slide"></div>
      </div>

      {/* Reset Password Container */}
      <div className="reset-password-container">
        <h2>
          <i className="fas fa-key"></i> {step === 'verify' ? 'Verify OTP' : 'Reset Password'}
        </h2>
        
        <p className="reset-password-description">
          {step === 'verify' 
            ? 'Enter the 6-digit OTP sent to your email address.'
            : 'Enter your new password and confirm it.'}
        </p>

        {step === 'verify' ? (
          <form onSubmit={handleVerifyOtp}>
            {/* OTP Input */}
            <div className="form-group">
              <label>
                <i className="fas fa-shield-alt"></i> 6-Digit OTP:
              </label>
              <div className="input-with-icon">
                <input
                  type="text"
                  value={otp}
                  onChange={handleOtpChange}
                  required
                  placeholder="Enter 6-digit OTP"
                  disabled={isLoading}
                  maxLength={6}
                  pattern="\d{6}"
                  inputMode="numeric"
                />
                <i className="fas fa-shield-alt input-icon"></i>
              </div>
              <div className="otp-hint">
                Enter the 6-digit code sent to {email}
              </div>
            </div>

            <button 
              type="submit" 
              disabled={!isOtpValid || isLoading}
              className="verify-button"
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Verifying...
                </>
              ) : (
                <>
                  <i className="fas fa-check-circle"></i> Verify OTP
                </>
              )}
            </button>

            <div className="resend-otp">
              <p>
                Didn't receive the code?{' '}
                <button 
                  type="button" 
                  onClick={handleResendOtp}
                  disabled={isLoading}
                  className="resend-button"
                >
                  Resend OTP
                </button>
              </p>
            </div>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            {/* New Password Input */}
            <div className="form-group">
              <label>
                <i className="fas fa-lock"></i> New Password:
              </label>
              <div className="input-with-icon">
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="Enter new password"
                  disabled={isLoading}
                  minLength={6}
                />
                <i className="fas fa-lock input-icon"></i>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div className="form-group">
              <label>
                <i className="fas fa-lock"></i> Confirm Password:
              </label>
              <div className="input-with-icon">
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Confirm new password"
                  disabled={isLoading}
                  minLength={6}
                />
                <i className="fas fa-lock input-icon"></i>
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <div className="password-error">
                  <i className="fas fa-exclamation-circle"></i> Passwords do not match
                </div>
              )}
            </div>

            <button 
              type="submit" 
              disabled={!isPasswordValid || isLoading}
              className="reset-button"
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Resetting...
                </>
              ) : (
                <>
                  <i className="fas fa-sync-alt"></i> Reset Password
                </>
              )}
            </button>
          </form>
        )}

        <div className="reset-password-links">
          <p>
            <Link to="/login">
              <i className="fas fa-arrow-left"></i> Back to Login
            </Link>
          </p>
          <p>
            Remember your password? <Link to="/login">
              <i className="fas fa-sign-in-alt"></i> Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;