// src/App.js
import React from 'react';
// Импортируем только Routes и Route из react-router-dom, так как BrowserRouter будет в index.js
import { Routes, Route } from 'react-router-dom'; 

// Импорты ваших компонентов
import Navbar from './components/Navbar';         // Убедитесь, что путь правильный
import Footer from './components/Footer';         // Убедитесь, что путь правильный
import PrivateRoute from './components/PrivateRoute'; // Убедитесь, что путь правильный

// Импорты ваших страниц
import LoginPage from './pages/LoginPage';       // Убедитесь, что путь правильный
import MainPage from './pages/MainPage';         // Убедитесь, что путь правильный
import ProfilePage from './pages/ProfilePage';     // Убедитесь, что путь правильный
import CoursesPage from './pages/CoursesPage';     // Убедитесь, что путь правильный
import ExercisePage from './pages/ExercisePage';   // Убедитесь, что путь правильный
// import AboutPage from './pages/AboutPage';      // Раскомментируйте, если есть такая страница
// import NotFoundPage from './pages/NotFoundPage';// Раскомментируйте, если есть такая страница

// Стили для App компонента
import './App.css'; // Если есть файл App.css для общих стилей обертки

function App() {
  return (
    // <AuthProvider> и <Router> теперь находятся в src/index.js и оборачивают этот компонент <App />
    <div className="app-wrapper"> {/* Ваша основная обертка приложения */}
      <Navbar /> {/* Navbar будет рендериться на всех страницах */}
      <main className="main-content"> {/* Основной контейнер для контента страниц */}
        <Routes> {/* Обертка для всех маршрутов */}
          {/* Публичные маршруты */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<MainPage />} />
          {/* <Route path="/about" element={<AboutPage />} /> */}
          
          {/* Защищенные маршруты (оборачиваются в PrivateRoute) */}
          <Route element={<PrivateRoute />}>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/courses/:courseId" element={<CoursesPage />} />
            <Route path="/lessons/:lessonId/exercises" element={<ExercisePage />} />
            {/* Добавьте здесь другие защищенные маршруты, если они нужны */}
            {/* Например:
                <Route path="/settings" element={<SettingsPage />} />
            */}
          </Route>
          
          {/* Маршрут для страницы "Не найдено" (404) - должен быть последним, если раскомментирован */}
          {/* <Route path="*" element={<NotFoundPage />} /> */}
        </Routes>
      </main>
      <Footer /> {/* Footer будет рендериться на всех страницах */}
    </div>
  );
}

export default App;