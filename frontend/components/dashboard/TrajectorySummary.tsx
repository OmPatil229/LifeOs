'use client';

import React from 'react';
import { useLifeStore } from '../../store/useLifeStore';
import { BarChart3 } from 'lucide-react';

export const TrajectorySummary = ({ type }: { type: 'month' | 'year' }) => {
  const { goals, insights } = useLifeStore();
  const activeGoals = goals.filter(g => g.type === type);
  const blockCount = type === 'month' ? 4 : 12;
  const label = type === 'month' ? 'Monthly Progress' : 'Yearly Progress';
  const blockLabel = type === 'month' ? 'Week' : 'Month';
  const expectedRate = type === 'month' ? '25%' : '8.3%';

  return (
    <div className="glass-card" style={{ padding: '32px', borderRadius: '18px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <BarChart3 size={24} color="var(--white)" />
          <span style={{ fontSize: '16px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${blockCount}, 1fr)`, gap: '8px', marginBottom: '24px' }}>
        {Array.from({ length: blockCount }).map((_, i) => {
          const trajectory = type === 'month' ? insights.monthTrajectory : insights.yearTrajectory;
          const score = trajectory?.[i] || 0;
          
          // Monochrome scale
          const color = score > 80 ? 'var(--white)' : score > 50 ? 'var(--gray-300)' : score > 20 ? 'var(--gray-700)' : score > 0 ? 'var(--gray-900)' : 'var(--surface-0)';
          
          return (
            <div 
              key={i} 
              style={{ 
                height: '48px', 
                background: color,
                borderRadius: '8px',
                border: '1px solid var(--border)',
                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                position: 'relative'
              }}
              title={`${blockLabel} ${i+1}: ${score}% complete`}
            />
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div style={{ padding: '20px 24px', background: 'var(--surface-2)', borderRadius: '14px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--gray-500)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Target / {blockLabel}</div>
          <div style={{ fontSize: '24px', fontWeight: 900 }}>{expectedRate}</div>
        </div>
        <div style={{ padding: '20px 24px', background: 'var(--surface-2)', borderRadius: '14px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--gray-500)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Pace</div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--white)' }}>{activeGoals.length > 0 ? activeGoals[0].progressPercentage : 0}%</div>
        </div>
      </div>
    </div>
  );
};
