// src/pages/MainPage.js
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './MainPage.css';

function MainPage() {
  const [courseCardsVisible, setCourseCardsVisible] = useState(false);
  const location = useLocation(); // Хук для доступа к объекту location (URL, хеш и т.д.)

  useEffect(() => {
    // Анимация карточек при загрузке
    const timer = setTimeout(() => {
      setCourseCardsVisible(true);
    }, 300);
    return () => clearTimeout(timer); // Очистка таймера
  }, []);

  // Эффект для прокрутки к якорю, если он есть в URL при загрузке страницы
  useEffect(() => {
    if (location.hash) {
      // Убираем # из хеша, чтобы получить чистый id
      const id = location.hash.substring(1); 
      const element = document.getElementById(id);
      if (element) {
        // Небольшая задержка, чтобы элемент успел отрендериться, особенно после навигации
        const scrollTimer = setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        return () => clearTimeout(scrollTimer); // Очистка таймера прокрутки
      }
    }
  }, [location]); // Запускаем эффект при изменении location (включая изменение хеша)

  return (
    <>
      {/* Герой-секция */}
      <div className="container">
        <div className="hero-section">
          <h1 className="hero-title">
            Английский с нуля до продвинутого уровня
          </h1>
          <p className="hero-subtitle">
            Инновационная платформа для изучения английского языка с
            персонализированным подходом и отслеживанием прогресса
          </p>
          <Link to="/login" className="btn btn-hero">
            <i className="fas fa-rocket me-2"></i>Начать бесплатно
          </Link>
        </div>
      </div>

      {/* Популярные курсы (код этой секции остается без изменений) */}
      <div className="container">
        <h2 className="section-title">Популярные курсы</h2>
        <div className="row">
          {/* ...карточки курсов... */}
           {/* Курс 1 */}
           <div className="col-lg-4 col-md-6">
            <div className={`course-card ${courseCardsVisible ? 'visible' : ''}`}>
              <img
                src="https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                className="course-img"
                alt="Английский для начинающих"
              />
              <div className="course-body">
                <span className="course-level">Начальный</span>
                <h3 className="course-title">Английский для начинающих</h3>
                <p className="text-muted">
                  Основы грамматики и лексики для старта изучения языка
                </p>
                <div className="course-meta">
                  <span>
                    <i className="fas fa-book me-1"></i>24 урока
                  </span>
                  <span>
                    <i className="fas fa-user-graduate me-1"></i>2,000+
                    студентов
                  </span>
                </div>
                <Link to="/courses/beginner" className="btn btn-course">
                  <i className="fas fa-play-circle me-2"></i>Начать курс
                </Link>
              </div>
            </div>
          </div>
          {/* Курс 2 */}
          <div className="col-lg-4 col-md-6">
            <div className={`course-card ${courseCardsVisible ? 'visible' : ''}`}>
              <img
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                className="course-img"
                alt="Деловой английский"
              />
              <div className="course-body">
                <span className="course-level">Средний</span>
                <h3 className="course-title">Деловой английский</h3>
                <p className="text-muted">
                  Профессиональная коммуникация для работы и бизнеса
                </p>
                <div className="course-meta">
                  <span>
                    <i className="fas fa-book me-1"></i>18 уроков
                  </span>
                  <span>
                    <i className="fas fa-user-graduate me-1"></i>1,500+
                    студентов
                  </span>
                </div>
                 <Link to="/courses/business" className="btn btn-course">
                  <i className="fas fa-play-circle me-2"></i>Начать курс
                </Link>
              </div>
            </div>
          </div>
          {/* Курс 3 */}
          <div className="col-lg-4 col-md-6">
            <div className={`course-card ${courseCardsVisible ? 'visible' : ''}`}>
              <img
                src="https://images.unsplash.com/photo-1586773860418-d37222d8fce3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                className="course-img"
                alt="Английская грамматика"
              />
              <div className="course-body">
                <span className="course-level">Продвинутый</span>
                <h3 className="course-title">Английская грамматика</h3>
                <p className="text-muted">
                  Углубленный курс для совершенствования языка
                </p>
                <div className="course-meta">
                  <span>
                    <i className="fas fa-book me-1"></i>30 уроков
                  </span>
                  <span>
                    <i className="fas fa-user-graduate me-1"></i>1,200+
                    студентов
                  </span>
                </div>
                 <Link to="/courses/grammar" className="btn btn-course">
                  <i className="fas fa-play-circle me-2"></i>Начать курс
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Преимущества - Секция, к которой будем скроллить */}
      <div className="container">
        {/* === ДОБАВЬТЕ ИЛИ УБЕДИТЕСЬ, ЧТО ID ЗДЕСЬ === */}
        <div id="features-section-anchor" className="features-section">
          <h2 className="section-title text-center mb-5">
            Почему выбирают нас?
          </h2>
          <div className="row">
             {/* ...содержимое карточек преимуществ... */}
            <div className="col-md-4 mb-4">
              <div className="feature-card">
                <div className="feature-icon">
                  <i className="fas fa-chart-line"></i>
                </div>
                <h4 className="feature-title">Отслеживание прогресса</h4>
                <p className="feature-text">
                  Детальная статистика и визуализация ваших успехов в изучении
                  языка
                </p>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="feature-card">
                <div className="feature-icon">
                  <i className="fas fa-user-graduate"></i>
                </div>
                <h4 className="feature-title">Персонализация</h4>
                <p className="feature-text">
                  Курсы адаптируются под ваш уровень и цели изучения языка
                </p>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="feature-card">
                <div className="feature-icon">
                  <i className="fas fa-trophy"></i>
                </div>
                <h4 className="feature-title">Мотивация</h4>
                <p className="feature-text">
                  Достижения и награды за успехи в обучении поддерживают интерес
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Отзывы (код этой секции остается без изменений) */}
      <div className="container">
        <h2 className="section-title">Отзывы студентов</h2>
        <div className="row">
          {/* ...карточки отзывов... */}
          <div className="col-md-4">
            <div className="testimonial-card">
              <p className="testimonial-text">
                Платформа действительно изменила мой подход к изучению языка.
                Прогресс виден после каждого урока, а система достижений
                мотивирует заниматься регулярно.
              </p>
              <div className="testimonial-author">
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
                  alt="Анна"
                  className="author-avatar"
                />
                <div className="author-info">
                  <h5>Анна Смирнова</h5>
                  <p>Студентка, уровень B2</p>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="testimonial-card">
              <p className="testimonial-text">
                Как бизнесмену, мне было важно улучшить деловой английский.
                Курсы на этой платформе помогли мне уверенно вести переговоры с
                иностранными партнерами.
              </p>
              <div className="testimonial-author">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
                  alt="Дмитрий"
                  className="author-avatar"
                />
                <div className="author-info">
                  <h5>Дмитрий Петров</h5>
                  <p>Бизнесмен, уровень C1</p>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="testimonial-card">
              <p className="testimonial-text">
                Начал с нуля и за 6 месяцев достиг уровня B1. Удобная система
                отслеживания прогресса помогла видеть свои успехи и не
                сдаваться при трудностях.
              </p>
              <div className="testimonial-author">
                <img
                  src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
                  alt="Иван"
                  className="author-avatar"
                />
                <div className="author-info">
                  <h5>Иван Козлов</h5>
                  <p>Программист, уровень B1</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Призыв к действию */}
      <div className="container text-center my-5 py-5">
        <h2 className="section-title mx-auto mb-4">
          Начните свой путь к свободному английскому!
        </h2>
        <p className="lead mb-4">
          Присоединяйтесь к 10,000+ студентов, которые уже улучшили свой
          английский с нашей платформой
        </p>
        <Link to="/login" className="btn btn-hero px-5">
          <i className="fas fa-play-circle me-2"></i>Попробовать бесплатно
        </Link>
      </div>
    </>
  );
}

export default MainPage;