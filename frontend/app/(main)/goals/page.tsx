'use client';

import React, { useEffect } from 'react';
import { useLifeStore } from '../../../store/useLifeStore';

import { GoalCard, GoalHierarchyNode } from '../../../components/goals/GoalElements';
import { Target, TrendingUp, Activity, BarChart3, Plus, Lightbulb } from 'lucide-react';

import { Tooltip } from '../../../components/ui/Tooltip';

export default function GoalsPage() {
  const { goals, fetchGoals, insights } = useLifeStore();

  useEffect(() => {
    fetchGoals();
  }, []);

  const yearGoals = goals.filter(g => g.type === 'year');
  const monthGoals = goals.filter(g => g.type === 'month');
  const weekGoals = goals.filter(g => g.type === 'week');

  return (
    <div className="content-max-width" style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.02em' }}>Goals</h1>
        <p className="caps" style={{ marginTop: '4px', color: 'var(--gray-500)', fontSize: '12px' }}>Track your journey across day, week, month, and year</p>
      </div>
      
      {/* Strategic HUD Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 48 }}>
        <Tooltip text="Cumulative progress towards your yearly vision" position="bottom">
          <GoalHierarchyNode icon={Target} title="YEARLY PROGRESS" value={yearGoals[0]?.progressPercentage || 0} unit=" %" />
        </Tooltip>
        <Tooltip text="Percentage behind schedule for this time of year" position="bottom">
          <GoalHierarchyNode icon={TrendingUp} title="AVERAGE VARIANCE" value={yearGoals[0]?.drift || 0} unit=" %" color={ (yearGoals[0]?.drift || 0) > 0 ? '#22C55E' : '#EF4444' } />
        </Tooltip>
        <Tooltip text="Completed goals" position="bottom">
          <GoalHierarchyNode icon={Activity} title="ACTIVE STREAK" value={insights.goalStreak || 0} unit=" GOALS" />
        </Tooltip>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 48 }}>
        
        {/* The Drilldown Hierarchy — Core Strategic Vertical */}
        <div>
          <div className="caps" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8, color: 'white' }}>
            <div style={{ width: 12, height: 1, background: 'var(--gray-500)' }} />
            Goal Timeline
          </div>
          
          <div style={{ borderLeft: '1px solid rgba(255,255,255,0.05)', paddingLeft: 24, position: 'relative' }}>
             <div className="caps" style={{ marginBottom: 24, color: 'var(--gray-500)', fontSize: '11px' }}>Yearly Vision</div>
             {yearGoals.map((g, i) => (
                <GoalCard 
                  key={g.id} 
                  title={g.title} 
                  progress={g.progressPercentage} 
                  type="year" 
                  status={g.status} 
                  count={g.drift !== undefined ? `${Math.abs(g.drift)}% ${g.drift > 0 ? 'Ahead' : 'Behind'}` : 'On Track'} 
                />
             ))}
             {yearGoals.length === 0 && <div style={{ color: 'var(--gray-800)', fontSize: '13px', paddingTop: 20 }}>No yearly objectives set.</div>}
             
             {/* Month Section */}
             <div style={{ marginTop: 40, marginBottom: 24, color: 'var(--gray-500)', fontSize: '11px' }} className="caps">Monthly Goals</div>
             {monthGoals.map((g, i) => (
                <GoalCard 
                  key={g.id} 
                  title={g.title} 
                  progress={g.progressPercentage} 
                  type="month" 
                  status={g.status} 
                  count={g.drift !== undefined ? `${Math.abs(g.drift)}% ${g.drift > 0 ? 'Ahead' : 'Behind'}` : 'On Track'} 
                />
             ))}
             {monthGoals.length === 0 && <div style={{ color: 'var(--gray-800)', fontSize: '13px', paddingTop: 20 }}>No monthly objectives set.</div>}

             {/* Week Section */}
             <div style={{ marginTop: 40, marginBottom: 24, color: 'var(--gray-500)', fontSize: '11px' }} className="caps">Weekly Goals</div>
             {weekGoals.map((g, i) => (
                <GoalCard 
                  key={g.id} 
                  title={g.title} 
                  progress={g.progressPercentage} 
                  type="week" 
                  status={g.status} 
                  count={g.drift !== undefined ? `${Math.abs(g.drift)}% ${g.drift > 0 ? 'Ahead' : 'Behind'}` : 'On Track'} 
                />
             ))}
             {weekGoals.length === 0 && <div style={{ color: 'var(--gray-800)', fontSize: '13px', paddingTop: 20 }}>No weekly objectives set.</div>}
          </div>
        </div>

        {/* Global Action & Analysis Column */}
        <div style={{ position: 'sticky', top: 32, height: 'fit-content', display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          <button className="glass-card glow" style={{ width: '100%', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 12, border: '1px solid var(--white)' }}>
              <Plus size={16} /> <span className="caps" style={{ color: 'white', fontWeight: 700 }}>Add Goal</span>
          </button>

          <div className="glass-card" style={{ padding: 24 }}>
             <div className="caps" style={{ marginBottom: 16, fontSize: '11px', color: 'var(--gray-500)' }}>
               <Lightbulb size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} /> Suggestion
             </div>
             <p style={{ fontSize: 13, margin: 0, opacity: 0.8, lineHeight: 1.6 }}>
               {insights.habitPerformance || 'Building behavioral patterns... Start tracking to see strategic advice.'}
             </p>
          </div>

          <div className="glass-card" style={{ padding: 24 }}>
             <div className="caps" style={{ marginBottom: 16, fontSize: '11px', color: 'var(--gray-500)' }}>Categories</div>
             <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {insights.categoryProgress?.length > 0 ? insights.categoryProgress.map(cat => (
                  <div key={cat.label} style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="caps" style={{ fontSize: '10px', color: 'var(--gray-500)', fontWeight: 700 }}>{cat.label}</div>
                    <div className="mono" style={{ fontSize: '16px', fontWeight: 900, color: 'white' }}>{cat.value}%</div>
                  </div>
                )) : (
                  <div style={{ color: 'var(--gray-800)', fontSize: '11px', fontWeight: 800, textAlign: 'center', padding: '10px 0' }}>CREATE GOALS TO TRACK CATEGORIES</div>
                )}
             </div>
          </div>


        </div>

      </div>
    </div>
  );
}
