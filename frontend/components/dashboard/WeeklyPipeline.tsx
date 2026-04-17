'use client';

import React, { useEffect } from 'react';
import { useLifeStore } from '../../store/useLifeStore';
import { CheckCircle2, Circle } from 'lucide-react';
import { format, addDays, startOfWeek, parseISO } from 'date-fns';

export const WeeklyPipeline = () => {
  const { selectedDate, weeklyTimeline, fetchWeeklyTimeline, moveTask, completeTask, insights } = useLifeStore();
  
  const weekStart = startOfWeek(parseISO(selectedDate), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  useEffect(() => {
    fetchWeeklyTimeline(format(weekStart, 'yyyy-MM-dd'));
  }, [selectedDate]);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDrop = async (e: React.DragEvent, targetDate: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      const peakHour = parseInt(insights.peakTime.split('around ')[1]?.split(':')[0] || '10');
      const timeframe = peakHour < 12 ? 'morning' : peakHour < 17 ? 'afternoon' : 'evening';
      await moveTask(taskId, targetDate, timeframe);
    }
  };

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); };

  const allTasks = Object.values(weeklyTimeline).flat();
  const completedTasks = allTasks.filter(t => t.status === 'completed').length;
  const totalTasks = allTasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div style={{ marginTop: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ fontSize: '18px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Weekly Momentum: <span style={{ color: 'var(--white)' }}>{completionRate}%</span>
        </div>
        <div style={{ fontSize: '15px', color: 'var(--gray-700)', fontWeight: 700 }}>
          {completedTasks}/{totalTasks} TASKS COMPLETE
        </div>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(7, 1fr)', 
        gap: '12px',
        minHeight: '220px'
      }}>
        {weekDays.map((date) => {
          const dateStr = format(date, 'yyyy-MM-dd');
          const dayTasks = weeklyTimeline[dateStr] || [];
          const isToday = dateStr === format(new Date(), 'yyyy-MM-dd');

          return (
            <div 
              key={dateStr}
              onDragOver={onDragOver}
              onDrop={(e) => handleDrop(e, dateStr)}
              className="glass-card"
              style={{ 
                padding: '16px', 
                borderRadius: '16px',
                background: isToday ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.01)',
                borderColor: isToday ? 'var(--white)' : 'var(--border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              <div style={{ textAlign: 'center', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: '13px', fontWeight: 900, color: isToday ? 'var(--white)' : 'var(--gray-700)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                  {format(date, 'EEE')}
                </div>
                <div style={{ fontSize: '20px', fontWeight: 900 }}>{format(date, 'd')}</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                {dayTasks.map((task) => {
                  const isCompleted = task.status === 'completed';
                  return (
                    <div 
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      style={{ 
                        padding: '10px 14px', 
                        background: isCompleted ? 'rgba(255,255,255,0.02)' : 'var(--surface-3)', 
                        borderRadius: '12px',
                        fontSize: '13px',
                        cursor: 'grab',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        opacity: isCompleted ? 0.4 : 1,
                        textDecoration: isCompleted ? 'line-through' : 'none',
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        borderColor: isCompleted ? 'transparent' : 'var(--border)',
                        borderLeftColor: isCompleted ? 'transparent' : 'var(--white)',
                        borderLeftWidth: isCompleted ? '0px' : '3px',
                        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                        boxShadow: isCompleted ? 'none' : '0 4px 12px rgba(0,0,0,0.1)'
                      }}
                    >
                      <div 
                        onClick={(e) => { e.stopPropagation(); completeTask(task.id); }}
                        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                      >
                        {isCompleted ? <CheckCircle2 size={16} color="var(--white)" /> : <Circle size={16} color="var(--gray-800)" />}
                      </div>
                      <span style={{ fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                        {task.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
