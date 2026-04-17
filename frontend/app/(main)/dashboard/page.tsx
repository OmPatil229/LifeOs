'use client';

import React, { useEffect } from 'react';
import { TimeLayerStack } from '../../../components/dashboard/TimeLayerStack';
import { useLifeStore, TimeLayer } from '../../../store/useLifeStore';
import { Tooltip } from '../../../components/ui/Tooltip';

export default function DashboardPage() {
  const { activeTimeLayer, setActiveTimeLayer, fetchCard, selectedDate, fetchInsights, fetchActiveSession, fetchCarryForwardStats } = useLifeStore();

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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', animation: 'fadeIn 1s ease-out' }}>
      <div style={{ padding: '40px 0', marginBottom: '64px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div>
          <h1 style={{ fontSize: '64px', fontWeight: 700, letterSpacing: '-0.04em', fontFamily: 'var(--font-serif)', textTransform: 'lowercase' }}>
            {tabs.find(t => t.id === activeTimeLayer)?.label}
          </h1>
          <p style={{ marginTop: '8px', color: 'var(--gray-text)', fontSize: '15px', fontWeight: 500, letterSpacing: '0.02em' }}>
            {tabs.find(t => t.id === activeTimeLayer)?.tip}
          </p>
        </div>

        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', padding: '6px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTimeLayer(tab.id)}
              style={{
                padding: '12px 28px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: activeTimeLayer === tab.id ? 'var(--white)' : 'transparent',
                color: activeTimeLayer === tab.id ? 'var(--black)' : 'var(--gray-text)',
                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                letterSpacing: '0.02em'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, padding: '0 24px 24px' }}>
        <TimeLayerStack />
      </div>
    </div>
  );
}
