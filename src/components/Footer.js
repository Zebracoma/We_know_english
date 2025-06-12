// src/components/Footer.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="row"> {/* Этот row будет выравнивать колонки */}
          {/* Первая колонка футера */}
          <div className="col-lg-4 col-md-6 mb-4 mb-lg-0">
            <h4 className="footer-title">We know English</h4>
            <p>
              Инновационная платформа для изучения английского языка с
              персонализированным подходом и отслеживанием прогресса
            </p>
          </div>

          {/* Вторая колонка футера (Связаться с нами) - СДЕЛАЕМ ЕЕ ШИРЕ */}
          <div className="col-lg-4 col-md-6 mb-4 mb-lg-0"> {/* Было col-lg-2, стало col-lg-4 */}
            <h4 className="footer-title">Связаться с нами</h4>
            <div className="footer-links">
              <p>Наша почта: Weallknowenglish@gmail.com</p> {/* Можно сделать так */}
              <p>По всем вопросам оплаты: +79787139746 (Мария)</p>
              <p>Консультация по образовательным программам: +79780946922 (Давид)</p>
            </div>
          </div>

          {/* Третья колонка футера (Поддержка) */}
          <div className="col-lg-4 col-md-6"> {/* Уже было col-lg-4 */}
            <h4 className="footer-title">Поддержка</h4>
            <div className="footer-links">
              <Link >Помощь</Link>
              <Link >FAQ</Link>
              <Link >Условия использования</Link>
              <Link >Политика конфиденциальности</Link>
            </div>
          </div>
        </div> {/* Конец .row */}

        <div className="copyright">
          © {new Date().getFullYear()} We know English. Все права защищены.
        </div>
      </div> {/* Конец .container */}
    </footer>
  );
}

export default Footer;