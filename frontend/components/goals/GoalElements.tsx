import { Target, ChevronRight, Activity, TrendingUp } from 'lucide-react';

/**
 * GoalCard Component — The "Drilldown" unit for long-term behavior tracking.
 * Monochrome progress bars and alignment status for Year-to-Day hierarchy.
 */
export const GoalCard = ({ 
  title, progress, status, type, count 
}: { 
  title: string, progress: number, status: string, type: string, count?: string 
}) => {
  const isAtRisk = status === 'at-risk';
  
  return (
    <div className="glass-card" style={{ 
      padding: '32px', 
      marginBottom: '24px',
      border: isAtRisk ? '1px solid #EF4444' : '1px solid var(--border)',
      background: isAtRisk ? 'rgba(239, 68, 68, 0.02)' : 'var(--surface-1)',
      boxShadow: isAtRisk ? '0 0 40px rgba(239, 68, 68, 0.1)' : '0 4px 20px rgba(0,0,0,0.3)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div className="caps" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          color: isAtRisk ? '#EF4444' : 'var(--gray-500)',
          fontWeight: 700,
          fontSize: '11px'
        }}>
          <Target size={14} /> {type} · {status}
        </div>
        <div className="caps mono" style={{ opacity: 0.5, fontSize: '10px' }}>{count}</div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '22px', margin: 0, fontWeight: 700, color: 'white', letterSpacing: '-0.02em' }}>{title}</h3>
        <ChevronRight size={20} style={{ color: isAtRisk ? '#EF4444' : 'var(--white)' }} />
      </div>

      <div style={{ position: 'relative', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px' }}>
        <div 
          style={{ 
            width: `${progress}%`, 
            height: '100%', 
            background: isAtRisk ? '#EF4444' : 'white', 
            borderRadius: '3px',
            boxShadow: progress > 0 ? (isAtRisk ? '0 0 15px #EF4444' : '0 0 15px white') : 'none'
          }} 
        />
      </div>
      
      <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="caps" style={{ fontSize: '10px', color: 'var(--gray-500)', fontWeight: 700 }}>Progress</div>
        <div className="mono" style={{ fontSize: '16px', fontWeight: 900, color: 'white' }}>{progress}%</div>
      </div>
      </div>
    </div>
  );
};


export const GoalHierarchyNode = ({ icon: Icon, title, value, unit, color }: { icon: any, title: string, value: string|number, unit: string, color?: string }) => {
  return (
    <div className="glass-card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 16, borderColor: color ? `${color}44` : 'var(--border)' }}>
      <div style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-1)', borderRadius: 4 }}>
        <Icon size={16} color={color || 'var(--white)'} />
      </div>
      <div>
        <div className="caps" style={{ fontSize: 9, marginBottom: 2, color: 'var(--gray-500)', fontWeight: 700 }}>{title}</div>
        <div className="mono" style={{ fontSize: 16, fontWeight: 700, color: color || 'var(--white)' }}>{value}<span style={{ fontSize: 10, opacity: 0.5, marginLeft: 2 }}>{unit}</span></div>
      </div>
    </div>
  );
};
