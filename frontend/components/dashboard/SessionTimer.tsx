'use client';

import React, { useState, useEffect } from 'react';
import { Play, Square, Timer, Brain } from 'lucide-react';
import { useLifeStore } from '../../store/useLifeStore';

export const SessionTimer = () => {
  const { activeSession, startSession, endSession, fetchActiveSession } = useLifeStore();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    fetchActiveSession();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeSession) {
      const startTime = new Date(activeSession.startTime).getTime();
      interval = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    } else {
      setElapsed(0);
    }
    return () => clearInterval(interval);
  }, [activeSession]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs > 0 ? hrs + ':' : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    startSession(undefined, 7); // Default mood 7 for now
  };

  const handleEnd = () => {
    endSession(8, 9); // Default mood 8, focus 9
  };

  return (
    <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: activeSession ? '1px solid var(--white)' : '1px solid var(--border)', borderRadius: '18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ padding: '12px', borderRadius: '50%', background: activeSession ? 'var(--white)' : 'var(--surface-3)', color: activeSession ? 'var(--black)' : 'var(--gray-700)' }}>
          <Timer size={24} className={activeSession ? 'pulse' : ''} />
        </div>
        <div>
          <div style={{ fontSize: '12px', fontWeight: 900, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {activeSession ? 'Focus Active' : 'Idle System'}
          </div>
          <div className="mono" style={{ fontSize: '24px', fontWeight: 900, letterSpacing: '2px' }}>
            {formatTime(elapsed)}
          </div>
        </div>
      </div>

      <button
        onClick={activeSession ? handleEnd : handleStart}
        className="glass-button"
        style={{ 
          width: '56px', 
          height: '56px', 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: activeSession ? 'var(--white)' : 'var(--white)',
          color: 'var(--black)',
          border: 'none',
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: activeSession ? '0 0 20px rgba(255,255,255,0.4)' : 'none'
        }}
      >
        {activeSession ? <Square size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" style={{ marginLeft: '4px' }} />}
      </button>
    </div>
  );
};
