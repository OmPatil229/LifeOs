'use client';

import React from 'react';
import { useLifeStore } from '../../store/useLifeStore';
import {
  CheckCircle,
  Circle,
  ArrowRight,
  FastForward,
  Calendar,
  TrendingUp,
  BarChart3,
  ClipboardCheck
} from 'lucide-react';
import { Tooltip } from '../ui/Tooltip';

/**
 * DailyReview — End-of-day review section for the Day dashboard.
 *
 * Features:
 * - Circular progress ring showing task completion percentage
 * - Task breakdown grouped by status (completed, pending, missed)
 * - Individual "→ Tomorrow" carry-forward button per incomplete task
 * - Batch "Carry All Forward" button for all incomplete tasks
 * - Carry-forward stats panel (week / month / year counts)
 * - Animated state transitions on carry-forward actions
 */

/** Circular progress ring — SVG-based with glow effect */
const ProgressRing = ({ percentage }: { percentage: number }) => {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  // Color gradient based on percentage
  const getColor = (pct: number) => {
    if (pct >= 80) return '#10B981'; // green
    if (pct >= 50) return '#F59E0B'; // amber
    return '#EF4444'; // red
  };
  const color = getColor(percentage);

  return (
    <div style={{ position: 'relative', width: '140px', height: '140px' }}>
      <svg
        width="140"
        height="140"
        viewBox="0 0 140 140"
        style={{ transform: 'rotate(-90deg)' }}
      >
        {/* Background track */}
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="10"
        />
        {/* Progress arc */}
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
            filter: `drop-shadow(0 0 6px ${color}40)`
          }}
        />
      </svg>
      {/* Center percentage text */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center'
        }}
      >
        <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--white)', letterSpacing: '-0.03em' }}>
          {percentage}%
        </div>
        <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Done
        </div>
      </div>
    </div>
  );
};

/** Stat card for carry-forward counts */
const StatBadge = ({
  label,
  value,
  icon: Icon
}: {
  label: string;
  value: number;
  icon: any;
}) => (
  <div
    style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '8px',
      padding: '16px 12px',
      background: 'var(--surface-3)',
      borderRadius: '12px',
      border: '1px solid var(--border)',
      transition: 'all 0.3s ease'
    }}
  >
    <Icon size={18} color="var(--gray-500)" />
    <div style={{ fontSize: '22px', fontWeight: 900, color: value > 0 ? '#F59E0B' : 'var(--white)' }}>
      {value}
    </div>
    <div
      style={{
        fontSize: '10px',
        fontWeight: 800,
        color: 'var(--gray-600)',
        textTransform: 'uppercase',
        letterSpacing: '0.12em'
      }}
    >
      {label}
    </div>
  </div>
);

