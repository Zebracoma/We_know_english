// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import apiService from '../services/apiService';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Функция для загрузки данных пользователя
    const fetchUser = useCallback(async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setIsLoading(false);
            return;
        }

        try {
            const userData = await apiService.get('/users/me');
            setUser(userData);
        } catch (err) {
            console.error("Failed to fetch user:", err);
            if (err.status === 401) {
                // Токен невалиден, очищаем и не показываем ошибку
                logout(false);
            } else {
                setError("Не удалось загрузить данные пользователя.");
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Проверка аутентификации при загрузке приложения
    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    const login = async (credentials) => {
        setIsLoading(true);
        setError(null);
        
        try {
            // Создаем FormData для OAuth2PasswordRequestForm
            const formData = new FormData();
            formData.append('username', credentials.email);
            formData.append('password', credentials.password);

            const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/login`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: "Ошибка входа" }));
                throw new Error(errorData.detail || "Неверные учетные данные");
            }

            const data = await response.json();
            
            // Сохраняем токены
            localStorage.setItem('accessToken', data.access_token);
            if (data.refresh_token) {
                localStorage.setItem('refreshToken', data.refresh_token);
            }

            // Загружаем данные пользователя
            await fetchUser();
            
            navigate('/profile');
            return true;
        } catch (err) {
            console.error("Login failed:", err);
            setError(err.message || "Ошибка входа. Проверьте данные.");
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (userData) => {
        setIsLoading(true);
        setError(null);
        
        try {
            const apiUserData = {
                username: userData.email,
                email: userData.email,
                password: userData.password,
                first_name: userData.name.split(' ')[0] || userData.name,
                last_name: userData.name.split(' ').slice(1).join(' ') || '',
                level: userData.level || 'beginner',
            };

            const response = await apiService.post('/users', apiUserData);
            
            // Если API возвращает токены при регистрации
            if (response.access_token) {
                localStorage.setItem('accessToken', response.access_token);
                if (response.refresh_token) {
                    localStorage.setItem('refreshToken', response.refresh_token);
                }
                setUser(response.user || response);
                navigate('/profile');
            } else {
                // Автоматически логинимся после регистрации
                await login({ email: userData.email, password: userData.password });
            }
            
            return true;
        } catch (err) {
            console.error("Registration failed:", err);
            setError(err.message || "Ошибка регистрации.");
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = useCallback((shouldNavigate = true) => {
        setUser(null);
        setError(null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        if (shouldNavigate) {
            navigate('/login');
        }
    }, [navigate]);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const value = {
        user,
        isLoading,
        error,
        login,
        register,
        logout,
        fetchUser,
        clearError,
        isAuthenticated: !!user,
        setError
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};