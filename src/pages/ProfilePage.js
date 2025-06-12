// src/pages/ProfilePage.js
import React, { useEffect, useRef, useState, useCallback } from 'react'; // Добавил useCallback
import './ProfilePage.css';
import { Chart, registerables } from 'chart.js';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/apiService';
// import { Link } from 'react-router-dom'; // Если будете использовать Link для "Продолжить обучение"

Chart.register(...registerables);

const ProfilePage = () => {
    const { user, fetchUser, isLoading: authLoading, error: authError } = useAuth();
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);

    const [profileData, setProfileData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [currentLevelText, setCurrentLevelText] = useState('');
    const [selectedLevelModal, setSelectedLevelModal] = useState('');

    // Карта для отображения уровней
    const levelTextMap = {
        'A1': 'A1 (Начальный)',
        'A2': 'A2 (Элементарный)',
        'B1': 'B1 (Средний)',
        'B2': 'B2 (Выше среднего)',
        'C1': 'C1 (Продвинутый)',
        'C2': 'C2 (Профессиональный)',
        'beginner': 'Начинающий (Beginner)', // Добавим из Swagger
        'intermediate': 'Средний (Intermediate)',
        'advanced': 'Продвинутый (Advanced)'
    };

    // Загрузка данных профиля и данных для графика
    useEffect(() => {
        const loadProfile = async () => {
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
                // В модели User есть user.level, а в Swagger /users/{id} тоже есть level
                setCurrentLevelText(levelTextMap[user.level] || user.level || 'Не указан');
                setSelectedLevelModal(user.level || 'B1'); // B1 как дефолт, если user.level пустой

                // --- ЗАГРУЗКА ДАННЫХ ДЛЯ ПРОФИЛЯ ---
                // Здесь вам нужно будет сделать реальные API запросы
                // 1. Запрос на получение курсов пользователя (с прогрессом)
                //    Возможно, эндпоинт типа GET /users/me/courses или GET /progress?userId={user.user_id}&details=true
                // 2. Запрос на получение достижений
                // 3. Запрос на получение данных для статистики (графика)

                // ЗАГЛУШКА ДАННЫХ (замените на реальные API вызовы)
                const fetchedActiveCourses = [
                    { id: 1, course_id: 'course-uuid-1', title: 'Английский для начинающих', description: 'Основы грамматики', progress: 65, img: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', lessonsTotal: 24, lessonsCompleted: 12 },
                    { id: 2, course_id: 'course-uuid-2', title: 'Деловой английский', description: 'Профессиональная коммуникация', progress: 50, img: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', lessonsTotal: 16, lessonsCompleted: 8 },
                ];
                const fetchedAchievements = [
                    { id: 1, icon: 'fa-star', title: 'Первый урок', description: 'Пройден первый урок', status: 'Получено', statusClass: 'bg-success' },
                    // ...
                ];
                const fetchedStatsChartData = {
                    labels: ['Неделя 1', 'Неделя 2', 'Неделя 3', 'Неделя 4'], // Более корректные названия
                    data: [45, 52, 60, 68]
                };
                const fetchedOverallProgress = 68;
                // --- КОНЕЦ ЗАГЛУШКИ ---

                setProfileData({
                    ...user, // first_name, last_name, avatar_url, email, level и т.д. из объекта user
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
        };

        if (!authLoading && user) {
            loadProfile();
        } else if (!authLoading && !user) {
            setError("Пользователь не авторизован.");
            setIsLoading(false);
        }

    }, [user, authLoading]);


    // Обновление графика когда данные для него готовы
    useEffect(() => {
        if (chartRef.current && profileData && profileData.statsChartData && profileData.statsChartData.data) {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }
            const ctx = chartRef.current.getContext('2d');
            
            // Получаем цвет из CSS переменной
            const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim() || '#4361ee';
            // Преобразуем HEX в RGB для RGBA
            const hexToRgb = (hex) => {
                const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : null;
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
                        backgroundColor: primaryColorRgb ? `rgba(${primaryColorRgb}, 0.1)` : 'rgba(67, 97, 238, 0.1)',
                        borderWidth: 3,
                        pointBackgroundColor: primaryColor,
                        pointRadius: 5,
                        pointHoverRadius: 7,
                        fill: true,
                        tension: 0.3
                    }]
                },
                options: { // Убедитесь, что options определены
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            padding: 10,
                            titleFont: { size: 14 },
                            bodyFont: { size: 13 }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: false,
                            min: Math.min(...profileData.statsChartData.data) - 5 < 0 ? 0 : Math.min(...profileData.statsChartData.data) - 5, // Динамический min
                            max: Math.max(...profileData.statsChartData.data) + 5, // Динамический max
                            grid: { color: 'rgba(0, 0, 0, 0.05)' },
                            ticks: { callback: function(value) { return value + '%'; }}
                        },
                        x: {
                            grid: { display: false }
                        }
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

    const handleSaveLevel = async () => {
        if (!user || !selectedLevelModal) return; // Проверка selectedLevelModal
        
        try {
            // В вашей модели User есть user_id, а API ожидает id в URL
            // Убедитесь, что user.user_id или user.id существует и используется корректно
            const userId = user.user_id || user.id; 
            if (!userId) {
                alert("ID пользователя не найден.");
                return;
            }

            await apiService.put(`/users/${userId}`, { level: selectedLevelModal });
            
            await fetchUser(); // Обновляем пользователя в AuthContext
            
            // Обновляем текст уровня локально сразу (fetchUser обновит его асинхронно)
            setCurrentLevelText(levelTextMap[selectedLevelModal] || selectedLevelModal);

            const modalElement = document.getElementById('levelModal');
            if (modalElement && window.bootstrap?.Modal?.getInstance(modalElement)) {
                window.bootstrap.Modal.getInstance(modalElement).hide();
            }
            alert('Уровень английского успешно изменен на ' + (levelTextMap[selectedLevelModal] || selectedLevelModal));
        } catch (err) {
            console.error("Failed to update level:", err);
            alert("Ошибка при обновлении уровня: " + (err.data?.detail || err.message || "Неизвестная ошибка"));
        }
    };
    
     const handleLevelOptionClick = (level, event) => {
        if (event.currentTarget.parentElement) { // Проверка на существование родителя
            const levelOptions = event.currentTarget.parentElement.querySelectorAll('.level-option');
            levelOptions.forEach(el => el.classList.remove('selected'));
        }
        event.currentTarget.classList.add('selected');
        setSelectedLevelModal(level);
    };

    // Состояние для активной вкладки Bootstrap
    const [activeTab, setActiveTab] = useState('courses');

    // Инициализация и управление Bootstrap табами
    useEffect(() => {
        const tabTriggers = document.querySelectorAll('#profileTab button[data-bs-toggle="tab"]');
        const handleTabShown = (event) => {
            setActiveTab(event.target.id.replace('-tab', ''));
        };

        tabTriggers.forEach(triggerEl => {
            const tab = new window.bootstrap.Tab(triggerEl); // Создаем экземпляр
            triggerEl.addEventListener('shown.bs.tab', handleTabShown);
        });

        // Активируем нужную вкладку при загрузке, если она не 'courses'
        const initialActiveTabEl = document.getElementById(`${activeTab}-tab`);
        if (initialActiveTabEl && !initialActiveTabEl.classList.contains('active')) {
             window.bootstrap.Tab.getInstance(initialActiveTabEl)?.show();
        }


        return () => { // Очистка слушателей
            tabTriggers.forEach(triggerEl => {
                triggerEl.removeEventListener('shown.bs.tab', handleTabShown);
                // Экземпляр Bootstrap Tab удаляется автоматически при удалении элемента из DOM
                // или можно вызвать dispose, если элемент остается:
                // const tabInstance = window.bootstrap.Tab.getInstance(triggerEl);
                // if (tabInstance) {
                //    tabInstance.dispose();
                // }
            });
        };
    }, []); // Пустой массив зависимостей для выполнения один раз

    const handleTabClick = (tabId) => {
        const tabEl = document.getElementById(`${tabId}-tab`);
        if (tabEl) {
            const tabInstance = window.bootstrap.Tab.getInstance(tabEl) || new window.bootstrap.Tab(tabEl);
            tabInstance.show();
            // setActiveTab(tabId); // setActiveTab вызовется через слушатель 'shown.bs.tab'
        }
    };


    if (isLoading || authLoading) {
        return <div className="container mt-5 text-center"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Загрузка профиля...</span></div></div>;
    }

    if (error || authError) {
        return <div className="container mt-5"><div className="alert alert-danger" role="alert">Ошибка: {error || authError}</div></div>;
    }

    if (!user || !profileData) {
        return <div className="container mt-5"><p>Не удалось загрузить данные профиля. Попробуйте войти снова.</p></div>;
    }

    return (
        <>
            <header className="profile-header">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-md-2 text-center">
                            <img src={profileData.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80"} alt="Аватар" className="profile-avatar" />
                        </div>
                        <div className="col-md-7">
                            {/* Отображаем first_name и last_name если они есть, иначе username */}
                            <h1 className="user-name">
                                {profileData.first_name && profileData.last_name 
                                    ? `${profileData.first_name} ${profileData.last_name}` 
                                    : profileData.username || "Имя пользователя"}
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
                            <div className="bg-white rounded p-3 d-inline-block">
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
                <ul className="nav nav-tabs" id="profileTab" role="tablist">
                    <li className="nav-item" role="presentation">
                        <button 
                            className={`nav-link ${activeTab === 'courses' ? 'active' : ''}`} 
                            id="courses-tab" 
                            onClick={() => handleTabClick('courses')} // Используем React для управления
                            data-bs-toggle="tab" // Оставляем для Bootstrap JS
                            data-bs-target="#courses" 
                            type="button" role="tab" aria-controls="courses" 
                            aria-selected={activeTab === 'courses'}>
                            <i className="fas fa-book me-2"></i>Мои курсы
                        </button>
                    </li>
                    <li className="nav-item" role="presentation">
                        <button 
                            className={`nav-link ${activeTab === 'achievements' ? 'active' : ''}`} 
                            id="achievements-tab" 
                            onClick={() => handleTabClick('achievements')}
                            data-bs-toggle="tab" data-bs-target="#achievements" 
                            type="button" role="tab" aria-controls="achievements" 
                            aria-selected={activeTab === 'achievements'}>
                            <i className="fas fa-trophy me-2"></i>Достижения
                        </button>
                    </li>
                    <li className="nav-item" role="presentation">
                        <button 
                            className={`nav-link ${activeTab === 'stats' ? 'active' : ''}`} 
                            id="stats-tab" 
                            onClick={() => handleTabClick('stats')}
                            data-bs-toggle="tab" data-bs-target="#stats" 
                            type="button" role="tab" aria-controls="stats" 
                            aria-selected={activeTab === 'stats'}>
                            <i className="fas fa-chart-line me-2"></i>Статистика
                        </button>
                    </li>
                    <li className="nav-item" role="presentation">
                        <button 
                            className={`nav-link ${activeTab === 'settings' ? 'active' : ''}`} 
                            id="settings-tab" 
                            onClick={() => handleTabClick('settings')}
                            data-bs-toggle="tab" data-bs-target="#settings" 
                            type="button" role="tab" aria-controls="settings" 
                            aria-selected={activeTab === 'settings'}>
                            <i className="fas fa-cog me-2"></i>Настройки
                        </button>
                    </li>
                </ul>

                <div className="tab-content" id="profileTabContent">
                    <div className={`tab-pane fade ${activeTab === 'courses' ? 'show active' : ''}`} id="courses" role="tabpanel" aria-labelledby="courses-tab">
                        <h3 className="mb-4"><i className="fas fa-book me-2 text-primary"></i>Активные курсы</h3>
                        <div className="row">
                            {profileData.activeCourses && profileData.activeCourses.length > 0 ? profileData.activeCourses.map(course => (
                                <div className="col-lg-4 col-md-6 mb-4" key={course.id}> {/* Добавил mb-4 для отступа */}
                                    <div className="course-card card h-100"> {/* Добавил h-100 для одинаковой высоты */}
                                        <img src={course.img || "https://via.placeholder.com/300x140?text=Course+Image"} className="course-img card-img-top" alt={course.title} />
                                        <div className="card-body d-flex flex-column"> {/* Flex для прижатия кнопки вниз */}
                                            <h5 className="card-title">{course.title}</h5>
                                            <p className="card-text text-muted flex-grow-1">{course.description}</p> {/* flex-grow-1 */}
                                            <div className="d-flex justify-content-between small text-muted">
                                                <span>Уроков: {course.lessonsCompleted || 0}/{course.lessonsTotal || '?'}</span>
                                                <span>Прогресс: {course.progress || 0}%</span>
                                            </div>
                                            <div className="progress mt-1 mb-3"> {/* mb-3 для отступа до кнопки */}
                                                <div className="progress-bar" role="progressbar" style={{ width: `${course.progress || 0}%` }}></div>
                                            </div>
                                            {/* <Link to={`/courses/${course.course_id || course.id}`} className="btn btn-outline-primary w-100 mt-auto">Продолжить обучение</Link> */}
                                            <button className="btn btn-outline-primary w-100 mt-auto">Продолжить обучение</button>
                                        </div>
                                    </div>
                                </div>
                            )) : <p>У вас пока нет активных курсов.</p>}
                        </div>
                    </div>
                    
                    <div className={`tab-pane fade ${activeTab === 'achievements' ? 'show active' : ''}`} id="achievements" role="tabpanel" aria-labelledby="achievements-tab">
                        <h3 className="mb-4"><i className="fas fa-trophy me-2 text-warning"></i>Ваши достижения</h3>
                        <div className="row">
                            {/* Пример одного достижения, остальные по аналогии или из profileData.achievements */}
                            {profileData.achievements && profileData.achievements.length > 0 ? profileData.achievements.map(ach => (
                            <div className="col-md-4 mb-4" key={ach.id}>
                                <div className="badge-card h-100">
                                    <div className="badge-icon">
                                        <i className={`fas ${ach.icon || 'fa-question-circle'}`}></i>
                                    </div>
                                    <h5>{ach.title}</h5>
                                    <p className="text-muted">{ach.description}</p>
                                    <span className={`badge ${ach.statusClass || 'bg-secondary'}`}>{ach.status}</span>
                                </div>
                            </div>
                            )) : (
                                <>
                                <div className="col-md-4 mb-4">
                                    <div className="badge-card h-100">
                                        <div className="badge-icon"><i className="fas fa-star"></i></div>
                                        <h5>Первый урок</h5>
                                        <p className="text-muted">Пройден первый урок</p>
                                        <span className="badge bg-success">Получено</span>
                                    </div>
                                </div>
                                {/* ... другие заглушки достижений ... */}
                                </>
                            )}
                        </div>
                    </div>
                    
                    <div className={`tab-pane fade ${activeTab === 'stats' ? 'show active' : ''}`} id="stats" role="tabpanel" aria-labelledby="stats-tab">
                        <h3 className="mb-4"><i className="fas fa-chart-line me-2 text-success"></i>Ваша статистика</h3>
                         <div className="row">
                            <div className="col-md-8">
                                <div className="card border-0 shadow-sm mb-4 mb-md-0"> {/* Отступ для мобильных */}
                                    <div className="card-body">
                                        <h5 className="card-title">Прогресс изучения за последний месяц</h5>
                                        <div className="chart-container">
                                            <canvas ref={chartRef}></canvas>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4">
                                {/* ... Общая статистика и сравнение ... */}
                                <div className="card border-0 shadow-sm mb-4">
                                    <div className="card-body">
                                        {/* ... */}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={`tab-pane fade ${activeTab === 'settings' ? 'show active' : ''}`} id="settings" role="tabpanel" aria-labelledby="settings-tab">
                         <h3 className="mb-4"><i className="fas fa-cog me-2 text-secondary"></i>Настройки профиля</h3>
                         {/* ... Формы настроек ... */}
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
                            <p className="text-muted mb-4">Выберите ваш текущий уровень...</p>
                            <div className="level-selector">
                                {Object.keys(levelTextMap)
                                  .filter(key => /^[A-C][1-2]$/.test(key) || ['beginner', 'intermediate', 'advanced'].includes(key)) // Фильтруем только нужные ключи для опций
                                  .map(levelKey => (
                                    <div 
                                        key={levelKey}
                                        className={`level-option ${selectedLevelModal === levelKey ? 'selected' : ''}`}
                                        data-level={levelKey}
                                        onClick={(e) => handleLevelOptionClick(levelKey, e)}
                                    >
                                        <h5>{levelKey.toUpperCase()}</h5>
                                        <p>{levelTextMap[levelKey].split(' (')[0]}</p> {/* Показываем только название уровня без скобок */}
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4">
                                <p className="text-muted small"><i className="fas fa-info-circle me-2 text-primary"></i>Вы можете изменить уровень...</p>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>
                            <button type="button" className="btn btn-primary" id="saveLevelBtn" onClick={handleSaveLevel}>Сохранить</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
export default ProfilePage;