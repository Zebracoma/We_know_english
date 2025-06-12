// src/components/exercises/FillTheGapExercise.js
import React, { useState, useEffect } from 'react';

const FillTheGapExercise = ({ exercise, onAnswerSubmit, userAnswer, result }) => {
    const [inputValue, setInputValue] = useState(userAnswer || '');

     useEffect(() => {
        setInputValue(userAnswer || '');
    }, [userAnswer]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (inputValue.trim() !== '') {
            onAnswerSubmit(exercise.id, inputValue.trim());
        }
    };
    
    const isSubmitted = result && result.showFeedback;
    
    // Простая замена ___ на инпут. Можно сделать сложнее, если вопрос содержит плейсхолдеры.
    const questionParts = exercise.question.split('___');

    return (
        <form onSubmit={handleSubmit}>
            <div className="exercise-question fs-5 mb-3">
                {questionParts.map((part, index) => (
                    <React.Fragment key={index}>
                        {part}
                        {index < questionParts.length - 1 && (
                            <input 
                                type="text"
                                value={isSubmitted ? (result.isCorrect ? inputValue : exercise.correctAnswer) : inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                disabled={isSubmitted}
                                className={`form-control-sm d-inline-block mx-1 ${
                                    isSubmitted ? (result.isCorrect ? 'is-valid' : 'is-invalid') : ''
                                }`}
                                style={{width: '150px'}} // Примерная ширина
                            />
                        )}
                    </React.Fragment>
                ))}
            </div>
             {!isSubmitted && (
                <button type="submit" className="btn btn-primary mt-3" disabled={inputValue.trim() === ''}>
                    Проверить
                </button>
            )}
        </form>
    );
};

export default FillTheGapExercise;