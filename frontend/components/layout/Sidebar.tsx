'use client';

import { Square, Clock, Target, RotateCw, PenTool, BarChart3, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Tooltip } from '../ui/Tooltip';

/**
 * Sidebar Component — Fixed 56px minimalist navigation.
 * Monochrome active states and single-key shortcut tooltips.
 */
export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="sidebar" style={{ borderRight: '1px solid rgba(255,255,255,0.05)', width: '64px' }}>
      <Tooltip text="Home" position="right">
        <Link href="/dashboard" style={{ 
          marginBottom: 48, 
          fontWeight: 700, 
          color: 'white', 
          display: 'flex', 
          justifyContent: 'center', 
          fontSize: '14px',
          fontFamily: 'var(--font-serif)'
        }}>
          os.
        </Link>
      </Tooltip>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
        <Tooltip text="Dashboard" position="right">
          <Link href="/dashboard" className={`nav-icon-container ${pathname === '/dashboard' ? 'active' : ''}`}>
            <Square className={`nav-icon ${pathname === '/dashboard' ? 'active' : ''}`} size={20} />
          </Link>
        </Tooltip>
        
        <Tooltip text="Timeline" position="right">
          <Link href="/timeline" className={`nav-icon-container ${pathname === '/timeline' ? 'active' : ''}`}>
            <Clock className={`nav-icon ${pathname === '/timeline' ? 'active' : ''}`} size={20} />
          </Link>
        </Tooltip>
        
        <Tooltip text="Goals" position="right">
          <Link href="/goals" className={`nav-icon-container ${pathname === '/goals' ? 'active' : ''}`}>
            <Target className={`nav-icon ${pathname === '/goals' ? 'active' : ''}`} size={20} />
          </Link>
        </Tooltip>
        
        <Tooltip text="Habits" position="right">
          <Link href="/habits" className={`nav-icon-container ${pathname === '/habits' ? 'active' : ''}`}>
            <RotateCw className={`nav-icon ${pathname === '/habits' ? 'active' : ''}`} size={20} />
          </Link>
        </Tooltip>
        
        <Tooltip text="Journal" position="right">
          <Link href="/journal" className={`nav-icon-container ${pathname === '/journal' ? 'active' : ''}`}>
            <PenTool className={`nav-icon ${pathname === '/journal' ? 'active' : ''}`} size={20} />
          </Link>
        </Tooltip>
        
        <Tooltip text="Analysis" position="right">
          <Link href="/analysis" className={`nav-icon-container ${pathname === '/analysis' ? 'active' : ''}`}>
            <BarChart3 className={`nav-icon ${pathname === '/analysis' ? 'active' : ''}`} size={20} />
          </Link>
        </Tooltip>
      </div>
      
      <div style={{ flex: 1 }} />
      
      <Tooltip text="Settings" position="right">
        <Link href="/settings" className="nav-icon-container">
          <Settings className="nav-icon" size={20} style={{ marginBottom: 0 }} />
        </Link>
      </Tooltip>
    </aside>
  );
};
