// src/App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Импорты компонентов
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PrivateRoute from './components/PrivateRoute';

// Импорты страниц
import LoginPage from './pages/LoginPage';
import MainPage from './pages/MainPage';
import ProfilePage from './pages/ProfilePage';
import CoursesPage from './pages/CoursesPage';
import ExercisePage from './pages/ExercisePage';

// Стили
import './App.css';

function App() {
  return (
    <div className="app-wrapper">
      <Navbar />
      <main className="main-content">
        <Routes>
          {/* Публичные маршруты */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<MainPage />} />
          
          {/* Защищенные маршруты */}
          <Route element={<PrivateRoute />}>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/courses" element={<CoursesListPage />} />
            <Route path="/courses/:courseId" element={<CoursesPage />} />
            <Route path="/lessons/:lessonId/exercises" element={<ExercisePage />} />
          </Route>
          
          {/* 404 страница */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

// Простая страница списка курсов
const CoursesListPage = () => {
  return (
    <div className="container my-5">
      <h1>Список курсов</h1>
      <p>Здесь будет отображаться список всех доступных курсов.</p>
      {/* TODO: Реализовать загрузку и отображение курсов */}
    </div>
  );
};

// Простая 404 страница
const NotFoundPage = () => {
  return (
    <div className="container my-5 text-center">
      <h1>404</h1>
      <p>Страница не найдена</p>
    </div>
  );
};

export default App;