import { Zap, ArrowUpRight, Lightbulb, ArrowUp, ArrowDown, Minus } from 'lucide-react';

/**
 * DecisionCard — AI-powered suggestion for what to do next.
 */
export const DecisionCard = ({ title, subtitle, energy }: { title: string, subtitle: string, energy: 'low'|'medium'|'high' }) => {
  return (
    <div className="glass-card" style={{ padding: '32px', borderLeft: '6px solid var(--white)', position: 'relative', borderRadius: '18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <Lightbulb size={24} style={{ color: 'var(--white)' }} />
        <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Suggested Next Step</span>
      </div>
      
      <h3 style={{ fontSize: '28px', margin: '0 0 12px 0', letterSpacing: '-0.04em', fontWeight: 800 }}>{title}</h3>
      <p style={{ color: 'var(--gray-300)', fontSize: '18px', margin: 0, lineHeight: 1.6 }}>{subtitle}</p>
      
      <div style={{ position: 'absolute', top: 32, right: 32, color: 'var(--gray-700)' }}>
        <ArrowUpRight size={28} />
      </div>

      <div style={{ marginTop: '24px', fontSize: '14px', color: 'var(--gray-600)', fontWeight: 600 }}>
        Based on your {energy} energy level and pending goals
      </div>
    </div>
  );
};

export const MiniMetric = ({ label, value, trend, unit = '%' }: { label: string, value: string | number, trend?: 'up'|'down'|'stable', unit?: string }) => {
  return (
    <div className="glass-card" style={{ padding: '24px', borderRadius: '18px' }}>
      <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--gray-500)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px' }}>
        <div className="mono" style={{ fontSize: '32px', fontWeight: 800 }}>{value}</div>
        <div style={{ color: 'var(--gray-700)', paddingBottom: '6px', fontSize: '16px', fontWeight: 600 }}>{unit}</div>
      </div>
      {trend && (
        <div style={{ 
          fontSize: '13px', 
          marginTop: '12px', 
          fontWeight: 700, 
          color: trend === 'stable' ? 'var(--gray-700)' : 'var(--white)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          {trend === 'up' ? <ArrowUp size={14} /> : trend === 'down' ? <ArrowDown size={14} /> : <Minus size={14} />}
          {trend === 'up' ? 'Improving' : trend === 'down' ? 'Declining' : 'Stable'}
        </div>
      )}
    </div>
  );
};
