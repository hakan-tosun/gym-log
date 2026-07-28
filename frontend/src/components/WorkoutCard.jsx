import React, { useState, useEffect } from 'react';
import ExerciseRow from './ExerciseRow';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const WorkoutCard = ({ title: defaultTitle, initialExercises }) => {
  const [title, setTitle] = useState(defaultTitle);
  const [exercises, setExercises] = useState(initialExercises);
  const [resetTemplate, setResetTemplate] = useState(initialExercises);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLastWorkout = async () => {
      try {
        const token = localStorage.getItem('logym_token');
        const response = await axios.get('https://logym-api.onrender.com/workouts', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const workouts = response.data;
        const lastWorkout = workouts
          .filter(w => w.card_type === defaultTitle || w.card_type === title)
          .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

        if (lastWorkout && lastWorkout.exercises && lastWorkout.exercises.length > 0) {
          const loadedExercises = lastWorkout.exercises.map((ex, index) => ({
            id: Date.now() + Math.random() + index,
            name: ex.name,
            sets_data: [{ id: Date.now() + Math.random(), set_number: 1, reps: 0, weight: 0 }]
          }));
          
          setExercises(loadedExercises);
          setResetTemplate(loadedExercises);
        }
      } catch (error) {
        console.error("Geçmiş antrenman hareketleri çekilemedi:", error);
      }
    };

    fetchLastWorkout();
  }, [defaultTitle, title]);

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
      setExercises(resetTemplate);
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
      await axios.post('https://logym-api.onrender.com/workouts', payload, {
      headers: { 'Authorization': `Bearer ${token}` }
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
      <input 
        type="text" 
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="card-title-input"
        style={{ 
          width: '100%', 
          textAlign: 'center', 
          fontSize: '1.5em', 
          fontWeight: 'bold', 
          border: 'none', 
          background: 'transparent', 
          color: 'inherit',
          marginBottom: '20px',
          outline: 'none',
          borderBottom: '2px dashed #ccc'
        }}
        title="Kart ismini değiştirmek için tıklayın"
      />
      
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