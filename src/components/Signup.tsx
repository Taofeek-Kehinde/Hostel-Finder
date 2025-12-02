import React, { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import '../styles/signup.css';



const Signup: React.FC = () => {
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [role, setRole] = useState<'student' | 'agent'>('student');
  const [agreedTerms, setAgreedTerms] = useState<boolean>(false);

const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();


  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();

    // Check if passwords match
    if (password !== confirmPassword) {
      showAlert('Passwords do not match!');
      return;
    }

    // Check if terms agreed
    if (!agreedTerms) {
      showAlert('You must agree to the Terms and Conditions to proceed.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          password,
          confirmPassword,
          role,
        }),
      });

      const data = await response.json();

      if (data.success) {
        showAlert('Signup successful!');
        navigate('/Login', { state: { role } });
      } else {
        showAlert(data.message || 'Signup failed!');
      }
    } catch (error) {
      console.error('Signup error:', error);
      showAlert('An error occurred during signup. Please try again.');
    }
  };

  // Check if all required fields are filled
  const isFormValid = fullName && email && password && confirmPassword && agreedTerms;

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
    <div className="login-page">
      {/* Add Font Awesome CDN */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      
      {/* Animated Background Images */}
      <div className="login-background">
        <div className="background-slide"></div>
        <div className="background-slide"></div>
        <div className="background-slide"></div>
        <div className="background-slide"></div>
        <div className="background-slide"></div>
      </div>

      {/* Login Container */}
      <div className="signup-container">
        <h2>
          <i className="fas fa-user-plus"></i> Sign Up
        </h2>
        <form onSubmit={handleLogin}>
          <div className="form-row">
            <div className="form-group">
              <label>
                <i className="fas fa-user"></i> Full Name:
              </label>
              <div className="input-with-icon">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="Enter your full name"
                />
                <i className="fas fa-user input-icon"></i>
              </div>
            </div>

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
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>
                <i className="fas fa-phone"></i> Phone Number:
              </label>
              <div className="input-with-icon">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                />
                <i className="fas fa-phone input-icon"></i>
              </div>
            </div>

            <div className="form-group">
              <label>
                <i className="fas fa-user-tag"></i> Role:
              </label>
              <div className="input-with-icon">
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'student' | 'agent')}
                >
                  <option value="student">Student</option>
                  <option value="agent">Agent</option>
                </select>
                <i className="fas fa-chevron-down input-icon"></i>
              </div>
            </div>
          </div>

         <div className="form-row">
  <div className="form-group">
    <label>Password:</label>
    <div className="input-with-icon">
      <input
        type={showPassword ? "text" : "password"}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        placeholder="Enter your password"
      />
      <span
        className="input-icon eye-icon"
        onClick={() => setShowPassword(!showPassword)}
        style={{ cursor: "pointer" }}
      >
        {showPassword ? <FaEyeSlash /> : <FaEye />}
      </span>
    </div>
  </div>

  <div className="form-group">
    <label>Confirm Password:</label>
    <div className="input-with-icon">
      <input
        type={showConfirmPassword ? "text" : "password"}
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
        placeholder="Confirm your password"
      />
      <span
        className="input-icon eye-icon"
        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
        style={{ cursor: "pointer" }}
      >
        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
      </span>
    </div>
  </div>
</div>

          <div className="form-group full-width checkbox-group">
            <input
              type="checkbox"
              checked={agreedTerms}
              onChange={(e) => setAgreedTerms(e.target.checked)}
              required
            />
            <label className="checkbox-label">
           I agree to the <Link to="/terms">Terms and Conditions</Link> and <Link to="/privacy">Privacy Policy</Link>
            </label>
          </div>

          <button type="submit" disabled={!isFormValid}>
            <i className="fas fa-user-plus"></i> Sign Up
          </button>
        </form>

        <p>
          Already have an account? <Link to="/login">
            <i className="fas fa-sign-in-alt"></i> Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;