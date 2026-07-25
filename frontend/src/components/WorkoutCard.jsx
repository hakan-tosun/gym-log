import React, { useState } from 'react';
import ExerciseRow from './ExerciseRow';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const WorkoutCard = ({ title, initialExercises }) => {
  const [exercises, setExercises] = useState(initialExercises);
  const navigate = useNavigate();

  const handleUpdateExerciseName = (exerciseId, newName) => {
    setExercises((prev) => prev.map((ex) => 
      ex.id === exerciseId ? { ...ex, name: newName } : ex
    ));
  };

  const handleDeleteExercise = (exerciseId) => {
    setExercises((prev) => prev.filter((ex) => ex.id !== exerciseId));
  };

  const handleAddExercise = () => {
    const newExercise = {
      id: Date.now() + Math.random(),
      name: "", 
      sets_data: [{ id: Date.now(), set_number: 1, reps: 0, weight: 0 }]
    };
    setExercises((prev) => [...prev, newExercise]);
  };

  const handleUpdateSet = (exerciseId, setId, field, value) => {
    setExercises((prev) => prev.map((ex) => {
      if (ex.id === exerciseId) {
        const updatedSets = ex.sets_data.map(s => s.id === setId ? { ...s, [field]: value } : s);
        return { ...ex, sets_data: updatedSets };
      }
      return ex;
    }));
  };

  const handleAddSet = (exerciseId) => {
    setExercises((prev) => prev.map((ex) => {
      if (ex.id === exerciseId) {
        const newSetNumber = ex.sets_data.length + 1;
        const newSet = { id: Date.now() + Math.random(), set_number: newSetNumber, reps: 0, weight: 0 };
        return { ...ex, sets_data: [...ex.sets_data, newSet] };
      }
      return ex;
    }));
  };

  const handleDeleteSet = (exerciseId, setId) => {
    setExercises((prev) => prev.map((ex) => {
      if (ex.id === exerciseId) {
        const filteredSets = ex.sets_data.filter(s => s.id !== setId);
        const reindexedSets = filteredSets.map((s, index) => ({ ...s, set_number: index + 1 }));
        return { ...ex, sets_data: reindexedSets };
      }
      return ex;
    }));
  };

  const handleReset = () => {
    if (window.confirm(`${title} kartındaki tüm değerleri sıfırlamak istediğinize emin misiniz?`)) {
      setExercises(initialExercises);
    }
  };

  const handleSave = async () => {
    const payload = {
      cardType: title,
      date: new Date().toISOString(),
      workoutData: exercises
    };
    
    try {
      const token = localStorage.getItem('logym_token');
      await axios.post('http://localhost:8000/workouts', payload, {
      headers: {
      'Authorization': `Bearer ${token}`
      }
  });
      alert(`${title} başarıyla kaydedildi!`);
      navigate('/history');
    } catch (error) {
      console.error(error);
      alert("Antrenman kaydedilirken hata oluştu.");
    }
  };

  return (
    <div className="workout-card">
      <h2 className="card-title">{title}</h2>
      
      <div className="exercises-list">
        {exercises.map((exercise) => (
          <ExerciseRow 
            key={exercise.id} 
            exercise={exercise} 
            onUpdateSet={handleUpdateSet}
            onAddSet={handleAddSet}
            onDeleteSet={handleDeleteSet}
            onUpdateExerciseName={handleUpdateExerciseName} 
            onDeleteExercise={handleDeleteExercise} 
          />
        ))}
      </div>
      
      <button onClick={handleAddExercise} className="btn-add-exercise">
        + Karta Yeni Hareket Ekle
      </button>

      <div className="card-actions">
        <button onClick={handleReset} className="btn-reset">
          Sıfırla
        </button>
        <button onClick={handleSave} className="btn-save btn-save-flex">
          Antrenmanı Kaydet
        </button>
      </div>
    </div>
  );
};

export default WorkoutCard;