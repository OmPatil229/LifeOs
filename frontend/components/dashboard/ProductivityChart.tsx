'use client';

import React, { useEffect, useMemo } from 'react';
import { useLifeStore } from '../../store/useLifeStore';
import { BarChart3, TrendingUp, Activity } from 'lucide-react';

export const ProductivityChart = () => {
  const { analytics, fetchProductivityTrend, insights } = useLifeStore();
  const productivityTrend = analytics?.productivityTrend || [];

  useEffect(() => {
    fetchProductivityTrend(7);
  }, []);

  const width = 500;
  const height = 200;
  const padding = 32;

  const points = useMemo(() => {
    if (!productivityTrend || productivityTrend.length === 0) return null;
    
    // Scale X based on number of items
    const xStep = (width - padding * 2) / (productivityTrend.length - 1);
    
    const moodPoints = productivityTrend.map((d: any, i: number) => ({
      x: padding + i * xStep,
      y: height - padding - (d.mood / 10) * (height - padding * 2)
    }));

    const prodPoints = productivityTrend.map((d: any, i: number) => ({
      x: padding + i * xStep,
      y: height - padding - (d.productivity / 100) * (height - padding * 2)
    }));

    return { mood: moodPoints, prod: prodPoints };
  }, [productivityTrend]);

  if (!points) return <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray-700)', fontSize: '15px' }}>Analyzing patterns...</div>;

  const moodPath = `M ${points.mood.map((p: any) => `${p.x},${p.y}`).join(' L ')}`;
  const prodPath = `M ${points.prod.map((p: any) => `${p.x},${p.y}`).join(' L ')}`;

  return (
    <div className="glass-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Activity size={24} color="var(--white)" />
          <span style={{ fontSize: '16px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Correlation Analysis</span>
        </div>
        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
             <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--white)' }} />
             <span style={{ fontSize: '11px', color: 'var(--gray-500)', fontWeight: 800, textTransform: 'uppercase' }}>Mood</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
             <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--gray-700)', border: '1px solid var(--white)' }} />
             <span style={{ fontSize: '11px', color: 'var(--gray-500)', fontWeight: 800, textTransform: 'uppercase' }}>Goal Rate</span>
          </div>
        </div>
      </div>

      <div style={{ position: 'relative', width: '100%', height: `${height}px` }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          {/* Grid Lines */}
          <line x1={padding} y1={padding} x2={width-padding} y2={padding} stroke="var(--border)" strokeDasharray="6" />
          <line x1={padding} y1={height/2} x2={width-padding} y2={height/2} stroke="var(--border)" strokeDasharray="6" />
          <line x1={padding} y1={height-padding} x2={width-padding} y2={height-padding} stroke="var(--gray-900)" strokeWidth="2" />

          {/* Productivity Line (Goal rate) */}
          <path d={prodPath} fill="none" stroke="var(--gray-700)" strokeWidth="3" strokeDasharray="8,4" strokeLinecap="round" strokeLinejoin="round" />
          {points.prod.map((p: any, i: number) => (
            <circle key={`p-${i}`} cx={p.x} cy={p.y} r="5" fill="var(--gray-900)" stroke="var(--gray-700)" strokeWidth="2" />
          ))}

          {/* Mood Line */}
          <path d={moodPath} fill="none" stroke="var(--white)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          {points.mood.map((p: any, i: number) => (
            <circle key={`m-${i}`} cx={p.x} cy={p.y} r="5" fill="var(--white)" />
          ))}

          {/* X Axis Labels */}
          {productivityTrend.map((d: any, i: number) => (
            <text 
              key={i} 
              x={padding + i * ((width - padding * 2) / (productivityTrend.length - 1))} 
              y={height - 5} 
              textAnchor="middle" 
              fill="var(--gray-700)" 
              style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}
            >
              {d.label}
            </text>
          ))}
        </svg>
      </div>

      <div style={{ padding: '20px 24px', background: 'var(--surface-3)', borderRadius: '12px', fontSize: '14px', color: 'var(--gray-300)', borderLeft: '4px solid var(--white)', fontWeight: 500, lineHeight: 1.6 }}>
        <span style={{ color: 'var(--white)', fontWeight: 800, textTransform: 'uppercase', marginRight: '8px' }}>Insight Correlation:</span> {insights.moodProductivity}
      </div>
    </div>
  );
};
