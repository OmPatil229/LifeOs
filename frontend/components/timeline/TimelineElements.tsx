import { CheckCircle2, Circle, AlertCircle, Zap } from 'lucide-react';

/**
 * TimelineItem Component — Individual unit of the adaptive schedule.
 * High-performance UI for Task/Habit interaction.
 */
export const TimelineItem = ({ 
  id, time, title, type, status, energy, isRecommended, onAction
}: { 
  id: string, time: string, title: string, type: 'task'|'habit', status: 'pending'|'completed'|'missed', energy?: 'low'|'medium'|'high', isRecommended?: boolean, onAction?: () => void
}) => {
  const isCompleted = status === 'completed';

  return (
    <div 
      className="glass-card" 
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 16, 
        padding: '16px 20px', 
        marginBottom: 8,
        borderLeft: isRecommended ? '4px solid var(--white)' : '1px solid var(--border)',
        opacity: isCompleted ? 0.4 : 1
      }}
    >
      <div className="mono caps" style={{ width: 44, fontSize: 13, color: 'var(--gray-500)' }}>
        {time}
      </div>
      
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isRecommended && <Zap size={10} style={{ color: '#EAB308' }} />}
          <span style={{ fontSize: 14, fontWeight: 500, color: isCompleted ? 'var(--gray-500)' : 'white' }}>{title}</span>
        </div>
        <div className="caps" style={{ fontSize: 9, marginTop: 4, display: 'flex', gap: 12 }}>
          <span>{type.toUpperCase()}</span>
          {energy && <span style={{ color: energy === 'high' ? 'white' : 'var(--gray-700)' }}>{energy.toUpperCase()} ENERGY</span>}
        </div>
      </div>

      <div 
        onClick={() => !isCompleted && onAction?.()}
        style={{ cursor: isCompleted ? 'default' : 'pointer', transition: 'transform 150ms' }} 
        className={!isCompleted ? 'hover-scale' : ''}
      >
        {isCompleted ? (
          <CheckCircle2 size={18} style={{ color: '#22C55E' }} />
        ) : status === 'missed' ? (
          <AlertCircle size={18} style={{ color: '#EF4444' }} />
        ) : (
          <Circle size={18} style={{ color: 'var(--gray-700)' }} />
        )}
      </div>
    </div>
  );
};

export const TimelineSection = ({ name, icon: Icon, items, onHabitComplete, onTaskComplete }: { 
  name: string, icon?: any, items: any[], onHabitComplete: (id: string) => void, onTaskComplete?: (id: string) => void 
}) => {
  if (!items || items.length === 0) return null;

  return (
    <div style={{ marginBottom: 48 }}>
      <div className="caps" style={{ 
        marginBottom: '20px', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '10px', 
        color: 'var(--white)',
        fontSize: '12px',
        fontWeight: 700
      }}>
        {Icon && <Icon size={18} color="var(--gray-400)" />}
        <span style={{ letterSpacing: '0.05em' }}>{name}</span>
        <span style={{ opacity: 0.3, fontWeight: 500 }}>({items.length})</span>
      </div>
      <div>
        {items.map((item, i) => (
          <TimelineItem 
            key={item.id || i} 
            {...item} 
            onAction={() => item.type === 'habit' ? onHabitComplete(item.id) : onTaskComplete?.(item.id)}
          />
        ))}
      </div>
    </div>
  );
};
