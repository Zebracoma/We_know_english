// src/services/apiService.js
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const getAuthToken = () => localStorage.getItem('accessToken');
const getRefreshToken = () => localStorage.getItem('refreshToken');

// Функция для обновления токена
const refreshToken = async () => {
    const currentRefreshToken = getRefreshToken();
    if (!currentRefreshToken) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        throw new Error("No refresh token available");
    }

    try {
        const response = await fetch(`${BASE_URL}/auth/refresh-token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh_token: currentRefreshToken }),
        });

        if (!response.ok) {
            throw new Error('Failed to refresh token');
        }

        const data = await response.json();
        localStorage.setItem('accessToken', data.access_token);
        
        if (data.refresh_token) {
            localStorage.setItem('refreshToken', data.refresh_token);
        }
        
        return data.access_token;
    } catch (error) {
        console.error("Error refreshing token:", error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        throw error;
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

    if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
        config.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, config);

        // Обработка 401 ошибки - попытка обновить токен
        if (response.status === 401 && !isRetry && getRefreshToken()) {
            try {
                await refreshToken();
                // Повторяем запрос с новым токеном
                return request(endpoint, method, body, true);
            } catch (refreshError) {
                throw refreshError;
            }
        }
        
        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                errorData = { detail: response.statusText };
            }
            
            const message = errorData.detail || 
                           errorData.message || 
                           (errorData.errors?.[0]?.msg) || 
                           `HTTP error! status: ${response.status}`;
            
            const error = new Error(message);
            error.status = response.status;
            error.data = errorData;
            throw error;
        }

        // Обработка пустого ответа
        if (response.status === 204) {
            return null;
        }

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        }
        
        return await response.text();
    } catch (error) {
        console.error('API call error:', endpoint, error);
        throw error;
    }
};

export default {
    get: (endpoint) => request(endpoint, 'GET'),
    post: (endpoint, body) => request(endpoint, 'POST', body),
    put: (endpoint, body) => request(endpoint, 'PUT', body),
    patch: (endpoint, body) => request(endpoint, 'PATCH', body),
    delete: (endpoint) => request(endpoint, 'DELETE'),
};