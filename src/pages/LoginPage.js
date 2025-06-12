// src/pages/LoginPage.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import './LoginPage.css';

function LoginPage() {
    const { login, register, isLoading, error, clearError, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('login');

    // Перенаправляем аутентифицированных пользователей
    useEffect(() => {
        if (isAuthenticated) {
            const from = location.state?.from?.pathname || '/profile';
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, navigate, location]);

    // Очищаем ошибки при смене вкладки
    useEffect(() => {
        clearError();
    }, [activeTab, clearError]);

    // Инициализация Bootstrap табов
    useEffect(() => {
        const handleTabShow = (event) => {
            const tabId = event.target.id;
            if (tabId === 'pills-login-tab') setActiveTab('login');
            if (tabId === 'pills-register-tab') setActiveTab('register');
        };

        const tabElements = document.querySelectorAll('[data-bs-toggle="pill"]');
        tabElements.forEach(tab => {
            tab.addEventListener('shown.bs.tab', handleTabShow);
        });

        return () => {
            tabElements.forEach(tab => {
                tab.removeEventListener('shown.bs.tab', handleTabShow);
            });
        };
    }, []);

    const [loginForm, setLoginForm] = useState({ email: '', password: '' });
    const [registerForm, setRegisterForm] = useState({ 
        name: '', 
        email: '', 
        password: '', 
        level: 'beginner' 
    });

    const handleLoginChange = (e) => {
        setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
    };

    const handleRegisterChange = (e) => {
        setRegisterForm({ ...registerForm, [e.target.name]: e.target.value });
    };

    const handleLoginSubmit = async (event) => {
        event.preventDefault();
        if (!loginForm.email || !loginForm.password) {
            return;
        }
        await login(loginForm);
    };

    const handleRegisterSubmit = async (event) => {
        event.preventDefault();
        if (!registerForm.name || !registerForm.email || !registerForm.password) {
            return;
        }
        await register(registerForm);
    };

    const isLoginFormValid = loginForm.email && loginForm.password;
    const isRegisterFormValid = registerForm.name && registerForm.email && registerForm.password;

    return (
        <div className="d-flex align-items-center justify-content-center" style={{ minHeight: 'calc(100vh - 120px)' }}>
            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-md-6 col-lg-5">
                        <div className="card login-card">
                            <div className="card-body p-4 p-md-5">
                                <ul className="nav nav-pills nav-fill mb-4" id="pills-tab" role="tablist">
                                    <li className="nav-item" role="presentation">
                                        <button
                                            className={`nav-link ${activeTab === 'login' ? 'active' : ''}`}
                                            id="pills-login-tab"
                                            data-bs-toggle="pill"
                                            data-bs-target="#pills-login"
                                            type="button"
                                            role="tab"
                                            aria-controls="pills-login"
                                            aria-selected={activeTab === 'login'}
                                        >
                                            Вход
                                        </button>
                                    </li>
                                    <li className="nav-item" role="presentation">
                                        <button
                                            className={`nav-link ${activeTab === 'register' ? 'active' : ''}`}
                                            id="pills-register-tab"
                                            data-bs-toggle="pill"
                                            data-bs-target="#pills-register"
                                            type="button"
                                            role="tab"
                                            aria-controls="pills-register"
                                            aria-selected={activeTab === 'register'}
                                        >
                                            Регистрация
                                        </button>
                                    </li>
                                </ul>

                                {error && (
                                    <div className="alert alert-danger" role="alert">
                                        <i className="fas fa-exclamation-triangle me-2"></i>
                                        {error}
                                    </div>
                                )}

                                <div className="tab-content" id="pills-tabContent">
                                    {/* Форма входа */}
                                    <div className={`tab-pane fade ${activeTab === 'login' ? 'show active' : ''}`} id="pills-login" role="tabpanel">
                                        <h3 className="text-center mb-4">С возвращением!</h3>
                                        <form onSubmit={handleLoginSubmit}>
                                            <div className="mb-3">
                                                <label htmlFor="loginEmail" className="form-label">Email</label>
                                                <input 
                                                    type="email" 
                                                    className="form-control" 
                                                    id="loginEmail" 
                                                    name="email"
                                                    value={loginForm.email}
                                                    onChange={handleLoginChange}
                                                    disabled={isLoading}
                                                    required 
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label htmlFor="loginPassword" className="form-label">Пароль</label>
                                                <input 
                                                    type="password" 
                                                    className="form-control" 
                                                    id="loginPassword" 
                                                    name="password"
                                                    value={loginForm.password}
                                                    onChange={handleLoginChange}
                                                    disabled={isLoading}
                                                    required 
                                                />
                                            </div>
                                            <div className="d-grid mt-4">
                                                <button 
                                                    type="submit" 
                                                    className="btn btn-primary btn-lg" 
                                                    disabled={isLoading || !isLoginFormValid}
                                                >
                                                    {isLoading && activeTab === 'login' ? (
                                                        <>
                                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                            Вход...
                                                        </>
                                                    ) : (
                                                        'Войти'
                                                    )}
                                                </button>
                                            </div>
                                        </form>
                                    </div>

                                    {/* Форма регистрации */}
                                    <div className={`tab-pane fade ${activeTab === 'register' ? 'show active' : ''}`} id="pills-register" role="tabpanel">
                                        <h3 className="text-center mb-4">Создать аккаунт</h3>
                                        <form onSubmit={handleRegisterSubmit}>
                                            <div className="mb-3">
                                                <label htmlFor="registerName" className="form-label">Ваше имя</label>
                                                <input 
                                                    type="text" 
                                                    className="form-control" 
                                                    id="registerName" 
                                                    name="name"
                                                    value={registerForm.name}
                                                    onChange={handleRegisterChange}
                                                    disabled={isLoading}
                                                    required 
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label htmlFor="registerEmail" className="form-label">Email</label>
                                                <input 
                                                    type="email" 
                                                    className="form-control" 
                                                    id="registerEmail" 
                                                    name="email"
                                                    value={registerForm.email}
                                                    onChange={handleRegisterChange}
                                                    disabled={isLoading}
                                                    required 
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label htmlFor="registerPassword" className="form-label">Пароль</label>
                                                <input 
                                                    type="password" 
                                                    className="form-control" 
                                                    id="registerPassword" 
                                                    name="password"
                                                    value={registerForm.password}
                                                    onChange={handleRegisterChange}
                                                    disabled={isLoading}
                                                    required 
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label htmlFor="registerLevel" className="form-label">Уровень английского</label>
                                                <select 
                                                    className="form-select" 
                                                    id="registerLevel" 
                                                    name="level"
                                                    value={registerForm.level}
                                                    onChange={handleRegisterChange}
                                                    disabled={isLoading}
                                                >
                                                    <option value="beginner">Начинающий</option>
                                                    <option value="intermediate">Средний</option>
                                                    <option value="advanced">Продвинутый</option>
                                                </select>
                                            </div>
                                            <div className="d-grid mt-4">
                                                <button 
                                                    type="submit" 
                                                    className="btn btn-primary btn-lg" 
                                                    disabled={isLoading || !isRegisterFormValid}
                                                >
                                                    {isLoading && activeTab === 'register' ? (
                                                        <>
                                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                            Регистрация...
                                                        </>
                                                    ) : (
                                                        'Зарегистрироваться'
                                                    )}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;