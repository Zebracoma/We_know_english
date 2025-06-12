// src/pages/ExercisePage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// Предположим, у вас есть сервисная функция для API запросов
import apiService from '../services/apiService'; // Замените на ваш реальный сервис

// Компоненты для разных типов упражнений
import MultipleChoiceExercise from '../components/exercises/MultipleChoiceExercise';
import FillTheGapExercise from '../components/exercises/FillTheGapExercise';
// import MatchingExercise from '../components/exercises/MatchingExercise'; // Если будет такой тип

import './ExercisePage.css'; // Стили для страницы

const ExercisePage = () => {
    const { lessonId } = useParams(); // Получаем ID урока из URL
    const navigate = useNavigate();

    const [exercises, setExercises] = useState([]);
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userAnswers, setUserAnswers] = useState({}); // { exerciseId: userAnswer }
    const [results, setResults] = useState({});       // { exerciseId: {isCorrect: boolean, showFeedback: boolean} }
    const [lessonCompleted, setLessonCompleted] = useState(false);

    // Загрузка упражнений для урока
    useEffect(() => {
        const fetchExercises = async () => {
            setIsLoading(true);
            try {
                // Ваш API эндпоинт GET /exercises?lessonId={id}
                // (В вашем Swagger описание /lessons?courseId={id} и /exercises?lessonId={id},
                // убедитесь, что используете правильный для получения упражнений по ID урока)
                // Для примера использую /api/exercises?lessonId=...
                const data = await apiService.get(`/exercises?lessonId=${lessonId}`); // Адаптируйте URL
                if (data && data.length > 0) {
                    setExercises(data); // Предполагается, что data - это массив упражнений
                    // Инициализируем userAnswers и results
                    const initialAnswers = {};
                    const initialResults = {};
                    data.forEach(ex => {
                        initialAnswers[ex.id] = null; // или специфичное значение для типа
                        initialResults[ex.id] = { isCorrect: null, showFeedback: false };
                    });
                    setUserAnswers(initialAnswers);
                    setResults(initialResults);
                } else {
                    setExercises([]); // Нет упражнений
                    // Можно показать сообщение или перенаправить
                }
            } catch (err) {
                console.error("Failed to fetch exercises:", err);
                setError(err.message || "Не удалось загрузить упражнения.");
            } finally {
                setIsLoading(false);
            }
        };

        if (lessonId) {
            fetchExercises();
        }
    }, [lessonId]);

    const handleAnswerSubmit = useCallback((exerciseId, answer) => {
        setUserAnswers(prev => ({ ...prev, [exerciseId]: answer }));

        const exercise = exercises.find(ex => ex.id === exerciseId);
        if (!exercise) return;

        let isCorrect = false;
        // Логика проверки для разных типов упражнений
        switch (exercise.exerciseType) {
            case 'multiple_choice':
                isCorrect = exercise.correctAnswer === answer;
                break;
            case 'fill_gap':
                // Для fill_gap может быть несколько правильных вариантов или нужна более сложная проверка
                isCorrect = exercise.correctAnswer.toLowerCase() === answer.toLowerCase().trim();
                break;
            // Добавьте другие типы
            default:
                console.warn("Unknown exercise type for checking:", exercise.exerciseType);
        }

        setResults(prev => ({
            ...prev,
            [exerciseId]: { isCorrect, showFeedback: true }
        }));

    }, [exercises]);


    const handleNextExercise = () => {
        if (currentExerciseIndex < exercises.length - 1) {
            setCurrentExerciseIndex(prevIndex => prevIndex + 1);
        } else {
            // Все упражнения пройдены
            setLessonCompleted(true);
            // Здесь можно вызвать функцию для отправки прогресса на сервер
            submitLessonProgress();
            console.log("Урок завершен!", userAnswers, results);
        }
    };
    
    // Функция отправки прогресса (нужно будет реализовать)
    const submitLessonProgress = async () => {
        // Собрать данные для POST /progress
        // userId нужно получить из контекста аутентификации
        const userId = "ЗАГЛУШКА_USER_ID"; // Заменить на реальный ID пользователя
        
        let correctAnswersCount = 0;
        exercises.forEach(ex => {
            if (results[ex.id] && results[ex.id].isCorrect) {
                correctAnswersCount++;
            }
        });
        const totalExercises = exercises.length;
        const score = totalExercises > 0 ? Math.round((correctAnswersCount / totalExercises) * 100) : 0;

        const progressData = {
            userId: userId, 
            lessonId: lessonId,
            score: score, 
            completed: true, 
            // timeSpent: ... // если отслеживаете время
        };

        try {
            // Ваш API эндпоинт POST /progress
            const response = await apiService.post('/progress', progressData); // Адаптируйте URL
            console.log('Progress updated:', response);
            // Можно показать сообщение об успешном завершении урока
        } catch (err) {
            console.error('Failed to update progress:', err);
            // Обработать ошибку
        }
    };


    if (isLoading) return <div className="container mt-5 text-center"><p>Загрузка упражнений...</p><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div></div>;
    if (error) return <div className="container mt-5"><div className="alert alert-danger" role="alert">Ошибка: {error}</div></div>;
    if (!exercises.length) return <div className="container mt-5"><p>Для этого урока упражнения пока не добавлены.</p><button onClick={() => navigate(-1)} className="btn btn-secondary">Назад к уроку</button></div>;

    const currentExercise = exercises[currentExerciseIndex];
    const currentResult = results[currentExercise.id];

    const renderExercise = () => {
        if (!currentExercise) return null;

        switch (currentExercise.exerciseType) {
            case 'multiple_choice':
                return (
                    <MultipleChoiceExercise
                        exercise={currentExercise}
                        onAnswerSubmit={handleAnswerSubmit}
                        userAnswer={userAnswers[currentExercise.id]}
                        result={currentResult}
                    />
                );
            case 'fill_gap':
                 return (
                    <FillTheGapExercise
                        exercise={currentExercise}
                        onAnswerSubmit={handleAnswerSubmit}
                        userAnswer={userAnswers[currentExercise.id]}
                        result={currentResult}
                    />
                );
            // case 'matching':
            //     return <MatchingExercise exercise={currentExercise} ... />;
            default:
                return <p>Неизвестный тип упражнения: {currentExercise.exerciseType}</p>;
        }
    };

    if (lessonCompleted) {
        let correctAnswersCount = 0;
        exercises.forEach(ex => {
            if (results[ex.id] && results[ex.id].isCorrect) {
                correctAnswersCount++;
            }
        });
        const totalExercises = exercises.length;
        const finalScore = totalExercises > 0 ? Math.round((correctAnswersCount / totalExercises) * 100) : 0;

        return (
            <div className="container mt-5 exercise-page">
                <div className="card shadow-sm">
                    <div className="card-body text-center">
                        <h2 className="card-title">Урок завершен!</h2>
                        <p className="lead">Ваш результат: {correctAnswersCount} из {totalExercises} ({finalScore}%)</p>
                        {/* Можно добавить кнопку "К следующему уроку" или "Вернуться к списку курсов" */}
                        <button onClick={() => navigate(`/courses`)} className="btn btn-primary mt-3">
                            К списку курсов
                        </button>
                         {/* TODO: Добавить кнопку на следующий урок, если он есть */}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-5 exercise-page">
            <div className="card shadow-sm">
                <div className="card-header bg-primary text-white">
                    <h4 className="mb-0">Упражнение {currentExerciseIndex + 1} из {exercises.length}</h4>
                    <h5>{currentExercise.title || "Упражнение к уроку"}</h5> 
                </div>
                <div className="card-body">
                    {renderExercise()}
                </div>
                {currentResult && currentResult.showFeedback && (
                    <div className="card-footer">
                        {currentResult.isCorrect ? (
                            <div className="alert alert-success mb-0">
                                <strong>Верно!</strong> {currentExercise.explanation}
                            </div>
                        ) : (
                            <div className="alert alert-danger mb-0">
                                <strong>Неверно.</strong> Правильный ответ: {currentExercise.correctAnswer}.
                                {currentExercise.explanation && <p className="mt-2 mb-0">{currentExercise.explanation}</p>}
                            </div>
                        )}
                        <button 
                            onClick={handleNextExercise} 
                            className="btn btn-info mt-3 float-end"
                        >
                            {currentExerciseIndex < exercises.length - 1 ? 'Следующее упражнение' : 'Завершить урок'}
                        </button>
                    </div>
                )}
            </div>
            {/* Навигация по упражнениям (простая) */}
            <div className="mt-4 d-flex justify-content-between">
                <button 
                    onClick={() => setCurrentExerciseIndex(prev => Math.max(0, prev -1))} 
                    disabled={currentExerciseIndex === 0 || (currentResult && currentResult.showFeedback)} // Блокируем если уже есть ответ и фидбек
                    className="btn btn-outline-secondary"
                >
                    <i className="fas fa-arrow-left me-2"></i>Предыдущее
                </button>
                {/* Кнопка "Проверить" теперь встроена в дочерние компоненты или вызывается из них */}
            </div>
        </div>
    );
};

export default ExercisePage;