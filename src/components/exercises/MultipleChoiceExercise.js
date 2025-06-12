// src/components/exercises/MultipleChoiceExercise.js
import React, { useState, useEffect } from 'react';

const MultipleChoiceExercise = ({ exercise, onAnswerSubmit, userAnswer, result }) => {
    const [selectedOption, setSelectedOption] = useState(userAnswer || null);

    useEffect(() => {
        // Если приходит новый userAnswer (например, при переходе между уже отвеченными упражнениями)
        setSelectedOption(userAnswer);
    }, [userAnswer]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (selectedOption !== null) {
            onAnswerSubmit(exercise.id, selectedOption);
        }
    };

    const isSubmitted = result && result.showFeedback;

    return (
        <form onSubmit={handleSubmit}>
            <p className="exercise-question fs-5">{exercise.question}</p>
            <div className="options-group">
                {exercise.options.map((option, index) => (
                    <div key={index} className="form-check mb-2">
                        <input
                            className="form-check-input"
                            type="radio"
                            name={`exercise-${exercise.id}`}
                            id={`option-${exercise.id}-${index}`}
                            value={option}
                            checked={selectedOption === option}
                            onChange={(e) => setSelectedOption(e.target.value)}
                            disabled={isSubmitted}
                        />
                        <label 
                            className={`form-check-label ${
                                isSubmitted && option === exercise.correctAnswer ? 'text-success fw-bold' : ''
                            } ${
                                isSubmitted && selectedOption === option && option !== exercise.correctAnswer ? 'text-danger' : ''
                            }`}
                            htmlFor={`option-${exercise.id}-${index}`}
                        >
                            {option}
                        </label>
                    </div>
                ))}
            </div>
            {!isSubmitted && (
                 <button type="submit" className="btn btn-primary mt-3" disabled={selectedOption === null}>
                    Проверить
                </button>
            )}
        </form>
    );
};

export default MultipleChoiceExercise;