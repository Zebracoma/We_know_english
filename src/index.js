// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Ваши глобальные стили
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from './contexts/AuthContext';
import { BrowserRouter } from 'react-router-dom'; // Если App.js не оборачивает в Router

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter> {/* Оборачиваем здесь, если App.js этого не делает */}
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
reportWebVitals();