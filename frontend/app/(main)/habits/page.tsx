'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Clock, Flame, Lightbulb, Target, X, Check, RotateCw } from 'lucide-react';
import { useLifeStore, Habit } from '../../../store/useLifeStore';

export default function HabitsPage() {
  const { habits, fetchHabits, createHabit, deleteHabit, goals, fetchGoals } = useLifeStore();
  const [isAdding, setIsAdding] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [timeframe, setTimeframe] = useState('morning');
  const [goalId, setGoalId] = useState('');

  useEffect(() => {
    fetchHabits();
    fetchGoals();
  }, [fetchHabits, fetchGoals]);

  const handleCreate = async () => {
    if (!name.trim()) return;
    await createHabit({
      name: name.trim(),
      timeframe,
      goalId: goalId || undefined,
      scheduleDays: [0, 1, 2, 3, 4, 5, 6], // Default to every day
      color: 'var(--gray-500)',
      icon: '⚡'
    });
    setIsAdding(false);
    setName('');
    setGoalId('');
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out', paddingBottom: '100px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '64px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontSize: '40px', fontWeight: 900, letterSpacing: '-0.04em', margin: 0 }}>Routines</h1>
            <p style={{ marginTop: '12px', color: 'var(--gray-500)', fontSize: '18px', fontWeight: 500 }}>Build consistent high-performance habits.</p>
          </div>
          <button 
            onClick={() => setIsAdding(true)}
            style={{ padding: '16px 32px', background: 'var(--white)', border: 'none', borderRadius: '12px', color: 'var(--black)', fontSize: '15px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.3s ease' }}
          >
            <Plus size={20} /> Create Habit
          </button>
        </div>
      </div>

      {/* Habits Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 24 }}>
        {habits.map((habit: Habit) => (
          <div key={habit.id} className="glass-card" style={{ padding: 32, borderRadius: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div style={{ fontSize: '12px', color: 'var(--gray-700)', fontWeight: 800, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '0.05em' }}>
                <Clock size={16} /> {habit.timeframe.toUpperCase()}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--white)', fontWeight: 900, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '0.1em' }}>
                <Flame size={16} color="var(--white)" /> {habit.streakCurrent} DAY STREAK
              </div>
            </div>

            <h3 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '8px', letterSpacing: '-0.02em' }}>{habit.name}</h3>
            
            {habit.goalId && (
              <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gray-500)' }}>
                <Target size={14} />
                <span style={{ fontSize: '12px', fontWeight: 700 }}>
                  LINKED TO: {goals.find(g => g.id === habit.goalId)?.title.toUpperCase() || 'STRATEGY'}
                </span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 20 }}>
               <button 
                 onClick={() => deleteHabit(habit.id)}
                 style={{ padding: 8, color: 'var(--gray-800)', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.2s' }}
               >
                  <Trash2 size={20} />
               </button>
            </div>
          </div>
        ))}

        {habits.length === 0 && !isAdding && (
          <div style={{ gridColumn: '1 / -1', padding: '80px', textAlign: 'center', border: '1px solid var(--border)', borderRadius: '24px', color: 'var(--gray-700)', background: 'var(--surface-1)' }}>
            <div style={{ fontSize: '48px', marginBottom: '24px' }}>🌊</div>
            <p style={{ fontWeight: 800, fontSize: '15px', color: 'var(--gray-500)' }}>NO ESTABLISHED ROUTINES FOUND.</p>
            <p style={{ fontSize: '13px', marginTop: '8px' }}>Start with a core behavior to stabilize your performance baseline.</p>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {isAdding && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '480px', padding: '40px', borderRadius: '24px' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 900, letterSpacing: '-0.03em' }}>Initialize Habit</h2>
                <button onClick={() => setIsAdding(false)} style={{ background: 'none', border: 'none', color: 'var(--gray-500)', cursor: 'pointer' }}><X /></button>
             </div>

             <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                <div>
                  <label className="caps" style={{ display: 'block', color: 'var(--gray-500)', marginBottom: '12px', fontSize: '11px', fontWeight: 800 }}>Habit Name</label>
                  <input 
                    autoFocus
                    className="editable-textarea"
                    style={{ width: '100%', padding: '16px', fontSize: '16px' }}
                    placeholder="e.g. Deep Work Block"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label className="caps" style={{ display: 'block', color: 'var(--gray-500)', marginBottom: '12px', fontSize: '11px', fontWeight: 800 }}>Timeframe</label>
                    <select 
                      value={timeframe}
                      onChange={(e) => setTimeframe(e.target.value)}
                      style={{ width: '100%', padding: '16px', background: 'var(--surface-2)', color: 'white', border: '1px solid var(--border)', borderRadius: '12px', outline: 'none', fontSize: '13px' }}
                    >
                      <option value="morning">Morning</option>
                      <option value="afternoon">Afternoon</option>
                      <option value="evening">Evening</option>
                      <option value="night">Night</option>
                    </select>
                  </div>

                  <div>
                    <label className="caps" style={{ display: 'block', color: 'var(--gray-500)', marginBottom: '12px', fontSize: '11px', fontWeight: 800 }}>Strategic Goal</label>
                    <select 
                      value={goalId}
                      onChange={(e) => setGoalId(e.target.value)}
                      style={{ width: '100%', padding: '16px', background: 'var(--surface-2)', color: 'white', border: '1px solid var(--border)', borderRadius: '12px', outline: 'none', fontSize: '13px' }}
                    >
                      <option value="">No Link</option>
                      {goals.map(g => (
                        <option key={g.id} value={g.id}>{g.title}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button 
                  onClick={handleCreate}
                  disabled={!name.trim()}
                  style={{ marginTop: '20px', padding: '18px', background: 'white', color: 'black', border: 'none', borderRadius: '12px', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', transition: 'all 0.3s' }}
                >
                  <Check size={20} /> COMMIT HABIT
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Behavioral Insights Footer */}
      <div className="glass-card" style={{ marginTop: '64px', padding: 40, borderRadius: '20px', display: 'flex', alignItems: 'center', gap: 32, borderLeft: '6px solid var(--white)' }}>
        <RotateCw size={32} style={{ color: 'var(--white)', opacity: 0.1, flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: '15px', fontWeight: 900, marginBottom: '12px', color: 'var(--white)', display: 'flex', alignItems: 'center', gap: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            <Lightbulb size={24} /> Routine Stability
          </div>
          <p style={{ fontSize: 16, margin: 0, color: 'var(--gray-300)', lineHeight: 1.7, fontWeight: 500 }}>
            Consistent behavioral routines stabilize your biometric baseline. Linked habits contribute 2x more to neuroplastic momentum than isolated actions.
          </p>
        </div>
      </div>
    </div>
  );
}
