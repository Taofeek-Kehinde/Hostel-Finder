import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/home.css';

const Home: React.FC = () => {
  const [displayedText, setDisplayedText] = useState<string>('');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [showContent, setShowContent] = useState<boolean>(true);
  const navigate = useNavigate();
  const typingTimeoutRef = useRef<number | null>(null);
  const totalTimeoutRef = useRef<number | null>(null);

  const aboutText = `Welcome to Hostel - Your Ultimate Student Accommodation Solution!

At Hostle, we understand the challenges students face when searching for the perfect place to call home during their academic journey. Our platform bridges the gap between students and quality accommodation providers.

🌟 Key Features:
• Find verified hostels and apartments
• Connect directly with accommodation agents
• Secure booking system
• Real-time availability updates
• Student-friendly pricing

Our mission is to make student housing search seamless, secure, and stress-free. Whether you're a student looking for your next home or an agent managing properties, Hostle provides the perfect platform for all your accommodation needs.

Thank you for choosing Hostle - Where Students Find Their Perfect Home! 🏠`;

  const totalDuration = 10000; 
  const typingInterval = totalDuration / aboutText.length;

  // Get user role and determine redirect path
  const getUserRedirectPath = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.role === 'agent' ? '/agent' : '/index';
    } catch (error) {
      console.error('Error parsing user data:', error);
      return '/index'; // Default to student page if error
    }
  };

  // Typing effect
  useEffect(() => {
    if (currentIndex < aboutText.length) {
      typingTimeoutRef.current = window.setTimeout(() => {
        setDisplayedText(aboutText.substring(0, currentIndex + 1));
        setCurrentIndex(prev => prev + 1);
      }, typingInterval);
    }
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [currentIndex, aboutText, typingInterval]);

  // Automatic redirect after 10s
  useEffect(() => {
    const redirectPath = getUserRedirectPath();
    
    totalTimeoutRef.current = window.setTimeout(() => {
      setShowContent(false);
      navigate(redirectPath);
    }, totalDuration);

    return () => {
      if (totalTimeoutRef.current) clearTimeout(totalTimeoutRef.current);
    };
  }, [navigate]);

  // Skip button
  const handleSkip = () => {
    // Clear both timeouts to prevent double navigation
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (totalTimeoutRef.current) clearTimeout(totalTimeoutRef.current);

    const redirectPath = getUserRedirectPath();
    setShowContent(false);
    navigate(redirectPath);
  };

  const progressPercent = Math.min((currentIndex / aboutText.length) * 100, 100);

  return (
    <div className="about-page">
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />

      <div className="about-background">
        {[...Array(5)].map((_, idx) => (
          <div key={idx} className="background-slide"></div>
        ))}
      </div>

      <div className={`about-container ${showContent ? 'visible' : 'hidden'}`}>
        <div className="about-header">
          <h2>
            <i className="fas fa-info-circle"></i> About Hostel Founder
          </h2>
          <div className="skip-button-container">
            <button onClick={handleSkip} className="skip-button">
              <i className="fas fa-forward"></i> Skip Intro
            </button>
          </div>
        </div>

        <div className="typing-container">
          <div className="typing-text">
            {displayedText}
            <span className="cursor">|</span>
          </div>
        </div>

        <div className="about-progress">
          <div
            className="progress-bar"
            style={{
              width: `${progressPercent}%`,
              backgroundColor: '#2ecc71'
            }}
          ></div>
          <div className="progress-text">
            {`Loading... ${Math.round(progressPercent)}%`}
          </div>
        </div>

        <div className="about-features">
          <div className="feature-item">
            <i className="fas fa-home"></i>
            <span>Student Accommodation</span>
          </div>
          <div className="feature-item">
            <i className="fas fa-shield-alt"></i>
            <span>Verified Properties</span>
          </div>
          <div className="feature-item">
            <i className="fas fa-bolt"></i>
            <span>Instant Booking</span>
          </div>
        </div>

        {/* Show user role info */}
        <div className="user-role-info">
          <div className="role-badge">
            <i className="fas fa-user-tag"></i>
            <span>
              Logged in as: {(() => {
                try {
                  const user = JSON.parse(localStorage.getItem('user') || '{}');
                  return user.role === 'agent' ? 'Agent' : 'Student';
                } catch {
                  return 'Student';
                }
              })()}
            </span>
          </div>
          <div className="redirect-info">
            <small>
              Redirecting to {getUserRedirectPath() === '/agent' ? 'Agent Dashboard' : 'Student Portal'}...
            </small>
          </div>
        </div>
      </div>

      <div className="countdown-timer">
        <div className="timer-circle">
          <svg width="60" height="60" viewBox="0 0 44 44">
            <circle
              cx="22"
              cy="22"
              r="20"
              fill="none"
              stroke="#3498db"
              strokeWidth="3"
              strokeDasharray="125.6"
              strokeDashoffset={125.6 * (1 - progressPercent / 100)}
              transform="rotate(-90 22 22)"
            />
          </svg>
          <div className="timer-text">
            {Math.ceil((totalDuration - (progressPercent / 100) * totalDuration) / 1000)}s
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;