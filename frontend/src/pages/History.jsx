import React, { useEffect, useState } from 'react';
import axios from 'axios';

const History = () => {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('logym_token');
        const response = await axios.get('http://localhost:8000/workouts/history', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
    });
        setHistoryData(response.data);
      } catch (error) {
        console.error("Geçmiş verileri çekilirken hata:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '50px', color: 'white', fontSize: '20px' }}>Veriler Yükleniyor...</div>;
  }

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Antrenman Geçmişi</h1>
      
      {historyData.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'white', fontSize: '18px' }}>Henüz kaydedilmiş bir antrenman bulunmuyor.</p>
      ) : (
        <div className="workout-grid">
          {historyData.map((workout) => (
            <div key={workout.id} className="workout-card">
              <h2 className="card-title">
                {workout.card_type}
                <div style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginTop: '8px', fontWeight: 'normal' }}>
                  {new Date(workout.date).toLocaleString('tr-TR')}
                </div>
              </h2>
              
              <div className="exercises-list">
                {workout.exercises.map((ex, idx) => (
                    <div key={idx} style={{ padding: '15px 0', borderBottom: '1px solid var(--color-border)' }}>
                        <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--color-text-main)', marginBottom: '10px' }}>
                            {ex.name}
                        </div>
      
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', paddingLeft: '10px', borderLeft: '3px solid var(--color-primary)' }}>
                            {ex.sets_data.map((s, sIdx) => (
                                <div key={sIdx} style={{ fontSize: '14px', color: '#4a5568' }}>
                                    <span style={{ fontWeight: '600', marginRight: '10px' }}>Set {s.set_number}:</span> 
                                    {s.reps} Tekrar - {s.weight} kg
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;