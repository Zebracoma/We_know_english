// src/pages/CoursesPage.js
import React from 'react';
import { Link } from 'react-router-dom'; // Если уроки - это внутренние маршруты
import './CoursesPage.css'; // Импортируем наши стили

const CoursesPage = () => {
    // Данные для уроков (в реальном приложении это может приходить из API или состояния)
    const lessons = [
        { 
            id: 1, 
            title: "Урок 1: Алфавит и звуки", 
            duration: "5 мин", 
            icon: "fa-play", 
            link: "/lessons/1", // Пример ссылки для React Router
            isLocked: false 
        },
        { 
            id: 2, 
            title: "Урок 2: Приветствия и знакомство", 
            duration: "7 мин", 
            icon: "fa-play", 
            link: "/lessons/2", 
            isLocked: false 
        },
        { 
            id: 3, 
            title: "Урок 3: Глагол \"to be\"", 
            duration: "10 мин", 
            icon: "fa-play", 
            link: "/lessons/3", 
            isLocked: false 
        },
        { 
            id: 4, 
            title: "Урок 4: Простые числа и цвета", 
            duration: "8 мин", 
            icon: "fa-lock", 
            link: null, // Нет ссылки для заблокированного урока
            isLocked: true 
        },
    ];

    return (
        <div className="container my-5">
            {/* Герой-секция курса */}
            <div className="course-hero text-center text-lg-start">
                <div className="row align-items-center">
                    <div className="col-lg-8">
                        <h1 className="display-4">Английский для начинающих</h1>
                        <p className="lead my-3">
                            Начните изучать английский с простыми пошаговыми уроками. Вы освоите основы грамматики, лексики, произношения и многое другое.
                        </p>
                        {/* 
                          Если первый урок - это React-компонент, используйте Link. 
                          Если это просто HTML-страница (что маловероятно в SPA), оставьте <a>.
                        */}
                        <Link to="/lessons/1" className="btn btn-hero mt-3">
                            <i className="fas fa-play-circle me-2"></i>Начать обучение
                        </Link>
                    </div>
                </div>
            </div>

            {/* Прогресс */}
            <div className="progress-card my-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <h5 className="mb-0">Ваш прогресс</h5>
                    <span className="fw-bold text-primary">Шаг 2 из 8 (20%)</span> {/* Эти данные можно сделать динамическими */}
                </div>
                <div className="progress" style={{ height: '12px' }}>
                    <div 
                        className="progress-bar bg-primary" 
                        role="progressbar" 
                        style={{ width: '20%' }} 
                        aria-valuenow="20" 
                        aria-valuemin="0" 
                        aria-valuemax="100"
                    ></div>
                </div>
                <p className="text-muted mt-2 mb-0">Уровень: Начинающий</p>
            </div>

            {/* Табы и программа курса */}
            <div className="tabs-card">
                <ul className="nav nav-tabs" id="courseTab" role="tablist">
                    <li className="nav-item" role="presentation">
                        <button 
                            className="nav-link active" 
                            id="program-tab" 
                            data-bs-toggle="tab" 
                            data-bs-target="#program" 
                            type="button"
                            role="tab"
                            aria-controls="program"
                            aria-selected="true"
                        >
                            <i className="fas fa-list-ul me-2"></i>Программа
                        </button>
                    </li>
                    <li className="nav-item" role="presentation">
                        <button 
                            className="nav-link" 
                            id="reviews-tab" 
                            data-bs-toggle="tab" 
                            data-bs-target="#reviews" 
                            type="button"
                            role="tab"
                            aria-controls="reviews"
                            aria-selected="false"
                        >
                            <i className="fas fa-star me-2"></i>Отзывы
                        </button>
                    </li>
                </ul>
                <div className="tab-content pt-4" id="courseTabContent">
                    <div className="tab-pane fade show active" id="program" role="tabpanel" aria-labelledby="program-tab">
                        <h3 className="mb-4">Уроки курса</h3>
                        <div className="list-group list-group-flush">
                            {lessons.map(lesson => (
                                lesson.isLocked ? (
                                    <div 
                                        key={lesson.id}
                                        className="list-group-item d-flex justify-content-between align-items-center p-3 mb-2 lesson-list-item text-muted"
                                    >
                                        <div className="d-flex align-items-center">
                                            <div className="lesson-icon me-3" style={{ background: '#6c757d' }}>
                                                <i className={`fas ${lesson.icon} fa-lg`}></i>
                                            </div>
                                            <div>
                                                <h6 className="mb-0">{lesson.title}</h6>
                                                <small>{lesson.duration}</small>
                                            </div>
                                        </div>
                                        <i className="fas fa-lock"></i>
                                    </div>
                                ) : (
                                    <Link 
                                        key={lesson.id}
                                        to={lesson.link} 
                                        className="list-group-item list-group-item-action d-flex justify-content-between align-items-center p-3 mb-2 lesson-list-item"
                                    >
                                        <div className="d-flex align-items-center">
                                            <div className="lesson-icon me-3">
                                                <i className={`fas ${lesson.icon} fa-lg`}></i>
                                            </div>
                                            <div>
                                                <h6 className="mb-0 fw-bold">{lesson.title}</h6>
                                                <small className="text-muted">{lesson.duration}</small>
                                            </div>
                                        </div>
                                        <i className="fas fa-arrow-right text-primary"></i>
                                    </Link>
                                )
                            ))}
                        </div>
                    </div>
                    <div className="tab-pane fade" id="reviews" role="tabpanel" aria-labelledby="reviews-tab">
                        <h3 className="mb-4">Отзывы студентов</h3>
                        <p>Здесь будут отображаться отзывы о курсе...</p>
                        {/* Сюда можно будет добавить компонент для отображения отзывов */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CoursesPage;