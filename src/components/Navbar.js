// src/components/Navbar.js
import React from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleAboutClick = (e) => {
    e.preventDefault(); // Отменяем стандартное поведение тега <a>
    const targetId = 'features-section-anchor'; // ID нашей целевой секции

    // Если мы уже на главной странице ('/')
    if (location.pathname === '/') {
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Если мы на другой странице, переходим на главную и добавляем хеш якоря
      // MainPage.js затем обработает этот хеш и прокрутит к элементу
      navigate(`/#${targetId}`);
    }
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
            <li className="nav-item">
              {/* Используем тег <a> с обработчиком onClick и href для семантики/fallback */}
              <a 
                className="nav-link" 
                href="/#features-section-anchor" 
                onClick={handleAboutClick}
              >
                О нас
              </a>
            </li>
            <li className="nav-item ms-lg-2 mt-2 mt-lg-0">
              <Link to="/login" className="btn btn-login">
                <i className="fas fa-user me-2"></i>Войти
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;