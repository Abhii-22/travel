import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

const Home = () => (
  <div className="home-container">
    <div className="hero-section">
      <div className="hero-content">
        <h1 className="hero-title">Welcome to Travel Booking</h1>
        <p className="hero-subtitle">Your journey starts here - Book your Bus or Car easily with our service</p>
        
        <div className="booking-buttons">
          <Link to="/bus" className="booking-btn bus-btn">
            <div className="btn-icon">🚌</div>
            <div className="btn-content">
              <h3>Bus Booking</h3>
              <p>Book bus tickets for your journey</p>
            </div>
          </Link>
          
          <Link to="/car" className="booking-btn car-btn">
            <div className="btn-icon">🚗</div>
            <div className="btn-content">
              <h3>Car Booking</h3>
              <p>Rent a car for your travel needs</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
    
    <div className="features-section">
      <div className="features-container">
        <h2>Why Choose Us?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">⭐</div>
            <h3>Best Prices</h3>
            <p>Get competitive rates for all your travel needs</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Secure Booking</h3>
            <p>Safe and secure payment options</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>Easy to Use</h3>
            <p>Simple and intuitive booking experience</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>24/7 Support</h3>
            <p>Round the clock customer assistance</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default Home;
