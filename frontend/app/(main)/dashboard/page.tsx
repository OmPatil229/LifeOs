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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ padding: '0 24px', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Dashboard
          </h1>
          <p style={{ marginTop: '6px', color: 'var(--gray-500)', fontSize: '14px' }}>
            {tabs.find(t => t.id === activeTimeLayer)?.tip}
          </p>
        </div>

        <div style={{ display: 'flex', background: 'var(--surface-1)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border)' }}>
          {tabs.map((tab) => (
            <Tooltip key={tab.id} text={tab.tip} position="bottom">
              <button
                onClick={() => setActiveTimeLayer(tab.id)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  background: activeTimeLayer === tab.id ? 'var(--white)' : 'transparent',
                  color: activeTimeLayer === tab.id ? 'var(--black)' : 'var(--gray-500)',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                {tab.label}
              </button>
            </Tooltip>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, padding: '0 24px 24px' }}>
        <TimeLayerStack />
      </div>
    </div>
  );
}
