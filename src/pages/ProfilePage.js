// src/pages/ProfilePage.js
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import './ProfilePage.css';
import { Chart, registerables } from 'chart.js';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/apiService';

Chart.register(...registerables);

const levelTextMap = {
    'A1': 'A1 (Начальный)', 'A2': 'A2 (Элементарный)', 'B1': 'B1 (Средний)',
    'B2': 'B2 (Выше среднего)', 'C1': 'C1 (Продвинутый)', 'C2': 'C2 (Профессиональный)',
    'beginner': 'Начинающий (Beginner)', 'intermediate': 'Средний (Intermediate)',
    'advanced': 'Продвинутый (Advanced)'
};

const ProfilePage = () => {
    const { user, fetchUser, isLoading: authLoading, error: authError } = useAuth();
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);

    // profileData теперь будет содержать и user, и доп. данные
    const [profileData, setProfileData] = useState(null); 
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [currentLevelText, setCurrentLevelText] = useState('');
    const [selectedLevelModal, setSelectedLevelModal] = useState('');
    const [activeTab, setActiveTab] = useState('courses');

    const loadProfileData = useCallback(async () => {
        if (!user) {
            if (!authLoading) {
                setError("Пользователь не авторизован или данные не загружены.");
                setIsLoading(false);
            }
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            // Устанавливаем уровень из данных пользователя AuthContext
            setCurrentLevelText(levelTextMap[user.level] || user.level || 'Не указан');
            setSelectedLevelModal(user.level || 'B1');

            // --- РЕАЛЬНЫЙ API ВЫЗОВ (адаптируйте URL и обработку ответа) ---
            // Предполагаем, что user.id или user.user_id содержит ID текущего пользователя
            const userId = user.user_id || user.id;
            if (!userId) {
                throw new Error("ID пользователя не доступен для загрузки данных профиля.");
            }

            // Предполагаемый эндпоинт, который возвращает все нужные данные для профиля
            const summaryData = await apiService.get(`/users/${userId}/profile-summary`);

            // Убедимся, что все ожидаемые поля есть, или предоставим дефолтные значения
            setProfileData({
                ...user, // Основные данные пользователя из AuthContext
                activeCourses: summaryData.activeCourses || [],
                achievements: summaryData.achievements || [],
                statsChartData: summaryData.statsChartData || { labels: [], data: [] },
                overallProgress: summaryData.overallProgress || 0,
                lessonsCompletedTotal: summaryData.lessonsCompletedTotal || 0,
                // ... добавьте другие поля, если ваш эндпоинт их возвращает
            });

        } catch (err) {
            console.error("Failed to load profile data:", err);
            setError(err.message || "Не удалось загрузить данные профиля.");
            // Если данные пользователя есть, но доп. данные не загрузились, можно установить profileData только с user
            if (user) {
                setProfileData({
                     ...user, 
                     activeCourses: [], 
                     achievements: [], 
                     statsChartData: { labels: [], data: [] }, 
                     overallProgress: 0,
                     lessonsCompletedTotal: 0 
                });
            }
        } finally {
            setIsLoading(false);
        }
    }, [user, authLoading]);

    useEffect(() => {
        if (!authLoading && user) {
            loadProfileData();
        } else if (!authLoading && !user) {
            setError("Пользователь не авторизован.");
            setIsLoading(false);
        }
    }, [user, authLoading, loadProfileData]);

    useEffect(() => {
        if (chartRef.current && profileData?.statsChartData?.data?.length > 0) { // Проверка на наличие данных
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }
            const ctx = chartRef.current.getContext('2d');
            const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim() || '#4361ee';
            const hexToRgb = (hex) => {
                const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '67, 97, 238';
            };
            const primaryColorRgb = hexToRgb(primaryColor);

            chartInstanceRef.current = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: profileData.statsChartData.labels,
                    datasets: [{
                        label: 'Общий балл',
                        data: profileData.statsChartData.data,
                        borderColor: primaryColor,
                        backgroundColor: `rgba(${primaryColorRgb}, 0.1)`,
                        borderWidth: 3,
                        pointBackgroundColor: primaryColor,
                        pointRadius: 5,
                        pointHoverRadius: 7,
                        fill: true,
                        tension: 0.3
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false }, tooltip: { backgroundColor: 'rgba(0,0,0,0.8)', padding: 10, titleFont: {size: 14}, bodyFont: {size: 13}} },
                    scales: {
                        y: {
                            beginAtZero: false,
                            min: Math.min(...profileData.statsChartData.data, 0) - 5,
                            max: Math.max(...profileData.statsChartData.data) + 10, // +10 для запаса сверху
                            grid: { color: 'rgba(0, 0, 0, 0.05)' },
                            ticks: { callback: function(value) { return value + '%'; } }
                        },
                        x: { grid: { display: false } }
                    }
                }
            });
        } else if (chartInstanceRef.current) { // Если данных нет, но график был, уничтожаем
            chartInstanceRef.current.destroy();
            chartInstanceRef.current = null;
        }
        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
                chartInstanceRef.current = null;
            }
        };
    }, [profileData]);

    const handleSaveLevel = useCallback(async () => {
        if (!user || !selectedLevelModal) return;
        const userId = user.user_id || user.id;
        if (!userId) {
            alert("ID пользователя не найден.");
            return;
        }
        try {
            await apiService.put(`/users/${userId}`, { level: selectedLevelModal });
            await fetchUser(); // Обновляем пользователя в AuthContext (чтобы user обновился для следующего loadProfileData)
            // loadProfileData(); // Можно вызвать и здесь, чтобы сразу перезагрузить все данные профиля
            setCurrentLevelText(levelTextMap[selectedLevelModal] || selectedLevelModal); // Обновляем локально для UI
            const modalElement = document.getElementById('levelModal');
            if (modalElement && window.bootstrap?.Modal?.getInstance(modalElement)) {
                window.bootstrap.Modal.getInstance(modalElement).hide();
            }
        } catch (err) {
            console.error("Failed to update level:", err);
            alert("Ошибка при обновлении уровня: " + (err.data?.detail || err.message || "Неизвестная ошибка"));
        }
    }, [user, selectedLevelModal, fetchUser]);

    const handleLevelOptionClick = useCallback((level, event) => {
        if (event.currentTarget.parentElement) {
            const levelOptions = event.currentTarget.parentElement.querySelectorAll('.level-option');
            levelOptions.forEach(el => el.classList.remove('selected'));
        }
        event.currentTarget.classList.add('selected');
        setSelectedLevelModal(level);
    }, []);

    useEffect(() => {
        const tabTriggers = document.querySelectorAll('#profileTab button[data-bs-toggle="tab"]');
        const handleTabShown = (event) => {
            setActiveTab(event.target.id.replace('-tab', ''));
        };
        tabTriggers.forEach(triggerEl => {
            let tabInstance = window.bootstrap.Tab.getInstance(triggerEl);
            if (!tabInstance) tabInstance = new window.bootstrap.Tab(triggerEl);
            triggerEl.addEventListener('shown.bs.tab', handleTabShown);
        });
        if (activeTab !== 'courses') {
            const initialActiveTabEl = document.getElementById(`${activeTab}-tab`);
            if (initialActiveTabEl) {
                const tabInstance = window.bootstrap.Tab.getInstance(initialActiveTabEl) || new window.bootstrap.Tab(initialActiveTabEl);
                tabInstance.show();
            }
        }
        return () => {
            tabTriggers.forEach(triggerEl => triggerEl.removeEventListener('shown.bs.tab', handleTabShown));
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleTabClick = (tabId) => {
        const tabEl = document.getElementById(`${tabId}-tab`);
        if (tabEl) {
            const tabInstance = window.bootstrap.Tab.getInstance(tabEl) || new window.bootstrap.Tab(tabEl);
            tabInstance.show();
        }
    };

    if (isLoading || authLoading) {
        return <div className="container mt-5 text-center"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Загрузка профиля...</span></div></div>;
    }

    if (error || authError) {
        return <div className="container mt-5"><div className="alert alert-danger" role="alert">{error || authError}</div></div>;
    }

    if (!profileData) { // profileData теперь содержит и user, так что проверяем только его
        return <div className="container mt-5"><p>Не удалось загрузить данные профиля. Попробуйте обновить страницу.</p></div>;
    }

    return (
        <>
            <header className="profile-header">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-md-2 text-center">
                            <img 
                                src={profileData.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.first_name || profileData.username || 'U')}&background=random&color=fff`} 
                                alt="Аватар" 
                                className="profile-avatar" 
                            />
                        </div>
                        <div className="col-md-7">
                            <h1 className="user-name">
                                {profileData.first_name && profileData.last_name
                                    ? `${profileData.first_name} ${profileData.last_name}`
                                    : profileData.username || "Пользователь"}
                            </h1>
                            <div className="d-flex align-items-center">
                                <span className="english-level" data-bs-toggle="modal" data-bs-target="#levelModal">
                                    <i className="fas fa-language me-2"></i>Уровень: <span id="currentLevel">{currentLevelText}</span>
                                </span>
                            </div>
                            {/* TODO: Реализовать страницу/модальное окно редактирования профиля */}
                            <Link to="/profile/edit" className="edit-btn mt-2 text-decoration-none">
                                <i className="fas fa-edit me-2"></i>Редактировать профиль
                            </Link>
                        </div>
                        <div className="col-md-3 text-md-end mt-3 mt-md-0">
                            <div className="bg-white rounded p-3 d-inline-block shadow-sm">
                                <div className="text-primary fw-bold">Общий прогресс</div>
                                <div className="progress mt-2" style={{ height: '8px' }}>
                                    <div className="progress-bar" role="progressbar" style={{ width: `${profileData.overallProgress || 0}%` }} aria-valuenow={profileData.overallProgress || 0} aria-valuemin="0" aria-valuemax="100"></div>
                                </div>
                                <div className="mt-1 text-muted small">{profileData.overallProgress || 0}% завершено</div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container mt-4">
                <ul className="nav nav-tabs mb-4" id="profileTab" role="tablist">
                    {/* ... кнопки табов как в предыдущем ответе ... */}
                     <li className="nav-item" role="presentation">
                        <button className={`nav-link ${activeTab === 'courses' ? 'active' : ''}`} id="courses-tab" onClick={() => handleTabClick('courses')} data-bs-target="#courses" type="button" role="tab" aria-controls="courses" aria-selected={activeTab === 'courses'}>
                            <i className="fas fa-book me-2"></i>Мои курсы
                        </button>
                    </li>
                    <li className="nav-item" role="presentation">
                        <button className={`nav-link ${activeTab === 'achievements' ? 'active' : ''}`} id="achievements-tab" onClick={() => handleTabClick('achievements')} data-bs-target="#achievements" type="button" role="tab" aria-controls="achievements" aria-selected={activeTab === 'achievements'}>
                            <i className="fas fa-trophy me-2"></i>Достижения
                        </button>
                    </li>
                    <li className="nav-item" role="presentation">
                        <button className={`nav-link ${activeTab === 'stats' ? 'active' : ''}`} id="stats-tab" onClick={() => handleTabClick('stats')} data-bs-target="#stats" type="button" role="tab" aria-controls="stats" aria-selected={activeTab === 'stats'}>
                            <i className="fas fa-chart-line me-2"></i>Статистика
                        </button>
                    </li>
                    <li className="nav-item" role="presentation">
                        <button className={`nav-link ${activeTab === 'settings' ? 'active' : ''}`} id="settings-tab" onClick={() => handleTabClick('settings')} data-bs-target="#settings" type="button" role="tab" aria-controls="settings" aria-selected={activeTab === 'settings'}>
                            <i className="fas fa-cog me-2"></i>Настройки
                        </button>
                    </li>
                </ul>

                <div className="tab-content" id="profileTabContent">
                    <div className={`tab-pane fade ${activeTab === 'courses' ? 'show active' : ''}`} id="courses" role="tabpanel" aria-labelledby="courses-tab">
                        <h3 className="mb-4"><i className="fas fa-book me-2 text-primary"></i>Мои курсы</h3>
                        <div className="row">
                            {profileData.activeCourses?.length > 0 ? profileData.activeCourses.map(course => (
                                <div className="col-lg-4 col-md-6 mb-4" key={course.id || course.course_id}>
                                    <div className="course-card card h-100">
                                        <img src={course.img || `https://via.placeholder.com/600x400.png/007bff/fff?text=${encodeURIComponent(course.title)}`} className="course-img card-img-top" alt={course.title} />
                                        <div className="card-body d-flex flex-column">
                                            <h5 className="card-title">{course.title || "Без названия"}</h5>
                                            <p className="card-text text-muted flex-grow-1">{course.description || "Нет описания."}</p>
                                            <div className="d-flex justify-content-between small text-muted">
                                                <span>Уроков: {course.lessonsCompleted || 0}/{course.lessonsTotal || '?'}</span>
                                                <span>Прогресс: {course.progress || 0}%</span>
                                            </div>
                                            <div className="progress mt-1 mb-3">
                                                <div className="progress-bar" role="progressbar" style={{ width: `${course.progress || 0}%` }}></div>
                                            </div>
                                            <Link to={`/courses/${course.course_id || course.id}`} className="btn btn-outline-primary w-100 mt-auto">
                                                Продолжить обучение
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            )) : <p>Вы еще не записаны ни на один курс или нет активных курсов.</p>}
                        </div>
                    </div>
                    
                    <div className={`tab-pane fade ${activeTab === 'achievements' ? 'show active' : ''}`} id="achievements" role="tabpanel" aria-labelledby="achievements-tab">
                        <h3 className="mb-4"><i className="fas fa-trophy me-2 text-warning"></i>Мои достижения</h3>
                        <div className="row">
                            {profileData.achievements?.length > 0 ? profileData.achievements.map(ach => (
                                <div className="col-md-4 mb-4" key={ach.id}>
                                    <div className="badge-card h-100 d-flex flex-column justify-content-center">
                                        <div className="badge-icon mx-auto">
                                            <i className={`fas ${ach.icon || 'fa-question-circle'}`}></i>
                                        </div>
                                        <h5 className="mt-3">{ach.title || "Достижение"}</h5>
                                        <p className="text-muted small flex-grow-1">{ach.description || ""}</p>
                                        <span className={`badge ${ach.statusClass || 'bg-secondary'}`}>{ach.status || "Статус"}</span>
                                    </div>
                                </div>
                            )) : <p>У вас пока нет достижений.</p>}
                        </div>
                    </div>
                    
                    <div className={`tab-pane fade ${activeTab === 'stats' ? 'show active' : ''}`} id="stats" role="tabpanel" aria-labelledby="stats-tab">
                        <h3 className="mb-4"><i className="fas fa-chart-line me-2 text-success"></i>Моя статистика</h3>
                        {profileData.statsChartData?.data?.length > 0 ? (
                            <div className="row">
                                <div className="col-md-8">
                                    <div className="card border-0 shadow-sm mb-4 mb-md-0">
                                        <div className="card-body">
                                            <h5 className="card-title">Прогресс изучения за последний период</h5>
                                            <div className="chart-container">
                                                <canvas ref={chartRef}></canvas>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="card border-0 shadow-sm mb-4">
                                        <div className="card-body">
                                            <h5 className="card-title">Общая статистика</h5>
                                            <ul className="list-group list-group-flush">
                                                <li className="list-group-item d-flex justify-content-between align-items-center">
                                                    Всего пройдено уроков 
                                                    <span className="badge bg-primary rounded-pill">{profileData.lessonsCompletedTotal || 0}</span>
                                                </li>
                                                {/* TODO: Добавьте другие элементы статистики, если они есть в API */}
                                            </ul>
                                        </div>
                                    </div>
                                    {/* Можно добавить блок "Сравнение с другими", если есть такие данные */}
                                </div>
                            </div>
                        ) : (
                            <p>Данные для статистики пока отсутствуют.</p>
                        )}
                    </div>

                    <div className={`tab-pane fade ${activeTab === 'settings' ? 'show active' : ''}`} id="settings" role="tabpanel" aria-labelledby="settings-tab">
                        <h3 className="mb-4"><i className="fas fa-cog me-2 text-secondary"></i>Настройки профиля</h3>
                        <p>Здесь будут формы для изменения личных данных, пароля и других настроек.</p>
                        {/* TODO: Реализовать формы настроек и их отправку на бэкенд */}
                        {/* Пример:
                        <UserSettingsForm user={profileData} onUpdate={loadProfileData} />
                        <ChangePasswordForm />
                        */}
                    </div>
                </div>
            </div>

            <div className="modal fade" id="levelModal" tabIndex="-1" aria-labelledby="levelModalLabel" aria-hidden="true">
                {/* ... содержимое модального окна ... (без изменений) */}
                 <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="levelModalLabel">Выберите ваш уровень английского</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <p className="text-muted mb-4">Это поможет нам подобрать для вас подходящие курсы.</p>
                            <div className="level-selector">
                                {Object.keys(levelTextMap)
                                  .filter(key => /^[A-C][1-2]$/.test(key) || ['beginner', 'intermediate', 'advanced'].includes(key))
                                  .map(levelKey => (
                                    <div 
                                        key={levelKey}
                                        className={`level-option ${selectedLevelModal === levelKey ? 'selected' : ''}`}
                                        data-level={levelKey}
                                        onClick={(e) => handleLevelOptionClick(levelKey, e)}
                                    >
                                        <h5>{levelKey.toUpperCase()}</h5>
                                        <p>{levelTextMap[levelKey].split(' (')[0]}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4">
                                <p className="text-muted small"><i className="fas fa-info-circle me-2 text-primary"></i>Вы можете изменить уровень в любое время.</p>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>
                            <button type="button" className="btn btn-primary" onClick={handleSaveLevel}>Сохранить</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProfilePage;
