'use client';

import React from 'react';
import { Target, Trash2, ArrowUpRight } from 'lucide-react';
import { useLifeStore, TimeLayer, Goal } from '../../store/useLifeStore';

interface GoalProps {
  goal: Goal;
  onDelete: (id: string) => void;
}

export const GoalItem = ({ goal, onDelete }: GoalProps) => {
  const { goals } = useLifeStore();
  const percentage = goal.progressPercentage || 0;
  
  const parentGoal = goal.parentId ? goals.find(g => g.id === goal.parentId) : null;
  
  return (
    <div style={{ padding: '24px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div style={{ fontSize: '13px', color: 'var(--white)', fontWeight: 800, background: 'var(--surface-3)', padding: '4px 12px', borderRadius: '8px' }}>{goal.category || 'General'}</div>
            {parentGoal && (
               <div style={{ fontSize: '12px', color: 'var(--gray-500)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                 <ArrowUpRight size={14} /> {parentGoal.title}
               </div>
            )}
          </div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>{goal.title}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {goal.drift !== undefined && (
            <div 
              style={{ 
                fontSize: '14px', 
                fontWeight: 800,
                color: 'var(--white)', 
                background: 'var(--surface-3)',
                padding: '6px 12px',
                borderRadius: '8px'
              }}
            >
              {goal.drift > 0 ? '+' : ''}{goal.drift}%
            </div>
          )}
          <div className="mono" style={{ fontSize: '24px', fontWeight: 900, color: 'white' }}>
            {percentage}%
          </div>
          <button 
            onClick={() => onDelete(goal.id)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-700)', opacity: 0.6 }}
          >
            <Trash2 size={22} />
          </button>
        </div>
      </div>
      <div style={{ height: '8px', background: 'var(--surface-3)', borderRadius: '4px' }}>
        <div 
          style={{ 
            width: `${percentage}%`, 
            height: '100%',
            background: 'white', 
            borderRadius: '4px',
            transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
          }} 
        />
      </div>
    </div>
  );
};

export const GoalTrack = ({ type }: { type: TimeLayer }) => {
  const { goals, deleteGoal } = useLifeStore();
  const activeGoals = goals.filter(g => g.type === type);

  const label = type === 'day' ? "Today's Goals" : type === 'week' ? "Weekly Goals" : type === 'month' ? "Monthly Goals" : "Yearly Goals";

  return (
    <div className="glass-card" style={{ padding: '32px', borderRadius: '18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <Target size={24} color="var(--white)" />
        <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--white)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</span>
        <span style={{ fontSize: '13px', color: 'var(--gray-700)', marginLeft: 'auto', fontWeight: 700 }}>{activeGoals.length} ACTIVE</span>
      </div>
      
      {activeGoals.length === 0 ? (
        <div style={{ fontSize: '16px', color: 'var(--gray-700)', textAlign: 'center', padding: '48px 0', fontWeight: 600 }}>
          No goals — tap "Add Goal" to begin.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {activeGoals.map((g) => (
            <GoalItem key={g.id} goal={g} onDelete={deleteGoal} />
          ))}
        </div>
      )}
    </div>
  );
};
