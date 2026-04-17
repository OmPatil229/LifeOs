'use client';

import React, { useEffect } from 'react';
import { TimeLayerStack } from '../../../components/dashboard/TimeLayerStack';
import { useLifeStore, TimeLayer } from '../../../store/useLifeStore';
import { Tooltip } from '../../../components/ui/Tooltip';

export default function DashboardPage() {
  const activeTimeLayer = useLifeStore(state => state.activeTimeLayer);
  const setActiveTimeLayer = useLifeStore(state => state.setActiveTimeLayer);
  const fetchCard = useLifeStore(state => state.fetchCard);
  const selectedDate = useLifeStore(state => state.selectedDate);
  const fetchInsights = useLifeStore(state => state.fetchInsights);
  const fetchActiveSession = useLifeStore(state => state.fetchActiveSession);
  const fetchCarryForwardStats = useLifeStore(state => state.fetchCarryForwardStats);

  useEffect(() => {
    // Initial data fetch for all layers
    fetchCard('day', selectedDate);
    fetchCard('week', selectedDate + '-W');
    fetchCard('month', selectedDate.substring(0, 7));
    fetchCard('year', selectedDate.substring(0, 4));
    
    // Fetch dynamical metrics & active session
    fetchInsights();
    fetchActiveSession();
    fetchCarryForwardStats();
  }, [selectedDate, fetchCard, fetchInsights, fetchActiveSession, fetchCarryForwardStats]);

  const tabs: { id: TimeLayer; label: string; tip: string }[] = [
    { id: 'day', label: 'Today', tip: 'Your day at a glance — check in, plan, and focus' },
    { id: 'week', label: 'This Week', tip: 'Weekly goals and task board' },
    { id: 'month', label: 'This Month', tip: 'Monthly milestones and progress' },
    { id: 'year', label: 'This Year', tip: 'Your yearly vision and big-picture goals' },
  ];

  return (
    <div className="page-shell" style={{ animation: 'fadeIn 1s ease-out' }}>
      <div style={{ marginBottom: '64px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid var(--border)', paddingBottom: '40px' }}>
        <div>
          <h1 className="mono" style={{ fontSize: '72px', fontWeight: 700, margin: 0, letterSpacing: '-0.06em', textTransform: 'lowercase', fontFamily: 'var(--font-serif)', lineHeight: 0.8 }}>{tabs.find(t => t.id === activeTimeLayer)?.label}</h1>
          <p style={{ marginTop: '24px', color: 'var(--gray-text)', fontSize: '15px', fontWeight: 500, maxWidth: '400px', lineHeight: 1.6 }}>{tabs.find(t => t.id === activeTimeLayer)?.tip}</p>
        </div>

        <div style={{ display: 'flex', background: 'var(--surface-input)', padding: '6px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTimeLayer(tab.id)}
              style={{
                padding: '12px 24px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer',
                background: activeTimeLayer === tab.id ? 'var(--accent)' : 'transparent',
                color: activeTimeLayer === tab.id ? 'var(--black)' : 'var(--gray-text)',
                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                fontFamily: 'var(--font-serif)'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

      <div style={{ flex: 1, padding: '0 40px 40px' }}>
        <TimeLayerStack />
      </div>
    </div>
  );
}
