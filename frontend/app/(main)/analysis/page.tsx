'use client';

import { useEffect } from 'react';
import { useLifeStore } from '../../../store/useLifeStore';
import { Zap, TrendingUp, Lightbulb, Clock, Info, ShieldAlert, Activity, Target } from 'lucide-react';
import { Tooltip } from '../../../components/ui/Tooltip';
import { GlowCard } from '../../../components/ui/GlowCard';

/**
 * Analysis Page — High-precision behavioral tracking and trajectory modeling.
 */
export default function AnalysisPage() {
  const { insights, fetchInsights } = useLifeStore();

  useEffect(() => {
    fetchInsights();
  }, []);

  const observations = [
    { 
      title: 'Performance Accuracy', 
      description: typeof insights.accuracy === 'object' ? insights.accuracy.text : (insights.accuracy || 'Analyzing your planning vs. execution ratio...'), 
      priority: 'medium', 
      icon: Target,
      suggestion: 'Your trajectory aligns more closely when you time-block mornings.' 
    },
    { 
      title: 'Focus Quality', 
      description: `Your average focus is ${insights.focusQuality?.score || 0}/10 (${insights.focusQuality?.label || 'N/A'}).`, 
      priority: 'high', 
      icon: Activity,
      suggestion: 'Use the Session Timer to build higher focus endurance.' 
    },
    { 
      title: 'Biological Peak', 
      description: `Your peak cognitive performance occurs ${insights.peakTime || 'during mid-day'}.`, 
      priority: 'high', 
      icon: Clock,
      suggestion: 'Schedule high-complexity tasks during this window.' 
    },
    { 
      title: 'Burnout Risk', 
      description: insights.burnoutRisk || 'System indicates low stress levels based on current pace.', 
      priority: insights.burnoutRisk ? 'high' : 'low', 
      icon: ShieldAlert,
      suggestion: 'Ensure active rest periods are logged in your journal.' 
    }
  ];

  return (
    <div className="content-max-width" style={{ animation: 'fadeIn 1s ease-out', padding: '60px 0' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '100px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, letterSpacing: '0.2em', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', marginBottom: 20, color: 'var(--gray-text)' }}>
          <Activity size={12} /> performance engine
        </div>
        <h1 style={{ fontSize: '80px', fontWeight: 700, letterSpacing: '-0.05em', margin: 0, fontFamily: 'var(--font-serif)', textTransform: 'lowercase' }}>
          behavioral analysis
        </h1>
        <p style={{ marginTop: '20px', color: 'var(--gray-text)', fontSize: '18px', fontWeight: 400, maxWidth: '600px', margin: '20px auto 0' }}>A data-driven reflection of your daily operations, refined for clarity.</p>
      </div>

      {/* Summary Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32, marginBottom: 64 }}>
        
        <Tooltip text="Estimated time saved via focused work sessions." position="bottom">
          <GlowCard style={{ background: 'var(--surface-1)' }}>
            <div style={{ padding: 48, textAlign: 'center' }}>
               <div style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--gray-text)', marginBottom: 24 }}>TIME SAVED</div>
               <div className="mono" style={{ fontSize: 72, fontWeight: 700, margin: '12px 0', color: 'white', fontFamily: 'var(--font-serif)' }}>{insights.capacityGain || 0}<span style={{ fontSize: 24, marginLeft: 4, fontFamily: 'var(--font-sans)' }}>H</span></div>
               <div style={{ color: 'var(--gray-dim)', fontSize: '12px', fontWeight: 800, letterSpacing: '0.1em' }}>TOTAL / 30 DAYS</div>
            </div>
          </GlowCard>
        </Tooltip>
 
        <GlowCard style={{ background: 'var(--white)' }}>
          <div style={{ padding: 48, textAlign: 'center' }}>
            <div style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(0,0,0,0.5)', marginBottom: 24 }}>HABIT SUCCESS</div>
            <div className="mono" style={{ fontSize: 72, fontWeight: 700, margin: '12px 0', color: 'black', fontFamily: 'var(--font-serif)' }}>{insights.consistencyRate || 0}<span style={{ fontSize: 24, marginLeft: 4, fontFamily: 'var(--font-sans)' }}>%</span></div>
            <div style={{ color: 'rgba(0,0,0,0.4)', fontSize: '12px', fontWeight: 800, letterSpacing: '0.1em' }}>STREAK PROGRESS</div>
          </div>
        </GlowCard>
 
        <Tooltip text="How fast you are finishing your daily goals." position="bottom">
          <GlowCard style={{ background: 'var(--surface-1)' }}>
            <div style={{ padding: 48, textAlign: 'center' }}>
               <div style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--gray-text)', marginBottom: 24 }}>GOAL SPEED</div>
               <div className="mono" style={{ fontSize: 72, fontWeight: 700, margin: '12px 0', color: 'white', fontFamily: 'var(--font-serif)' }}>{insights.efficiencyFactor || '1.0'}<span style={{ fontSize: 24, marginLeft: 4, fontFamily: 'var(--font-sans)' }}>X</span></div>
               <div style={{ color: 'var(--gray-dim)', fontSize: '12px', fontWeight: 800, letterSpacing: '0.1em' }}>USER ADVANTAGE</div>
            </div>
          </GlowCard>
        </Tooltip>
 
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 64 }}>
        
        {/* Real-time Observations */}
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '24px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Daily Reports</h2>
          <p style={{ fontSize: '16px', color: 'var(--gray-500)', marginBottom: '32px', lineHeight: 1.6 }}>Automatic reports based on your activity logs.</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
             {observations.map((o, i) => {
               const ObsIcon = o.icon;
               const simplifiedTitle = o.title.replace('Performance Accuracy', 'Planning Skill')
                                              .replace('Focus Quality', 'Deep Focus')
                                              .replace('Biological Peak', 'Best Focus Time')
                                              .replace('Burnout Risk', 'Stress Check');
               return (
                 <GlowCard key={i} style={{ border: o.priority === 'high' ? '1px solid var(--white)' : '1px solid var(--border)' }}>
                   <div style={{ padding: 32 }}>
                     <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                         <ObsIcon size={24} style={{ color: o.priority === 'high' ? 'var(--white)' : 'var(--gray-700)' }} />
                         <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800, letterSpacing: '-0.02em' }}>{simplifiedTitle}</h3>
                       </div>
                       {o.priority === 'high' && <span style={{ fontSize: '12px', fontWeight: 900, color: 'var(--black)', background: 'var(--white)', padding: '4px 12px', borderRadius: '8px', textTransform: 'uppercase' }}>Focus Here</span>}
                     </div>
                     <p style={{ fontSize: '16px', marginBottom: '24px', color: 'var(--gray-300)', lineHeight: 1.7 }}>{o.description}</p>
                     <div style={{ padding: '20px 24px', borderRadius: '14px', background: 'var(--surface-3)', display: 'flex', gap: '14px', alignItems: 'center', border: '1px solid var(--border)' }}>
                        <Lightbulb size={24} style={{ color: 'var(--white)', flexShrink: 0 }} />
                        <span style={{ fontSize: '15px', color: 'var(--white)', lineHeight: 1.6, fontWeight: 600 }}>{o.suggestion}</span>
                     </div>
                   </div>
                 </GlowCard>
               );
             })}
          </div>
        </div>

        {/* Sidebar — Data Visuals */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          
          <div className="glass-card" style={{ padding: 32, borderRadius: '18px' }}>
             <h3 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '24px', color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Performance Flow</h3>
             <div style={{ height: 160, position: 'relative', display: 'flex', alignItems: 'flex-end', gap: 6 }}>
                {(insights.monthTrajectory || []).length > 0 ? insights.monthTrajectory.map((h, i) => {
                  const color = h > 80 ? 'var(--white)' : h > 50 ? 'var(--gray-300)' : h > 20 ? 'var(--gray-700)' : 'var(--gray-900)';
                  return (
                    <div key={i} style={{ flex: 1, height: `${Math.max(h, 5)}%`, background: color, borderRadius: 2, transition: 'all 0.4s ease' }} />
                  );
                }) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray-800)', fontSize: '12px', fontWeight: 800 }}>WAITING FOR DATA...</div>
                )}
             </div>
             <div style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--gray-700)', fontWeight: 700 }}>
                <span>LAST WEEK</span>
                <span>TODAY</span>
             </div>
          </div>

          <div className="glass-card" style={{ padding: 32, borderRadius: '18px' }}>
             <h3 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '24px', color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Focus Balance</h3>
             <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {insights.focusMix?.length > 0 ? insights.focusMix.map(item => (
                  <div key={item.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: '14px' }}>
                       <span style={{ color: 'var(--gray-400)', fontWeight: 700 }}>{item.label}</span>
                       <span style={{ color: 'white', fontWeight: 900 }}>{item.value}%</span>
                    </div>
                    <div style={{ height: 10, background: 'var(--surface-3)', borderRadius: 5 }}>
                      <div style={{ width: `${item.value}%`, height: '100%', background: 'var(--white)', borderRadius: 5, transition: 'all 0.8s ease', opacity: item.value / 100 + 0.15 }} />
                    </div>
                  </div>
                )) : (
                   <div style={{ textAlign: 'center', padding: '20px', color: 'var(--gray-800)', fontSize: '12px', fontWeight: 800 }}>LOG GOALS TO SEE MIX</div>
                )}
             </div>
          </div>

        </div>

      </div>
    </div>
  );
}
