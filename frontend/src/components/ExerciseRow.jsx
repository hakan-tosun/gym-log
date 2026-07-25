import React from 'react';

const ExerciseRow = ({ 
  exercise, 
  onUpdateSet, 
  onAddSet, 
  onDeleteSet, 
  onUpdateExerciseName, 
  onDeleteExercise 
}) => {

  const updateField = (setId, field, currentValue, amount) => {
    const newValue = Math.max(0, currentValue + amount);
    onUpdateSet(exercise.id, setId, field, newValue);
  };

  return (
    <div className="exercise-row-container">
      
      <div className="exercise-header">
        <input 
          type="text" 
          className="exercise-name-input"
          value={exercise.name} 
          onChange={(e) => onUpdateExerciseName(exercise.id, e.target.value)}
          placeholder="Hareket Adı Girin..."
        />
        <button 
          onClick={() => onDeleteExercise(exercise.id)} 
          className="btn-delete-exercise"
          title="Tüm Hareketi Sil"
        >
          Sil
        </button>
      </div>

      <div className="sets-list">
        {exercise.sets_data.map((setObj) => (
          <div key={setObj.id} className="set-row">
            <span className="set-badge">Set {setObj.set_number}</span>

            <div className="control-pill">
              <span className="pill-label">TEKRAR</span>
              <button onClick={() => updateField(setObj.id, 'reps', setObj.reps, -1)} className="btn-mini">-</button>
              <span className="pill-value">{setObj.reps}</span>
              <button onClick={() => updateField(setObj.id, 'reps', setObj.reps, 1)} className="btn-mini">+</button>
            </div>

            <div className="control-pill">
              <span className="pill-label">AĞIRLIK</span>
              <button onClick={() => updateField(setObj.id, 'weight', setObj.weight, -2.5)} className="btn-mini">-</button>
              <span className="pill-value">{setObj.weight.toFixed(1)}</span>
              <button onClick={() => updateField(setObj.id, 'weight', setObj.weight, 2.5)} className="btn-mini">+</button>
            </div>

            {exercise.sets_data.length > 1 && (
              <button onClick={() => onDeleteSet(exercise.id, setObj.id)} className="btn-delete-set" title="Seti Sil">✕</button>
            )}
          </div>
        ))}
      </div>

      <button onClick={() => onAddSet(exercise.id)} className="btn-add-set">
        + Yeni Set Ekle
      </button>
    </div>
  );
};

export default ExerciseRow;