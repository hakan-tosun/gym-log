import React from 'react';
import WorkoutCard from '../components/WorkoutCard';

const generateInitialExercises = (names) => {
  return names.map((name, index) => ({
    id: index + 1,
    name: name,
    sets_data: [{ id: Date.now() + Math.random(), set_number: 1, reps: 0, weight: 0 }]
  }));
};

const Dashboard = () => {
  const gogusArkaKol = generateInitialExercises(['Bench Press', 'Incline DB Press', 'Cable Crossover', 'Triceps Pushdown', 'Overhead Ext.']);
  const sirtOnKol = generateInitialExercises(['Lat Pulldown', 'Barbell Row', 'Seated Row', 'Barbell Curl', 'Hammer Curl']);
  const bacakOmuz = generateInitialExercises(['Squat', 'Leg Press', 'Overhead Press', 'Lateral Raise', 'Front Raise']);

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Antrenman Programı</h1>
      <div className="workout-grid">
        <WorkoutCard title="Göğüs - Arka Kol" initialExercises={gogusArkaKol} />
        <WorkoutCard title="Sırt - Ön Kol" initialExercises={sirtOnKol} />
        <WorkoutCard title="Bacak - Omuz" initialExercises={bacakOmuz} />
      </div>
    </div>
  );
};

export default Dashboard;