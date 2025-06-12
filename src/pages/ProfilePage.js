// src/pages/ProfilePage.js
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom'; // Для навигации, например, на страницу курса
import './ProfilePage.css';
import { Chart, registerables } from 'chart.js';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/apiService';

Chart.register(...registerables);

// Выносим за пределы компонента для стабильности (не будет пересоздаваться при каждом рендере)
const levelTextMap = {
    'A1': 'A1 (Начальный)',
    'A2': 'A2 (Элементарный)',
    'B1': 'B1 (Средний)',
    'B2': 'B2 (Выше среднего)',
    'C1': 'C1 (Продвинутый)',
    'C2': 'C2 (Профессиональный)',
    'beginner': 'Начинающий (Beginner)',
    'intermediate': 'Средний (Intermediate)',
    'advanced': 'Продвинутый (Advanced)'
};

const ProfilePage = () => {
    const { user, fetchUser, isLoading: authLoading, error: authError } = useAuth();
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);

    const [profileData, setProfileData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [currentLevelText, setCurrentLevelText] = useState('');
    const [selectedLevelModal, setSelectedLevelModal] = useState('');
    const [activeTab, setActiveTab] = useState('courses'); // Начальная активная вкладка

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
            setCurrentLevelText(levelTextMap[user.level] || user.level || 'Не указан');
            setSelectedLevelModal(user.level || 'B1');

            // --- ЗАГЛУШКА ДАННЫХ ДЛЯ ПРОФИЛЯ (заменить на API вызовы) ---
            // TODO: Реализовать API вызовы для:
            // 1. Получения списка курсов пользователя с их прогрессом.
            //    Пример: const userCourses = await apiService.get(`/users/${user.user_id}/courses_progress`);
            // 2. Получения достижений пользователя.
            //    Пример: const userAchievements = await apiService.get(`/users/${user.user_id}/achievements`);
            // 3. Получения данных для статистики (графика).
            //    Пример: const userStats = await apiService.get(`/users/${user.user_id}/stats`);

            const fetchedActiveCourses = [
                { id: '1', course_id: 'mock-course-1', title: 'Английский для начинающих', description: 'Основы грамматики и лексики.', progress: 65, img: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', lessonsTotal: 24, lessonsCompleted: 12 },
                { id: '2', course_id: 'mock-course-2', title: 'Деловой английский', description: 'Профессиональная коммуникация.', progress: 50, img: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', lessonsTotal: 16, lessonsCompleted: 8 },
                { id: '3', course_id: 'mock-course-3', title: 'Английская грамматика', description: 'Углубленный курс.', progress: 25, img: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', lessonsTotal: 20, lessonsCompleted: 5 },
            ];
            const fetchedAchievements = [
                { id: 'ach1', icon: 'fa-star', title: 'Первый урок', description: 'Пройден первый урок на платформе', status: 'Получено', statusClass: 'bg-success' },
                { id: 'ach2', icon: 'fa-book', title: 'Грамматический гурман', description: 'Пройдено 10 уроков по грамматике', status: 'Получено', statusClass: 'bg-success' },
                { id: 'ach3', icon: 'fa-fire', title: 'Неделя активности', description: 'Занимался каждый день в течение недели', status: 'Получено', statusClass: 'bg-success' },
                { id: 'ach4', icon: 'fa-comments', title: 'Мастер разговора', description: 'Пройдено 5 разговорных уроков', status: 'В процессе', statusClass: 'bg-warning' },
            ];
            const fetchedStatsChartData = {
                labels: ['Янв', 'Фев', 'Март', 'Апр'],
                data: [45, 52, 60, 68]
            };
            const fetchedOverallProgress = 68;
            // --- КОНЕЦ ЗАГЛУШКИ ---

            setProfileData({
                ...user,
                activeCourses: fetchedActiveCourses,
                achievements: fetchedAchievements,
                statsChartData: fetchedStatsChartData,
                overallProgress: fetchedOverallProgress
            });

        } catch (err) {
            console.error("Failed to load profile data:", err);
            setError(err.message || "Не удалось загрузить данные профиля.");
        } finally {
            setIsLoading(false);
        }
    }, [user, authLoading]); // Зависимости для loadProfileData

    useEffect(() => {
        if (!authLoading && user) {
            loadProfileData();
        } else if (!authLoading && !user) {
            setError("Пользователь не авторизован.");
            setIsLoading(false);
        }
    }, [user, authLoading, loadProfileData]); // Добавили loadProfileData в зависимости

    useEffect(() => {
        if (chartRef.current && profileData?.statsChartData?.data) {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }
            const ctx = chartRef.current.getContext('2d');
            const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim() || '#4361ee';
            const hexToRgb = (hex) => {
                const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '67, 97, 238'; // fallback
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
                    plugins: { legend: { display: false }, tooltip: { /* ... */ } },
                    scales: {
                        y: {
                            beginAtZero: false,
                            min: Math.min(...profileData.statsChartData.data, 0) - 5,
                            max: Math.max(...profileData.statsChartData.data) + 5,
                            grid: { color: 'rgba(0, 0, 0, 0.05)' },
                            ticks: { callback: function(value) { return value + '%'; } }
                        },
                        x: { grid: { display: false } }
                    }
                }
            });
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
            await fetchUser(); // Обновляем пользователя в AuthContext
            setCurrentLevelText(levelTextMap[selectedLevelModal] || selectedLevelModal);
            const modalElement = document.getElementById('levelModal');
            if (modalElement && window.bootstrap?.Modal?.getInstance(modalElement)) {
                window.bootstrap.Modal.getInstance(modalElement).hide();
            }
            // alert('Уровень английского успешно изменен на ' + (levelTextMap[selectedLevelModal] || selectedLevelModal)); // Можно заменить на более user-friendly уведомление
        } catch (err) {
            console.error("Failed to update level:", err);
            alert("Ошибка при обновлении уровня: " + (err.data?.detail || err.message || "Неизвестная ошибка"));
        }
    }, [user, selectedLevelModal, fetchUser]); // Зависимости для handleSaveLevel

    const handleLevelOptionClick = useCallback((level, event) => {
        if (event.currentTarget.parentElement) {
            const levelOptions = event.currentTarget.parentElement.querySelectorAll('.level-option');
            levelOptions.forEach(el => el.classList.remove('selected'));
        }
        event.currentTarget.classList.add('selected');
        setSelectedLevelModal(level);
    }, []);

    // Управление Bootstrap табами
    useEffect(() => {
        const tabTriggers = document.querySelectorAll('#profileTab button[data-bs-toggle="tab"]');
        const handleTabShown = (event) => {
            setActiveTab(event.target.id.replace('-tab', ''));
        };

        tabTriggers.forEach(triggerEl => {
            // Убедимся, что экземпляр создается только один раз или получаем существующий
            let tabInstance = window.bootstrap.Tab.getInstance(triggerEl);
            if (!tabInstance) {
                tabInstance = new window.bootstrap.Tab(triggerEl);
            }
            triggerEl.addEventListener('shown.bs.tab', handleTabShown);
        });

        // Активация начальной вкладки, если она не 'courses'
        if (activeTab !== 'courses') {
            const initialActiveTabEl = document.getElementById(`${activeTab}-tab`);
            if (initialActiveTabEl) {
                const tabInstance = window.bootstrap.Tab.getInstance(initialActiveTabEl) || new window.bootstrap.Tab(initialActiveTabEl);
                tabInstance.show();
            }
        }

        return () => {
            tabTriggers.forEach(triggerEl => {
                triggerEl.removeEventListener('shown.bs.tab', handleTabShown);
                // Для чистоты можно вызвать dispose, если экземпляр был создан
                // const tabInstance = window.bootstrap.Tab.getInstance(triggerEl);
                // if (tabInstance) tabInstance.dispose();
            });
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps 
    // ^^^ Отключаем правило для этого useEffect, т.к. он должен выполняться только при монтировании для установки слушателей
    // и активная вкладка управляется иначе (через `handleTabClick`)

    const handleTabClick = (tabId) => {
        const tabEl = document.getElementById(`${tabId}-tab`);
        if (tabEl) {
            const tabInstance = window.bootstrap.Tab.getInstance(tabEl) || new window.bootstrap.Tab(tabEl);
            tabInstance.show();
            // setActiveTab(tabId); // Устанавливается через слушатель 'shown.bs.tab'
        }
    };

    if (isLoading || authLoading) {
        return <div className="container mt-5 text-center"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Загрузка профиля...</span></div></div>;
    }

    if (error || authError) {
        return <div className="container mt-5"><div className="alert alert-danger" role="alert">{error || authError}</div></div>;
    }

    if (!user || !profileData) {
        // Это состояние может возникнуть, если authLoading завершился, user есть, но profileData еще не загрузилось,
        // или если пользователь есть, но loadProfileData вернул ошибку и не установил profileData.
        return <div className="container mt-5"><p>Не удалось загрузить данные профиля. Попробуйте обновить страницу.</p></div>;
    }

    return (
        <>
            <header className="profile-header">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-md-2 text-center">
                            <img src={profileData.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.first_name || 'User')}+${encodeURIComponent(profileData.last_name || 'Name')}&background=random`} alt="Аватар" className="profile-avatar" />
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
                            <button className="edit-btn mt-2">
                                <i className="fas fa-edit me-2"></i>Редактировать профиль
                            </button>
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
                        <h3 className="mb-4"><i className="fas fa-book me-2 text-primary"></i>Активные курсы</h3>
                        <div className="row">
                            {profileData.activeCourses && profileData.activeCourses.length > 0 ? profileData.activeCourses.map(course => (
                                <div className="col-lg-4 col-md-6 mb-4" key={course.id}>
                                    <div className="course-card card h-100">
                                        <img src={course.img || `https://via.placeholder.com/600x400.png/007bff/fff?text=${encodeURIComponent(course.title)}`} className="course-img card-img-top" alt={course.title} />
                                        <div className="card-body d-flex flex-column">
                                            <h5 className="card-title">{course.title}</h5>
                                            <p className="card-text text-muted flex-grow-1">{course.description}</p>
                                            <div className="d-flex justify-content-between small text-muted">
                                                <span>Уроков: {course.lessonsCompleted || 0}/{course.lessonsTotal || '?'}</span>
                                                <span>Прогресс: {course.progress || 0}%</span>
                                            </div>
                                            <div className="progress mt-1 mb-3">
                                                <div className="progress-bar" role="progressbar" style={{ width: `${course.progress || 0}%` }}></div>
                                            </div>
                                            <Link to={`/courses/${course.course_id}`} className="btn btn-outline-primary w-100 mt-auto">
                                                Продолжить обучение
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            )) : <p>У вас пока нет активных курсов.</p>}
                        </div>
                    </div>
                    
                    <div className={`tab-pane fade ${activeTab === 'achievements' ? 'show active' : ''}`} id="achievements" role="tabpanel" aria-labelledby="achievements-tab">
                        <h3 className="mb-4"><i className="fas fa-trophy me-2 text-warning"></i>Ваши достижения</h3>
                        <div className="row">
                            {profileData.achievements && profileData.achievements.length > 0 ? profileData.achievements.map(ach => (
                                <div className="col-md-4 mb-4" key={ach.id}>
                                    <div className="badge-card h-100 d-flex flex-column justify-content-center">
                                        <div className="badge-icon mx-auto"> {/* Центрирование иконки */}
                                            <i className={`fas ${ach.icon || 'fa-question-circle'}`}></i>
                                        </div>
                                        <h5 className="mt-3">{ach.title}</h5>
                                        <p className="text-muted small flex-grow-1">{ach.description}</p>
                                        <span className={`badge ${ach.statusClass || 'bg-secondary'}`}>{ach.status}</span>
                                    </div>
                                </div>
                            )) : <p>У вас пока нет достижений.</p>}
                        </div>
                    </div>
                    
                    <div className={`tab-pane fade ${activeTab === 'stats' ? 'show active' : ''}`} id="stats" role="tabpanel" aria-labelledby="stats-tab">
                        <h3 className="mb-4"><i className="fas fa-chart-line me-2 text-success"></i>Ваша статистика</h3>
                        <div className="row">
                            <div className="col-md-8">
                                <div className="card border-0 shadow-sm mb-4 mb-md-0">
                                    <div className="card-body">
                                        <h5 className="card-title">Прогресс изучения за последний месяц</h5>
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
                                            <li className="list-group-item d-flex justify-content-between align-items-center">Всего пройдено уроков <span className="badge bg-primary rounded-pill">{profileData.lessonsCompletedTotal || 0}</span></li>
                                            {/* Добавить другие стат. данные */}
                                        </ul>
                                    </div>
                                </div>
                                {/* ... Сравнение с другими ... */}
                            </div>
                        </div>
                    </div>

                    <div className={`tab-pane fade ${activeTab === 'settings' ? 'show active' : ''}`} id="settings" role="tabpanel" aria-labelledby="settings-tab">
                        <h3 className="mb-4"><i className="fas fa-cog me-2 text-secondary"></i>Настройки профиля</h3>
                        <p>Здесь будут формы для изменения имени, email, пароля и других настроек.</p>
                        {/* TODO: Реализовать формы настроек */}
                    </div>
                </div>
            </div>

            <div className="modal fade" id="levelModal" tabIndex="-1" aria-labelledby="levelModalLabel" aria-hidden="true">
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
