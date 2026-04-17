'use client';

import React, { useEffect } from 'react';
import { TimelineSection } from '../../../components/timeline/TimelineElements';
import { useLifeStore } from '../../../store/useLifeStore';
import { Clock, Calendar, Search, Sunrise, Sun, Sunset, Moon, Hourglass, Lightbulb } from 'lucide-react';
import { Tooltip } from '../../../components/ui/Tooltip';
import { format } from 'date-fns';

/**
 * Timeline Page — Your daily schedule organized by time of day.
 */
export default function TimelinePage() {
  const { selectedDate, timeline, fetchTimeline, markHabitComplete, completeTask, insights, fetchInsights } = useLifeStore();

  useEffect(() => {
    fetchTimeline(selectedDate);
    fetchInsights();
  }, [selectedDate, fetchTimeline, fetchInsights]);

  // Calculate real time remaining metrics
  const now = new Date();
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
  
  const msLeft = endOfDay.getTime() - now.getTime();
  const hoursLeft = Math.max(0, Math.floor(msLeft / (1000 * 60 * 60)));
  const minsLeft = Math.max(0, Math.floor((msLeft % (1000 * 60 * 60)) / (1000 * 60)));
  
  const totalMsInDay = 24 * 60 * 60 * 1000;
  const elapsedMs = totalMsInDay - msLeft;
  const percentDone = Math.round((elapsedMs / totalMsInDay) * 100);

  return (
    <div className="content-max-width" style={{ animation: 'fadeIn 0.5s ease-out' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>Today's Schedule</h1>
        <p style={{ marginTop: '6px', color: 'var(--gray-500)', fontSize: '14px' }}>
          <Calendar size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} />
          {format(new Date(selectedDate + 'T00:00:00'), 'EEEE, MMMM do, yyyy')}
        </p>
      </div>

      {/* Search bar placeholder */}
      <div className="glass-card" style={{ padding: '14px 20px', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 12, borderRadius: '12px' }}>
        <Search size={20} color="var(--gray-500)" />
        <input 
          type="text" 
          placeholder="Search tasks and habits..." 
          style={{ background: 'none', border: 'none', color: 'white', outline: 'none', fontSize: 14, flex: 1 }}
        />
      </div>

      {/* Timeline + Sidebar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: 48 }}>
        
        <div>
          <TimelineSection 
            name="Morning" 
            icon={Sunrise}
            items={timeline.morning} 
            onHabitComplete={(id: string) => markHabitComplete(id, selectedDate)} 
            onTaskComplete={(id: string) => completeTask(id)}
          />
          <TimelineSection 
            name="Afternoon" 
            icon={Sun}
            items={timeline.afternoon} 
            onHabitComplete={(id: string) => markHabitComplete(id, selectedDate)} 
            onTaskComplete={(id: string) => completeTask(id)}
          />
          <TimelineSection 
            name="Evening" 
            icon={Sunset}
            items={timeline.evening} 
            onHabitComplete={(id: string) => markHabitComplete(id, selectedDate)} 
            onTaskComplete={(id: string) => completeTask(id)}
          />
          <TimelineSection 
            name="Night" 
            icon={Moon}
            items={timeline.night} 
            onHabitComplete={(id: string) => markHabitComplete(id, selectedDate)} 
            onTaskComplete={(id: string) => completeTask(id)}
          />
        </div>

        {/* Context Sidebar */}
        <div style={{ position: 'sticky', top: 32, height: 'fit-content', display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="glass-card" style={{ padding: 24, borderRadius: '14px' }}>
             <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '14px', color: 'var(--gray-400)', display: 'flex', alignItems: 'center', gap: '8px' }}>
               <Hourglass size={18} /> Time Remaining
             </h3>
             <div style={{ height: 6, background: 'var(--surface-3)', borderRadius: 3 }}>
                <div style={{ width: `${100 - percentDone}%`, height: '100%', background: 'white', borderRadius: 3, boxShadow: '0 0 12px rgba(255,255,255,0.3)', transition: 'width 1s ease' }} />
             </div>
             <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--gray-500)' }}>~{hoursLeft}h {minsLeft}m left</span>
                <span style={{ color: 'white', fontWeight: 700 }}>{100 - percentDone}%</span>
             </div>
          </div>

          <div className="glass-card" style={{ padding: 24, borderRadius: '14px' }}>
             <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px', color: 'var(--gray-400)', display: 'flex', alignItems: 'center', gap: '8px' }}>
               <Lightbulb size={18} /> Tip
             </h3>
             <p style={{ fontSize: '14px', margin: 0, color: 'var(--gray-300)', lineHeight: 1.6 }}>
               {insights.peakTime ? `Your most productive hours are typically around ${insights.peakTime}. Protect this window.` : "Start logging your focus sessions to see your peak productivity window."}
               <br/><br/>
               {insights.failureReason && <span style={{ fontSize: '12px', color: 'var(--gray-500)', fontStyle: 'italic' }}>Note: {insights.failureReason}</span>}
             </p>
          </div>
        </div>

      </div>
    </div>
  );
}
