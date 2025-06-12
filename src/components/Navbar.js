// src/components/Navbar.js
import React from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const handleAboutClick = (e) => {
    e.preventDefault();
    const targetId = 'features-section-anchor';

    if (location.pathname === '/') {
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(`/#${targetId}`);
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="navbar navbar-expand-lg">
      <div className="container">
        <Link className="navbar-brand" to="/">
          <i className="fas fa-language me-2"></i>
          We know English
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNavGlobal"
          aria-controls="navbarNavGlobal"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span
            className="navbar-toggler-icon"
            style={{
              backgroundImage:
                "url('data:image/svg+xml;charset=utf8,%3Csvg viewBox=\\'0 0 30 30\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cpath stroke=\\'rgba%28255, 255, 255, 0.8%29\\' stroke-width=\\'2\\' stroke-linecap=\\'round\\' stroke-miterlimit=\\'10\\' d=\\'M4 7h22M4 15h22M4 23h22\\'/%3E%3C/svg%3E')",
            }}
          ></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNavGlobal">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <NavLink className="nav-link" to="/" end>
                Главная
              </NavLink>
            </li>
            {isAuthenticated && (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/courses">
                    Курсы
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/profile">
                    Мой прогресс
                  </NavLink>
                </li>
              </>
            )}
            <li className="nav-item">
              <a 
                className="nav-link" 
                href="/#features-section-anchor" 
                onClick={handleAboutClick}
              >
                О нас
              </a>
            </li>
            <li className="nav-item ms-lg-2 mt-2 mt-lg-0">
              {isAuthenticated ? (
                <div className="dropdown">
                  <button 
                    className="btn btn-login dropdown-toggle" 
                    type="button" 
                    data-bs-toggle="dropdown" 
                    aria-expanded="false"
                  >
                    <i className="fas fa-user me-2"></i>
                    {user?.first_name || user?.username || 'Профиль'}
                  </button>
                  <ul className="dropdown-menu">
                    <li>
                      <Link className="dropdown-item" to="/profile">
                        <i className="fas fa-user me-2"></i>Профиль
                      </Link>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button className="dropdown-item" onClick={handleLogout}>
                        <i className="fas fa-sign-out-alt me-2"></i>Выйти
                      </button>
                    </li>
                  </ul>
                </div>
              ) : (
                <Link to="/login" className="btn btn-login">
                  <i className="fas fa-user me-2"></i>Войти
                </Link>
              )}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Navbar;