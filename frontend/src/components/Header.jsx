import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBars, FaTimes, FaHome, FaInfoCircle, FaBook, FaEnvelope } from 'react-icons/fa';
import './Header.css';

const Header = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleHomeClick = (e) => {
    if (location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    closeMobileMenu();
  };

  const handleSmoothScroll = (e) => {
    e.preventDefault();
    const href = e.currentTarget.getAttribute('href');
    const targetId = href.replace(/.*#/, '');

    if (targetId) {
      const elem = document.getElementById(targetId);
      if (elem) {
        elem.scrollIntoView({
          behavior: 'smooth',
        });
      }
    } else {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
    closeMobileMenu();
  };

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <nav className="main-nav">
        <Link to="/" className="logo" onClick={closeMobileMenu}>
          <img src="" alt="travel booking" className="logo-image" />
        </Link>
        
        <button 
          className="mobile-menu-btn" 
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
        
        <ul className={isMobileMenuOpen ? 'active' : ''}>
          <li>
            <Link to="/" onClick={handleHomeClick}>
              <FaHome className="nav-icon" />
              <span>Home</span>
            </Link>
          </li>
          <li>
            <Link to="/#about" onClick={handleSmoothScroll}>
              <FaInfoCircle className="nav-icon" />
              <span>About</span>
            </Link>
          </li>
          <li>
            <Link to="/#courses" onClick={handleSmoothScroll}>
              <FaBook className="nav-icon" />
              <span>Courses</span>
            </Link>
          </li>
          <li>
            <Link to="/#contact" onClick={handleSmoothScroll}>
              <FaEnvelope className="nav-icon" />
              <span>Contact</span>
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
