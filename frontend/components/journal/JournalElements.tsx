import { Activity, ShieldCheck, Zap, Smile, Meh, Frown, AlertCircle, CheckCircle2 } from 'lucide-react';

/**
 * Journal Components — Clean, interactive input elements for daily check-ins.
 */
export const SentimentMetric = ({ 
  label, value, max, onChange 
}: { 
  label: string, value: number, max: number, onChange?: (val: number) => void 
}) => {
  const getIcon = (label: string, val: number, max: number) => {
    const ratio = val / max;
    if (label === 'Stress') {
      if (ratio > 0.6) return <AlertCircle size={24} color="var(--white)" />;
      if (ratio > 0.3) return <Meh size={24} color="var(--gray-500)" />;
      return <CheckCircle2 size={24} color="var(--gray-300)" />;
    }
    if (ratio > 0.6) return <Smile size={24} color="var(--white)" />;
    if (ratio > 0.3) return <Meh size={24} color="var(--gray-500)" />;
    return <Frown size={24} color="var(--gray-300)" />;
  };

  return (
    <div style={{ flex: 1, padding: '24px 28px', border: '1px solid var(--border)', borderRadius: '18px', background: 'var(--surface-1)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {label === 'Mood' ? <Activity size={20} color="var(--white)" /> : label === 'Stress' ? <ShieldCheck size={20} color="var(--white)" /> : <Zap size={20} color="var(--white)" />}
          <span style={{ fontSize: '15px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {getIcon(label, value, max)}
        </div>
      </div>
      <div style={{ display: 'flex', gap: '8px', cursor: 'pointer' }}>
        {Array.from({ length: max }).map((_, i) => (
          <div 
            key={i} 
            onClick={() => onChange?.(i + 1)}
            style={{ 
              flex: 1, 
              height: '12px', 
              background: i < value ? 'var(--white)' : 'var(--surface-3)',
              borderRadius: '6px',
              transition: 'all 200ms cubic-bezier(0.16, 1, 0.3, 1)',
              opacity: i < value ? (i + 1 === value ? 1 : 0.4) : 1
            }} 
          />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '14px', fontSize: '13px', color: 'var(--gray-700)', fontWeight: 800, textTransform: 'uppercase' }}>
        <span>Min</span>
        <span style={{ color: 'var(--white)' }}>{value} / {max}</span>
        <span>Max</span>
      </div>
    </div>
  );
};

export const CorrelationItem = ({ pattern, value }: { pattern: string, value: number }) => {
  const isPositive = value > 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '16px' }}>
      <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--gray-300)' }}>{pattern}</div>
      <div style={{ 
        fontSize: '14px', 
        fontWeight: 900, 
        color: 'var(--white)',
        background: isPositive ? 'var(--gray-800)' : 'var(--surface-3)',
        padding: '6px 14px',
        borderRadius: '10px',
        border: '1px solid var(--border)'
      }}>
        {isPositive ? '+' : ''}{value}%
      </div>
    </div>
  );
};