/** Main DailyReview component */
export const DailyReview = () => {
  const {
    timeline,
    rescheduleToNextDay,
    carryForwardAllTasks,
    carryForwardStats,
    fetchCarryForwardStats,
    selectedDate,
    goals
  } = useLifeStore();

  const [carriedIds, setCarriedIds] = React.useState<Set<string>>(new Set());
  const [isCarryingAll, setIsCarryingAll] = React.useState(false);

  // Fetch carry-forward stats on mount and date change
  React.useEffect(() => {
    fetchCarryForwardStats();
  }, [selectedDate, fetchCarryForwardStats]);

  // Gather all timeline tasks (excluding habits)
  const allItems = React.useMemo(() => {
    const items: any[] = [];
    (['morning', 'afternoon', 'evening', 'night'] as const).forEach((tf) => {
      ((timeline as any)[tf] || []).forEach((item: any) => {
        if (item.type === 'task') items.push(item);
      });
    });
    return items;
  }, [timeline]);

  const completedTasks = allItems.filter(t => t.status === 'completed');
  const incompleteTasks = allItems.filter(t => t.status !== 'completed');

  const totalTasks = allItems.length;
  const completedCount = completedTasks.length;
  const percentage = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  // Handle single carry-forward
  const handleCarryOne = async (taskId: string) => {
    setCarriedIds((prev) => new Set(prev).add(taskId));
    await rescheduleToNextDay(taskId);
  };

  // Handle batch carry-forward
  const handleCarryAll = async () => {
    setIsCarryingAll(true);
    const ids = new Set(incompleteTasks.map(t => t.id));
    setCarriedIds(ids);
    await carryForwardAllTasks();
    setIsCarryingAll(false);
  };

  // Don't render if there are no tasks at all
  if (totalTasks === 0) return null;

  return (
    <div
      id="daily-review-section"
      style={{
        background: 'var(--surface-2)',
        borderRadius: '18px',
        padding: '28px',
        border: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        animation: 'fadeIn 0.5s ease-out'
      }}
    >
      {/* Section Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <ClipboardCheck size={20} color="var(--gray-500)" />
        <span
          style={{
            fontSize: '15px',
            fontWeight: 800,
            color: 'var(--gray-500)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em'
          }}
        >
          Daily Review
        </span>
      </div>

      {/* Top Row: Progress Ring + Summary + Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '28px', alignItems: 'center' }}>
        {/* Progress Ring */}
        <ProgressRing percentage={percentage} />

        {/* Right side: summary + carry-forward stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Summary line */}
          <div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--white)', marginBottom: '4px' }}>
              {completedCount} of {totalTasks} tasks completed
            </div>
            <div style={{ fontSize: '13px', color: 'var(--gray-500)', fontWeight: 500 }}>
              {incompleteTasks.length > 0
                ? `${incompleteTasks.length} task${incompleteTasks.length > 1 ? 's' : ''} remaining — carry forward or resolve`
                : 'All tasks completed! Great day 🎉'}
            </div>
          </div>

          {/* Carry-Forward Stats */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <Tooltip text="Tasks carried forward this week" position="bottom">
              <StatBadge label="This Week" value={carryForwardStats.week} icon={Calendar} />
            </Tooltip>
            <Tooltip text="Tasks carried forward this month" position="bottom">
              <StatBadge label="This Month" value={carryForwardStats.month} icon={TrendingUp} />
            </Tooltip>
            <Tooltip text="Tasks carried forward this year" position="bottom">
              <StatBadge label="This Year" value={carryForwardStats.year} icon={BarChart3} />
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Task Breakdown */}
      {allItems.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Completed tasks */}
          {completedTasks.map((task) => (
            <div
              key={task.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '12px 16px',
                background: 'rgba(16, 185, 129, 0.04)',
                borderRadius: '10px',
                border: '1px solid rgba(16, 185, 129, 0.1)',
                opacity: 0.6,
                transition: 'all 0.3s ease'
              }}
            >
              <CheckCircle size={18} color="#10B981" />
              <span
                style={{
                  flex: 1,
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'var(--gray-400)',
                  textDecoration: 'line-through'
                }}
              >
                {task.title}
              </span>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  color: '#10B981',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em'
                }}
              >
                Done
              </span>
            </div>
          ))}

          {/* Incomplete tasks */}
          {incompleteTasks.map((task) => {
            const isCarried = carriedIds.has(task.id);
            return (
              <div
                key={task.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '12px 16px',
                  background: isCarried ? 'rgba(245, 158, 11, 0.04)' : 'var(--surface-3)',
                  borderRadius: '10px',
                  border: isCarried ? '1px solid rgba(245, 158, 11, 0.15)' : '1px solid var(--border)',
                  opacity: isCarried ? 0.4 : 1,
                  transform: isCarried ? 'translateX(8px)' : 'none',
                  transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                <Circle size={18} color={task.status === 'missed' ? '#EF4444' : 'var(--gray-600)'} />
                <span
                  style={{
                    flex: 1,
                    fontSize: '14px',
                    fontWeight: 700,
                    color: 'var(--white)'
                  }}
                >
                  {task.title}
                  {task.goalId && (
                    <span style={{ fontSize: '10px', color: 'var(--gray-600)', marginLeft: '8px', fontWeight: 600 }}>
                      → {goals.find(g => g.id === task.goalId)?.title || 'Goal'}
                    </span>
                  )}
                </span>
                {task.status === 'missed' && (
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 800,
                      color: '#EF4444',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginRight: '4px'
                    }}
                  >
                    Missed
                  </span>
                )}
                {!isCarried && (
                  <Tooltip text="Carry this task to tomorrow" position="left">
                    <button
                      id={`carry-forward-${task.id}`}
                      onClick={() => handleCarryOne(task.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 14px',
                        background: 'rgba(245, 158, 11, 0.08)',
                        border: '1px solid rgba(245, 158, 11, 0.2)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        color: '#F59E0B',
                        fontSize: '11px',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <ArrowRight size={14} />
                      Tomorrow
                    </button>
                  </Tooltip>
                )}
                {isCarried && (
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 800,
                      color: '#F59E0B',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em'
                    }}
                  >
                    Carried →
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Batch Carry Forward Button */}
      {incompleteTasks.length > 0 && !isCarryingAll && incompleteTasks.some(t => !carriedIds.has(t.id)) && (
        <button
          id="carry-forward-all-btn"
          onClick={handleCarryAll}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            padding: '14px 24px',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.05))',
            border: '1px solid rgba(245, 158, 11, 0.2)',
            borderRadius: '12px',
            cursor: 'pointer',
            color: '#F59E0B',
            fontSize: '13px',
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            transition: 'all 0.3s ease'
          }}
        >
          <FastForward size={18} />
          Carry All {incompleteTasks.filter(t => !carriedIds.has(t.id)).length} Tasks to Tomorrow
        </button>
      )}
    </div>
  );
};
