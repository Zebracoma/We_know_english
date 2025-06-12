// src/pages/LoginPage.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './LoginPage.css';

function LoginPage() {
    const { login, register, isLoading, error, setError } = useAuth();
    const [activeTab, setActiveTab] = useState('login');

    useEffect(() => {
        setError(null);
    }, [activeTab, setError]);

    useEffect(() => {
        const pillsLoginTab = document.getElementById('pills-login-tab');
        const pillsRegisterTab = document.getElementById('pills-register-tab');
        
        // Удаляем предыдущие слушатели, если они были (для HMR и предотвращения дублирования)
        const removeListeners = () => {
            if (pillsLoginTab) pillsLoginTab.removeEventListener('shown.bs.tab', handleTabShow);
            if (pillsRegisterTab) pillsRegisterTab.removeEventListener('shown.bs.tab', handleTabShow);
        };
        removeListeners(); // Вызываем перед добавлением новых

        const handleTabShow = (event) => {
            if (event.target.id === 'pills-login-tab') setActiveTab('login');
            if (event.target.id === 'pills-register-tab') setActiveTab('register');
        };

        if (pillsLoginTab) {
            new window.bootstrap.Tab(pillsLoginTab); // Инициализируем или получаем экземпляр
            pillsLoginTab.addEventListener('shown.bs.tab', handleTabShow);
        }
        if (pillsRegisterTab) {
            new window.bootstrap.Tab(pillsRegisterTab);
            pillsRegisterTab.addEventListener('shown.bs.tab', handleTabShow);
        }

        const collapseElement = document.getElementById('adminLoginCollapse');
        if (collapseElement) {
           new window.bootstrap.Collapse(collapseElement, { toggle: false });
        }
        
        return () => { 
            removeListeners(); // Очистка при размонтировании
        };
    }, []); // Запускаем один раз при монтировании

    const [loginForm, setLoginForm] = useState({ email: '', password: '' });
    const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '', level: 'beginner' });
    const [adminLoginForm, setAdminLoginForm] = useState({ adminEmail: '', adminPassword: '' }); // Состояние для формы админа


    const handleLoginChange = (e) => setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
    const handleRegisterChange = (e) => setRegisterForm({ ...registerForm, [e.target.name]: e.target.value });
    const handleAdminLoginChange = (e) => setAdminLoginForm({ ...adminLoginForm, [e.target.name]: e.target.value });


    const handleLoginSubmit = async (event) => {
        event.preventDefault();
        await login(loginForm);
    };

    const handleRegisterSubmit = async (event) => {
        event.preventDefault();
        await register(registerForm);
    };
    
    const handleAdminLoginSubmit = async (event) => { // Сделал async на всякий случай
        event.preventDefault();
        // В реальном приложении здесь будет вызов API для входа администратора
        console.log('Попытка входа администратора:', adminLoginForm);
        alert(`Форма входа администратора отправлена (заглушка). Admin Email: ${adminLoginForm.adminEmail}.`);
        // Пример вызова, если бы был такой метод в useAuth:
        // await adminLogin(adminLoginForm);
        // или напрямую через apiService:
        // try {
        //     const response = await apiService.post('/auth/admin-login', {
        //         email: adminLoginForm.adminEmail,
        //         password: adminLoginForm.adminPassword
        //     });
        //     // обработка ответа, сохранение токена, обновление пользователя и т.д.
        // } catch (err) {
        //     setError(err.message || "Ошибка входа администратора");
        // }
    };

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
                                            // onClick={() => setActiveTab('login')} // управляется через 'shown.bs.tab'
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
                                            // onClick={() => setActiveTab('register')} // управляется через 'shown.bs.tab'
                                        >
                                            Регистрация
                                        </button>
                                    </li>
                                </ul>

                                {error && <div className="alert alert-danger mt-3" role="alert">{error}</div>}

                                <div className="tab-content mt-3" id="pills-tabContent">
                                    {/* Форма входа */}
                                    <div className={`tab-pane fade ${activeTab === 'login' ? 'show active' : ''}`} id="pills-login" role="tabpanel" aria-labelledby="pills-login-tab">
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
                                                    required 
                                                />
                                            </div>
                                            <div className="d-grid mt-4">
                                                <button type="submit" className="btn btn-primary btn-lg" disabled={isLoading && activeTab === 'login'}>
                                                    {isLoading && activeTab === 'login' ? <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> : ''}
                                                    Войти
                                                </button>
                                            </div>
                                        </form>
                                    </div>

                                    {/* Форма регистрации */}
                                    <div className={`tab-pane fade ${activeTab === 'register' ? 'show active' : ''}`} id="pills-register" role="tabpanel" aria-labelledby="pills-register-tab">
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
                                                    required 
                                                />
                                            </div>
                                            <div className="d-grid mt-4">
                                                <button type="submit" className="btn btn-primary btn-lg" disabled={isLoading && activeTab === 'register'}>
                                                     {isLoading && activeTab === 'register' ? <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> : ''}
                                                    Зарегистрироваться
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>

                                {/* ============================================================= */}
                                {/* НАЧАЛО БЛОКА: ВХОД ДЛЯ АДМИНИСТРАТОРА                       */}
                                {/* ============================================================= */}
                                <div className="text-center mt-4">
                                    <a 
                                        className="text-decoration-none admin-login-toggle" 
                                        data-bs-toggle="collapse" 
                                        href="#adminLoginCollapse" // Убедитесь, что ID совпадает
                                        role="button" 
                                        aria-expanded="false" 
                                        aria-controls="adminLoginCollapse" // Убедитесь, что ID совпадает
                                    >
                                        <i className="fas fa-user-shield me-1"></i> Вход для администратора
                                    </a>
                                </div>

                                <div className="collapse mt-3" id="adminLoginCollapse"> {/* ID должен совпадать с href и aria-controls */}
                                    <div className="card card-body bg-light"> {/* или другой класс для фона */}
                                        <h5 className="text-center mb-3">Вход для администратора</h5>
                                        <form onSubmit={handleAdminLoginSubmit}>
                                            <div className="mb-2">
                                                <label htmlFor="adminEmail" className="form-label visually-hidden">Admin Email</label>
                                                <input 
                                                    type="email" 
                                                    className="form-control form-control-sm" 
                                                    id="adminEmail" 
                                                    name="adminEmail" // Для управляемого компонента
                                                    placeholder="Admin Email" 
                                                    value={adminLoginForm.adminEmail}
                                                    onChange={handleAdminLoginChange}
                                                    required 
                                                />
                                            </div>
                                            <div className="mb-2">
                                                <label htmlFor="adminPassword" className="form-label visually-hidden">Admin Password</label>
                                                <input 
                                                    type="password" 
                                                    className="form-control form-control-sm" 
                                                    id="adminPassword" 
                                                    name="adminPassword" // Для управляемого компонента
                                                    placeholder="Admin Password" 
                                                    value={adminLoginForm.adminPassword}
                                                    onChange={handleAdminLoginChange}
                                                    required 
                                                />
                                            </div>
                                            <div className="d-grid">
                                                <button type="submit" className="btn btn-dark btn-sm" disabled={isLoading /* && это форма админа активна */}>
                                                    {/* Добавить лоадер, если нужно */}
                                                    Войти как администратор
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                                {/* ============================================================= */}
                                {/* КОНЕЦ БЛОКА: ВХОД ДЛЯ АДМИНИСТРАТОРА                         */}
                                {/* ============================================================= */}

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;