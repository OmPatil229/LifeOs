'use client';

import { useRouter } from 'next/navigation';

import { useAuthStore } from '../../store/useAuthStore';
import { useLifeStore } from '../../store/useLifeStore';
import { format } from 'date-fns';
import { Zap, Activity, User, LogOut } from 'lucide-react';
import { Tooltip } from '../ui/Tooltip';

/**
 * TopBar Component — The App's Command & Status center.
 * Displays Energy Level management and System Integrity (Healthy/Adjusting).
 */
export const TopBar = () => {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { energy, status, setEnergy, resetState, selectedDate } = useLifeStore();
  const handleLogout = () => {
    resetState();
    logout();
    router.push('/');
  };

  const getSystemStatusLabel = (s: string) => {
    return s === 'stable' ? 'Healthy' : 'Adjusting';
  };

  return (
    <header className="topbar">
      <div className="flex items-center" style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <div className="caps" style={{ color: 'white', fontWeight: 700 }}>{format(new Date(selectedDate + 'T00:00:00'), 'EEEE, MMMM do')}</div>
        <Tooltip text="Based on your recent mood and goal progress" position="bottom">
          <div className="caps" style={{ display: 'flex', alignItems: 'center', gap: 6, color: status === 'stable' ? '#22C55E' : '#EAB308', cursor: 'help' }}>
            <Activity size={14} />
            System: {getSystemStatusLabel(status)}
          </div>
        </Tooltip>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
        {/* Dynamic Energy Selector — Behavioral Honest Feedback */}
        <Tooltip text="Affects task recommendations & focus window" position="bottom">
          <div 
            onClick={() => setEnergy(energy === 'high' ? 'low' : energy === 'medium' ? 'high' : 'medium')}
            style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', transition: 'opacity 150ms' }}
            className="hover-opacity"
          >
            <div className="caps">Energy:</div>
            <div className="mono" style={{ fontSize: 13, textTransform: 'uppercase', color: energy === 'high' ? 'white' : 'var(--gray-500)' }}>
               {energy}
            </div>
            <Zap size={14} style={{ color: energy === 'high' ? '#EAB308' : 'white' }} />
          </div>
        </Tooltip>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderLeft: '1px solid var(--border)', paddingLeft: 24, height: 24 }}>
          <div className="caps" style={{ color: 'white' }}>{user?.name || 'OM'}</div>
          
          <Tooltip text="Sign Out" position="bottom">
            <button 
              onClick={handleLogout}
              style={{ 
                width: 32, 
                height: 24, 
                borderRadius: 2, 
                background: 'var(--surface-3)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background 200ms ease'
              }}
              className="hover-bright"
            >
              <LogOut size={14} style={{ color: 'var(--gray-500)' }} />
            </button>
          </Tooltip>
        </div>
      </div>
    </header>
  );
};

