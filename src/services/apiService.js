// src/services/apiService.js
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api'; // Используйте ваш URL API из Swagger или Dockerfile

const getAuthToken = () => {
    return localStorage.getItem('accessToken');
};

const getRefreshToken = () => {
    return localStorage.getItem('refreshToken');
};

// Функция для обновления токена (нужно реализовать эндпоинт на бэкенде)
const refreshToken = async () => {
    const currentRefreshToken = getRefreshToken();
    if (!currentRefreshToken) {
        // Нет refresh токена, пользователь должен залогиниться снова
        // Можно вызвать функцию logout или перенаправить на /login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login'; // Простой вариант, лучше через React Router
        return Promise.reject(new Error("No refresh token available."));
    }

    try {
        // Предполагаемый эндпоинт для обновления токена (вам нужно его создать на бэке)
        // Он должен принимать refresh_token и возвращать новый access_token
        const response = await fetch(`${BASE_URL}/auth/refresh-token`, { // Адаптируйте URL
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh_token: currentRefreshToken }),
        });

        if (!response.ok) {
            // Если refresh токен невалиден, удаляем токены и требуем логин
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
            throw new Error('Failed to refresh token, session expired.');
        }

        const data = await response.json();
        localStorage.setItem('accessToken', data.access_token);
        // Некоторые системы возвращают и новый refresh_token
        if (data.refresh_token) {
            localStorage.setItem('refreshToken', data.refresh_token);
        }
        return data.access_token;
    } catch (error) {
        console.error("Error refreshing token:", error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        throw error; // Пробрасываем ошибку дальше
    }
};


const request = async (endpoint, method = 'GET', body = null, isRetry = false) => {
    const headers = {
        'Content-Type': 'application/json',
    };
    const token = getAuthToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        method,
        headers,
    };

    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) { // PATCH добавлен
        config.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, config);

        if (response.status === 401 && !isRetry) {
            // Попытка обновить токен и повторить запрос
            try {
                const newAccessToken = await refreshToken();
                // Повторяем оригинальный запрос с новым токеном
                // Устанавливаем isRetry в true, чтобы избежать бесконечного цикла
                return request(endpoint, method, body, true); 
            } catch (refreshError) {
                // Если обновление токена не удалось, пробрасываем ошибку
                throw refreshError;
            }
        }
        
        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                errorData = { detail: response.statusText, status: response.status };
            }
             // Пытаемся извлечь более детальное сообщение об ошибке
            const message = errorData.detail || errorData.message || (errorData.errors && errorData.errors.length > 0 && errorData.errors[0].msg) || `HTTP error! status: ${response.status}`;
            const error = new Error(message);
            error.status = response.status;
            error.data = errorData; // Добавляем полные данные ошибки
            throw error;
        }

        if (response.status === 204) { // No Content
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error('API call error:', endpoint, error);
        throw error;
    }
};

export default {
    get: (endpoint) => request(endpoint, 'GET'),
    post: (endpoint, body) => request(endpoint, 'POST', body),
    put: (endpoint, body) => request(endpoint, 'PUT', body),
    patch: (endpoint, body) => request(endpoint, 'PATCH', body), // Добавлен PATCH
    delete: (endpoint) => request(endpoint, 'DELETE'),
};