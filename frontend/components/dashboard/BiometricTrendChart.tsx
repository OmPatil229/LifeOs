'use client';

import React, { useEffect } from 'react';
import { useLifeStore } from '../../store/useLifeStore';
import { Activity, Zap, Smile } from 'lucide-react';

export const BiometricTrendChart = ({ type }: { type: 'week' | 'month' | 'year' }) => {
  const { analytics, fetchProductivityTrend } = useLifeStore();
  
  const days = type === 'week' ? 7 : type === 'month' ? 30 : 365;
  const label = type === 'week' ? 'Weekly Outlook' : type === 'month' ? 'Monthly Outlook' : 'Yearly Outlook';

  useEffect(() => {
    fetchProductivityTrend(days);
  }, [type]);

  const { mood, energy } = analytics.biometricTrend;

  if (!mood || mood.length === 0) {
    return <div style={{ color: 'var(--gray-800)', fontSize: '12px', textAlign: 'center', padding: '40px' }}>LOG BIOMETRICS TO SEE TREND</div>;
  }

  // Aggregate mood/energy for display (if yearly, we average into months)
  const displayData = type === 'year' 
    ? Array.from({ length: 12 }).map((_, i) => {
        const slice = mood.slice(i * 30, (i + 1) * 30);
        const eSlice = energy.slice(i * 30, (i + 1) * 30);
        return {
           mood: slice.reduce((a, b) => a + b, 0) / (slice.length || 1),
           energy: eSlice.reduce((a, b) => a + b, 0) / (eSlice.length || 1)
        };
      })
    : mood.map((m, i) => ({ mood: m, energy: energy[i] }));

  return (
    <div className="glass-card" style={{ padding: '24px', borderRadius: '18px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Activity size={20} color="var(--white)" />
          <span className="caps" style={{ fontSize: '13px', fontWeight: 800, color: 'var(--white)' }}>Biometric Flow</span>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
             <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--white)' }} />
             <span style={{ fontSize: '10px', color: 'var(--gray-500)', fontWeight: 800 }}>ENERGY</span>
           </div>
           <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
             <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--gray-700)' }} />
             <span style={{ fontSize: '10px', color: 'var(--gray-500)', fontWeight: 800 }}>MOOD</span>
           </div>
        </div>
      </div>

      <div style={{ 
        height: '140px', 
        display: 'flex', 
        alignItems: 'flex-end', 
        gap: type === 'week' ? '12px' : type === 'month' ? '4px' : '8px' 
      }}>
        {displayData.map((d, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'center' }}>
            <div 
              style={{ 
                width: '100%', 
                height: `${(d.energy / 5) * 60}px`, 
                background: 'var(--white)', 
                borderRadius: '4px',
                opacity: d.energy > 0 ? 1 : 0.05
              }} 
              title={`Energy: ${d.energy}`}
            />
            <div 
              style={{ 
                width: '100%', 
                height: `${(d.mood / 5) * 40}px`, 
                background: 'var(--gray-700)', 
                borderRadius: '4px',
                opacity: d.mood > 0 ? 1 : 0.05
              }} 
              title={`Mood: ${d.mood}`}
            />
          </div>
        ))}
      </div>

      <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
         <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '10px', color: 'var(--gray-500)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>Avg Energy</div>
            <div style={{ fontSize: '20px', fontWeight: 900 }}>{(energy.reduce((a,b)=>a+b,0) / (energy.length || 1)).toFixed(1)}</div>
         </div>
         <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '10px', color: 'var(--gray-500)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>Avg Mood</div>
            <div style={{ fontSize: '20px', fontWeight: 900 }}>{(mood.reduce((a,b)=>a+b,0) / (mood.length || 1)).toFixed(1)}</div>
         </div>
      </div>
    </div>
  );
};
