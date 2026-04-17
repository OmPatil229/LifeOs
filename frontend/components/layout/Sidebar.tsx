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
    <aside className="sidebar">
      <Tooltip text="LifeOS Home" position="right">
        <Link href="/dashboard" className="caps" style={{ marginBottom: 48, fontWeight: 800, color: 'white', display: 'flex', justifyContent: 'center' }}>
          OS
        </Link>
      </Tooltip>
      
      <Tooltip text="Dashboard (D)" position="right">
        <Link href="/dashboard">
          <Square className={`nav-icon ${pathname === '/dashboard' ? 'active' : ''}`} size={24} />
        </Link>
      </Tooltip>
      
      <Tooltip text="Timeline (T)" position="right">
        <Link href="/timeline">
          <Clock className={`nav-icon ${pathname === '/timeline' ? 'active' : ''}`} size={24} />
        </Link>
      </Tooltip>
      
      <Tooltip text="Goals (G)" position="right">
        <Link href="/goals">
          <Target className={`nav-icon ${pathname === '/goals' ? 'active' : ''}`} size={24} />
        </Link>
      </Tooltip>
      
      <Tooltip text="Habits (H)" position="right">
        <Link href="/habits">
          <RotateCw className={`nav-icon ${pathname === '/habits' ? 'active' : ''}`} size={24} />
        </Link>
      </Tooltip>
      
      <Tooltip text="Journal (J)" position="right">
        <Link href="/journal">
          <PenTool className={`nav-icon ${pathname === '/journal' ? 'active' : ''}`} size={24} />
        </Link>
      </Tooltip>
      
      <Tooltip text="Insights (A)" position="right">
        <Link href="/analysis">
          <BarChart3 className={`nav-icon ${pathname === '/analysis' ? 'active' : ''}`} size={24} />
        </Link>
      </Tooltip>
      
      <div style={{ flex: 1 }} />
      
      <Tooltip text="Settings (S)" position="right">
        <Link href="/settings">
          <Settings className="nav-icon" size={24} style={{ marginBottom: 0 }} />
        </Link>
      </Tooltip>
    </aside>
  );
};
