// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import apiService from '../services/apiService';
import { useNavigate } from 'react-router-dom'; // Для перенаправления

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // Информация о пользователе
    const [isLoading, setIsLoading] = useState(true); // Загрузка начального состояния
    const [error, setError] = useState(null); // Ошибки аутентификации
    const navigate = useNavigate();

    // Функция для загрузки данных пользователя, если есть токен
    const fetchUser = useCallback(async () => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            try {
                // Предполагаемый эндпоинт для получения данных текущего пользователя
                // В вашем Swagger может быть /users/me или аналогичный
                const userData = await apiService.get('/users/me'); // Адаптируйте URL
                setUser(userData); // Убедитесь, что userData содержит нужные поля
            } catch (err) {
                console.error("Failed to fetch user:", err);
                // Если токен невалиден (даже после попытки refresh в apiService), выходим
                if (err.status === 401) {
                    logout(false); // Не перенаправляем, если это просто фоновая проверка
                } else {
                   setError("Не удалось загрузить данные пользователя.");
                }
            }
        }
        setIsLoading(false);
    }, []);

    // Проверка аутентификации при загрузке приложения
    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    const login = async (credentials) => {
        setIsLoading(true);
        setError(null);
        try {
            // Ваш эндпоинт для логина: POST /users (из Swagger) или /auth/login или /token
            // FastAPI часто использует OAuth2PasswordRequestForm, где данные передаются как form-data, а не JSON
            // Если так, apiService нужно доработать или использовать FormData
            // Для примера, предполагаем, что API принимает JSON и возвращает токены и user
            
            // Если ваш API ожидает form-data (как в OAuth2PasswordRequestForm):
            const formData = new FormData();
            formData.append('username', credentials.email); // FastAPI OAuth2PasswordRequestForm обычно ждет 'username'
            formData.append('password', credentials.password);

            const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/login`, { // Адаптируйте URL и BASE_URL
                method: 'POST',
                body: formData, // Отправляем как form-data
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: "Login failed" }));
                throw new Error(errorData.detail || "Login failed");
            }
            const data = await response.json(); // { access_token, token_type, refresh_token (опционально), user (опционально) }
            
            localStorage.setItem('accessToken', data.access_token);
            if (data.refresh_token) {
                localStorage.setItem('refreshToken', data.refresh_token);
            }

            // Если API возвращает данные пользователя сразу при логине:
            if(data.user) {
                setUser(data.user);
            } else {
                // Иначе, загружаем данные пользователя отдельно
                await fetchUser(); // Загружаем пользователя после установки токена
            }
            setIsLoading(false);
            navigate('/profile'); // Перенаправление после успешного входа
            return true;
        } catch (err) {
            console.error("Login failed:", err);
            setError(err.message || "Ошибка входа. Проверьте данные.");
            setIsLoading(false);
            return false;
        }
    };

    const register = async (userData) => {
        setIsLoading(true);
        setError(null);
        try {
            // Ваш эндпоинт для регистрации: POST /users (из Swagger) или /api/register
            // Ожидает: name, email, password, level
            // В вашей модели User: username, email, password_hash, first_name, last_name, role, level
            // Сопоставьте поля!
            const apiUserData = {
                username: userData.email, // Или генерировать username из email/name
                email: userData.email,
                password: userData.password, // Бэкенд должен хешировать
                first_name: userData.name.split(' ')[0] || userData.name, // Пример
                last_name: userData.name.split(' ').slice(1).join(' ') || '', // Пример
                level: userData.level || 'beginner', // Уровень по умолчанию
                // role: 'student' - обычно устанавливается на бэкенде
            };
            const registeredUser = await apiService.post('/users', apiUserData); // Адаптируйте URL
            
            // После успешной регистрации, обычно нужно залогиниться
            // или API может сразу вернуть токены
            // Если API не возвращает токены, то:
            // setError("Регистрация успешна! Теперь вы можете войти.");
            // navigate('/login'); // или сразу на вкладку логина

            // Если API возвращает токены при регистрации (как в вашем test_api.py для /api/register):
            if (registeredUser.access_token) {
                 localStorage.setItem('accessToken', registeredUser.access_token);
                 if (registeredUser.refresh_token) {
                     localStorage.setItem('refreshToken', registeredUser.refresh_token);
                 }
                 setUser(registeredUser.user); // Предполагаем, что API возвращает user
                 navigate('/profile');
            } else {
                // Если токены не возвращаются, перенаправляем на логин
                // или показываем сообщение об успешной регистрации
                console.log("Registration successful, please log in.", registeredUser);
                // Тут можно либо автоматически залогинить пользователя, либо перенаправить на страницу входа
                // Для простоты, попробуем залогинить
                await login({ email: userData.email, password: userData.password });
            }
            setIsLoading(false);
            return true;
        } catch (err) {
            console.error("Registration failed:", err);
            setError(err.message || "Ошибка регистрации.");
            setIsLoading(false);
            return false;
        }
    };

    const logout = useCallback((shouldNavigate = true) => {
        setUser(null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        if (shouldNavigate) {
            navigate('/login');
        }
    }, [navigate]);

    const value = {
        user,
        isLoading,
        error,
        login,
        register,
        logout,
        fetchUser, // Экспортируем для возможности обновить данные пользователя
        isAuthenticated: !!user, // Удобный флаг
        setError // Для сброса ошибок извне, если нужно
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};