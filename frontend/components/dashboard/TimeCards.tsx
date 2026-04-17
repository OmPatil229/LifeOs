'use client';

import React from 'react';
import { useLifeStore } from '../../store/useLifeStore';
import { Zap, TrendingUp, CalendarCheck, AlertTriangle, Plus, Smile, Frown, Meh, Battery, BrainCircuit, Clock, PenLine, Mountain, Sparkles, Target, Trash2, Edit, Check, Circle, Sunrise, Sun, Sunset, Moon, CheckCircle } from 'lucide-react';
import { Tooltip } from '../ui/Tooltip';
import { SessionTimer } from './SessionTimer';
import { GoalTrack } from './GoalTrack';
import { GoalEditor } from './GoalEditor';
import { WeeklyPipeline } from './WeeklyPipeline';
import { ProductivityChart } from './ProductivityChart';
import { TrajectorySummary } from './TrajectorySummary';
import { BiometricTrendChart } from './BiometricTrendChart';
import { DecisionCard } from './DashboardElements';
import { DailyReview } from './DailyReview';
import { format, getWeek, getMonth, getYear } from 'date-fns';

// Date Format Helpers
const getWeekStr = (d: string) => d + '-W';
const getMonthStr = (d: string) => d.substring(0, 7);
const getYearStr = (d: string) => d.substring(0, 4);

/* ─── Shared Components ─── */

const InsightBox = ({ text }: { text: string }) => {
  if (!text) return null;
  return (
    <div style={{ padding: '24px 32px', background: 'var(--surface-3)', borderRadius: '18px', border: '1px solid var(--border)', display: 'flex', gap: '18px', alignItems: 'flex-start' }}>
      <Zap size={24} color="var(--white)" style={{ flexShrink: 0, marginTop: '2px' }} />
      <span style={{ fontSize: '16px', color: 'var(--white)', lineHeight: 1.7, fontWeight: 500 }}>{text}</span>
    </div>
  );
};

const SectionLabel = ({ icon: Icon, label, tooltip }: { icon?: any, label: string, tooltip?: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
    {Icon && <Icon size={20} color="var(--gray-700)" />}
    <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</span>
    {tooltip && (
      <Tooltip text={tooltip} position="right">
        <span style={{ color: 'var(--gray-800)', cursor: 'help', fontSize: '13px', marginLeft: '4px' }}>ⓘ</span>
      </Tooltip>
    )}
  </div>
);

/** Mini mood picker — inline journal for the day view */
const MoodPicker = ({ value, onChange }: { value: number, onChange: (v: number) => void }) => {
  const moods = [
    { val: 1, icon: Frown, label: 'Rough' },
    { val: 2, icon: Frown, label: 'Low' },
    { val: 3, icon: Meh, label: 'Okay' },
    { val: 4, icon: Smile, label: 'Good' },
    { val: 5, icon: Smile, label: 'Great' },
  ];
  return (
    <div style={{ display: 'flex', gap: '10px' }}>
      {moods.map(m => {
        const Icon = m.icon;
        const active = value === m.val;
        return (
          <button
            key={m.val}
            onClick={() => onChange(m.val)}
            style={{
              flex: 1,
              padding: '16px 8px',
              borderRadius: '16px',
              border: active ? '2px solid var(--white)' : '2px solid var(--border)',
              background: active ? 'var(--white)' : 'transparent',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.3s ease'
            }}
          >
            <Icon size={24} color={active ? 'var(--black)' : 'var(--gray-700)'} />
            <span style={{ fontSize: '12px', fontWeight: 800, color: active ? 'var(--black)' : 'var(--gray-700)', textTransform: 'uppercase' }}>{m.label}</span>
          </button>
        );
      })}
    </div>
  );
};

/** Mini energy picker — inline for the day view */
const EnergyPicker = ({ value, onChange }: { value: number, onChange: (v: number) => void }) => {
  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', height: '60px' }}>
      {[1, 2, 3, 4, 5].map((val) => {
        const filled = value >= val;
        return (
          <button
            key={val}
            onClick={() => onChange(val)}
            style={{
              flex: 1,
              height: `${(val / 5) * 100}%`,
              background: filled ? 'var(--white)' : 'var(--gray-900)',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              opacity: filled ? 1 : 0.4
            }}
          />
        );
      })}
    </div>
  );
};

/** Daily To-Do list with integrated CRUD and Habits */
const DailyTodo = () => {
  const { timeline, completeTask, markHabitComplete, deleteTask, createTask, updateTask, selectedDate, goals } = useLifeStore();
  const [addingTo, setAddingTo] = React.useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = React.useState('');
  const [selectedGoalId, setSelectedGoalId] = React.useState<string>('');

  const handleToggle = async (item: any) => {
    if (item.type === 'habit') {
      await markHabitComplete(item.id, selectedDate);
    } else {
      await completeTask(item.id);
    }
  };

  const handleAdd = async (timeframe: string) => {
    if (!newTaskTitle.trim()) {
      setAddingTo(null);
      return;
    }
    await createTask({ 
      title: newTaskTitle.trim(), 
      timeframe,
      goalId: selectedGoalId || undefined
    });
    setNewTaskTitle('');
    setSelectedGoalId('');
    setAddingTo(null);
  };

  const handleRename = async (item: any) => {
    if (item.type === 'habit') return;
    const newTitle = prompt('Rename task:', item.title);
    if (newTitle && newTitle !== item.title) {
       await updateTask(item.id, { title: newTitle });
    }
  };

  const sections = [
    { id: 'morning', name: 'Morning', icon: Sunrise },
    { id: 'afternoon', name: 'Afternoon', icon: Sun },
    { id: 'evening', name: 'Evening', icon: Sunset },
    { id: 'night', name: 'Night', icon: Moon },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {sections.map(s => {
        const items = (timeline as any)[s.id] || [];
        const Icon = s.icon;
        
        return (
          <div key={s.id} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Icon size={20} color="var(--gray-700)" />
                <span style={{ fontSize: '14px', fontWeight: 900, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>{s.name}</span>
              </div>
              <button 
                onClick={() => setAddingTo(s.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-700)', padding: '6px' }}
              >
                <Plus size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {items.map((item: any) => {
                const isCompleted = item.status === 'completed';
                const LabelIcon = item.type === 'habit' ? Battery : (item.priority === 'high' || item.priority === 'critical' ? Target : Circle);
                
                return (
                  <div 
                    key={item.id} 
                    className="glass-card" 
                    style={{ 
                      padding: '16px 20px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '16px',
                      background: isCompleted ? 'rgba(255,255,255,0.01)' : 'var(--surface-2)',
                      borderColor: isCompleted ? 'transparent' : 'var(--border)',
                      opacity: isCompleted ? 0.4 : 1,
                      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                  >
                    <button 
                      onClick={() => handleToggle(item)}
                      style={{ 
                        background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                        color: isCompleted ? 'var(--white)' : 'var(--gray-800)'
                      }}
                    >
                      {isCompleted ? <CheckCircle size={22} /> : <Circle size={22} />}
                    </button>
                    
                    <div 
                      style={{ 
                        flex: 1, fontSize: '16px', fontWeight: 700, color: 'var(--white)',
                        textDecoration: isCompleted ? 'line-through' : 'none',
                        cursor: item.type === 'task' ? 'pointer' : 'default'
                      }}
                      onClick={() => handleRename(item)}
                    >
                      {item.title}
                      {item.type === 'habit' && <span style={{ fontSize: '10px', color: 'var(--gray-800)', marginLeft: '8px', fontWeight: 900, border: '1px solid var(--gray-800)', padding: '2px 6px', borderRadius: '4px' }}>HABIT</span>}
                      {item.goalId && <span style={{ fontSize: '10px', color: 'var(--white)', marginLeft: '8px', opacity: 0.4, fontWeight: 700 }}>→ {goals.find(g => g.id === item.goalId)?.title || 'Goal'}</span>}
                    </div>

                    {item.type === 'task' && (
                      <button 
                        onClick={() => deleteTask(item.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-700)', opacity: 0.6 }}
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                );
              })}

              {addingTo === s.id && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '8px 0' }}>
                  <input 
                    autoFocus
                    className="editable-textarea"
                    style={{ width: '100%', minHeight: '48px', padding: '12px 18px', borderRadius: '12px', fontSize: '15px' }}
                    placeholder="Task name here..."
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    onKeyDown={(e) => {
                       if (e.key === 'Enter') handleAdd(s.id);
                       if (e.key === 'Escape') setAddingTo(null);
                    }}
                  />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select 
                      value={selectedGoalId}
                      onChange={(e) => setSelectedGoalId(e.target.value)}
                      style={{ 
                        flex: 1, height: '36px', background: 'var(--surface-3)', border: '1px solid var(--border)', borderRadius: '8px', 
                        color: 'var(--white)', fontSize: '12px', padding: '0 12px', outline: 'none' 
                      }}
                    >
                      <option value="">No Linked Goal</option>
                      {goals.map(g => (
                        <option key={g.id} value={g.id}>{g.title} ({g.type.toUpperCase()})</option>
                      ))}
                    </select>
                    <button 
                      onClick={() => handleAdd(s.id)}
                      style={{ padding: '0 16px', background: 'var(--white)', color: 'var(--black)', borderRadius: '8px', fontWeight: 900, cursor: 'pointer', fontSize: '12px' }}
                    >
                      ADD
                    </button>
                    <button 
                      onClick={() => setAddingTo(null)}
                      style={{ padding: '0 12px', background: 'transparent', color: 'var(--gray-700)', border: 'none', cursor: 'pointer', fontSize: '12px' }}
                    >
                      CANCEL
                    </button>
                  </div>
                </div>
              )}

              {items.length === 0 && !addingTo && (
                <div style={{ fontSize: '11px', color: 'var(--gray-700)', padding: '8px 0', border: '1px dashed rgba(255,255,255,0.05)', borderRadius: '8px', textAlign: 'center' }}>
                  Empty block
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* Prominent insights metrics */
const InsightMetrics = () => {
  const { insights } = useLifeStore();
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {insights.accuracy?.isLocked ? (
        <div style={{ padding: '16px', background: 'var(--surface-2)', borderRadius: '10px', borderLeft: '4px solid #10B981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Target size={20} color="#10B981" />
              <span style={{ fontSize: '13px', fontWeight: 600 }}>Execution Integrity</span>
            </div>
            <span style={{ fontSize: '18px', fontWeight: 900, color: '#10B981' }}>{insights.accuracy.score}%</span>
          </div>
          <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '10px', color: 'var(--gray-500)', textTransform: 'uppercase', fontWeight: 800 }}>Planned Complete</span>
              <span style={{ fontSize: '14px', color: 'var(--white)', fontWeight: 700 }}>{insights.accuracy.completedCount} / {insights.accuracy.plannedCount}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '10px', color: 'var(--gray-500)', textTransform: 'uppercase', fontWeight: 800 }}>Reactive Tasks</span>
              <span style={{ fontSize: '14px', color: '#EF4444', fontWeight: 700 }}>{insights.accuracy.reactiveCount}</span>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--surface-2)', borderRadius: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <TrendingUp size={20} color="#10B981" />
            <span style={{ fontSize: '13px', fontWeight: 600 }}>Task Accuracy</span>
          </div>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--gray-500)' }}>{insights.accuracy?.text || 'Not locked'}</span>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--surface-2)', borderRadius: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CalendarCheck size={20} color="#3B82F6" />
          <span style={{ fontSize: '13px', fontWeight: 600 }}>Habit Streak</span>
        </div>
        <span style={{ fontSize: '15px', fontWeight: 800, color: '#3B82F6' }}>{insights.habitPerformance}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: insights.burnoutRisk ? 'rgba(239, 68, 68, 0.06)' : 'var(--surface-2)', borderRadius: '10px', border: insights.burnoutRisk ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid transparent' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertTriangle size={20} color={insights.burnoutRisk ? '#EF4444' : '#6B7280'} />
          <span style={{ fontSize: '13px', fontWeight: 600 }}>Burnout Risk</span>
        </div>
        <span style={{ fontSize: '15px', fontWeight: 800, color: insights.burnoutRisk ? '#EF4444' : '#22C55E' }}>{insights.burnoutRisk ? 'Warning' : 'Low'}</span>
      </div>
    </div>
  );
};

/* ─── DAY CARD — 2-Column Layout with Integrated Journal + Timeline ─── */

export const DayCardContent = () => {
  const { dayData, setDayData, saveCard, selectedDate, dayInsight, decision, energy, fetchDecision, journal, fetchJournal, saveJournal, fetchTimeline, insights, commitDailyPlan } = useLifeStore();
  const [isAddingGoal, setIsAddingGoal] = React.useState(false);
  const [checkinTimeframe, setCheckinTimeframe] = React.useState<'morning'|'afternoon'|'evening'|'night'>('morning');
  const [localMood, setLocalMood] = React.useState(3);
  const [localEnergy, setLocalEnergy] = React.useState(3);

  React.useEffect(() => {
    fetchDecision();
    fetchJournal(selectedDate);
    fetchTimeline(selectedDate);
  }, [energy, selectedDate, fetchDecision, fetchJournal, fetchTimeline]);

  React.useEffect(() => {
    if (journal?.checkins?.[checkinTimeframe]) {
      setLocalMood(journal.checkins[checkinTimeframe]!.mood || 3);
      setLocalEnergy(journal.checkins[checkinTimeframe]!.energy || 3);
    } else {
      setLocalMood(3);
      setLocalEnergy(3);
    }
  }, [journal, checkinTimeframe]);

  const handleMoodChange = (v: number) => {
    setLocalMood(v);
    const updatedCheckins = {
       ...(journal?.checkins || {}),
       [checkinTimeframe]: { mood: v, energy: localEnergy }
    };
    saveJournal(selectedDate, { ...journal, checkins: updatedCheckins });
  };
  
  const handleEnergyChange = (v: number) => {
    setLocalEnergy(v);
    const updatedCheckins = {
       ...(journal?.checkins || {}),
       [checkinTimeframe]: { mood: localMood, energy: v }
    };
    saveJournal(selectedDate, { ...journal, checkins: updatedCheckins });
  };

  return (
    <div className="card-content-area" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>Today</h2>
          <span style={{ fontSize: '13px', color: 'var(--gray-500)', fontWeight: 600 }}>{format(new Date(selectedDate + 'T00:00:00'), 'EEEE, MMMM do, yyyy')}</span>
        </div>
        <Tooltip text="Add a goal for today">
          <button onClick={() => setIsAddingGoal(true)} style={{ padding: '10px 20px', border: '1px solid var(--border)', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--surface-2)', transition: 'all 0.2s' }}>
            <Plus size={18} /> <span style={{ fontSize: '13px', fontWeight: 700 }}>Add Goal</span>
          </button>
        </Tooltip>
      </div>

      {/* TWO-COLUMN LAYOUT */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* LEFT: Check-in + Notes + Timer */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Quick Check-in (inline journal) */}
          <div style={{ background: 'var(--surface-2)', borderRadius: '14px', padding: '20px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '10px', marginBottom: '20px' }}>
              {[
                { id: 'morning', icon: Sunrise },
                { id: 'afternoon', icon: Sun },
                { id: 'evening', icon: Sunset },
                { id: 'night', icon: Moon }
              ].map(t => {
                const Icon = t.icon;
                const active = checkinTimeframe === t.id;
                return (
                  <button 
                    key={t.id}
                    onClick={() => setCheckinTimeframe(t.id as any)}
                    style={{
                      flex: 1, padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                      background: active ? 'var(--white)' : 'transparent',
                      color: active ? 'black' : 'var(--gray-500)',
                      transition: 'all 0.2s',
                    }}
                  >
                    <Icon size={16} />
                  </button>
                );
              })}
            </div>

            <SectionLabel icon={Smile} label={`${checkinTimeframe.charAt(0).toUpperCase() + checkinTimeframe.slice(1)} Check-in`} tooltip="Track mood and energy to see behavioral patterns throughout your day" />
            
            <MoodPicker value={localMood} onChange={handleMoodChange} />
            <div style={{ marginTop: '16px' }}>
              <SectionLabel icon={Battery} label="Energy" />
              <EnergyPicker value={localEnergy} onChange={handleEnergyChange} />
            </div>
          </div>

          {/* Notes */}
          <div>
            <SectionLabel icon={PenLine} label="Quick Notes" tooltip="Plans, thoughts, or reminders for today" />
            <textarea 
              className="editable-textarea"
              style={{ width: '100%', minHeight: '90px', padding: '14px', borderRadius: '10px', fontSize: '14px' }}
              value={dayData}
              onChange={(e) => setDayData(e.target.value)}
              onBlur={(e) => saveCard('day', selectedDate, e.target.value)}
              placeholder="What's on your mind today?..."
            />
          </div>

          {/* Focus Timer */}
          <SessionTimer />
        </div>

        {/* RIGHT: Insights + Schedule + Suggestion */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* AI suggestion */}
          {decision && <DecisionCard title={decision.title} subtitle={decision.subtitle} energy={energy} />}

          {/* Commit Plan Banner */}
          {!insights.accuracy?.isLocked && (
            <div style={{ background: 'var(--surface-2)', padding: '16px', borderRadius: '12px', border: '1px dashed var(--gray-700)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
               <div>
                 <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--white)' }}>Day Plan Not Locked</div>
                 <div style={{ fontSize: '12px', color: 'var(--gray-500)', marginTop: '4px' }}>Commit your plan to track Execution Integrity.</div>
               </div>
               <button 
                 onClick={() => commitDailyPlan()}
                 style={{ background: 'var(--white)', color: 'var(--black)', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 900, cursor: 'pointer', fontSize: '12px' }}
               >
                 COMMIT PLAN
               </button>
            </div>
          )}

          {/* Today's Schedule (mini timeline) */}
          <div style={{ background: 'var(--surface-2)', borderRadius: '14px', padding: '20px', border: '1px solid var(--border)' }}>
            <SectionLabel icon={Clock} label="Daily To-Do" tooltip="Your mixed list of tasks and habits for the day" />
            <DailyTodo />
          </div>

          {/* Key Metrics */}
          <InsightMetrics />
        </div>
      </div>

      {/* FULL-WIDTH: Daily Review + Goals + Insights */}
      <DailyReview />
      
      <GoalTrack type="day" />
      
      {dayInsight && <InsightBox text={dayInsight} />}
      {!dayInsight && <InsightBox text="Start a focus session or log your mood to see personalized insights here!" />}

      {isAddingGoal && <GoalEditor type="day" onClose={() => setIsAddingGoal(false)} />}
    </div>
  );
};

/* ─── WEEK CARD ─── */

export const WeekCardContent = () => {
  const { weekData, setWeekData, saveCard, selectedDate, weekInsight } = useLifeStore();
  const [isAddingGoal, setIsAddingGoal] = React.useState(false);

  return (
    <div className="card-content-area" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 800, margin: 0 }}>This Week</h2>
        <Tooltip text="Set a goal for this week">
          <button onClick={() => setIsAddingGoal(true)} style={{ padding: '10px 20px', border: '1px solid var(--border)', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--surface-2)' }}>
            <Plus size={18} /> <span style={{ fontSize: '13px', fontWeight: 700 }}>Add Goal</span>
          </button>
        </Tooltip>
      </div>

      <div>
        <SectionLabel icon={Target} label="Weekly Focus" tooltip="The main objectives you want to achieve this week" />
        <textarea 
          className="editable-textarea"
          style={{ width: '100%', minHeight: '80px', padding: '14px', borderRadius: '10px', fontSize: '14px' }}
          value={weekData}
          onChange={(e) => setWeekData(e.target.value)}
          onBlur={(e) => saveCard('week', getWeekStr(selectedDate), e.target.value)}
          placeholder="What are your main objectives this week?..."
        />
      </div>
      
      <GoalTrack type="week" />
      <WeeklyPipeline />
      <BiometricTrendChart type="week" />
      <InsightBox text={weekInsight} />
      {isAddingGoal && <GoalEditor type="week" onClose={() => setIsAddingGoal(false)} />}
    </div>
  );
};

/* ─── MONTH CARD ─── */

export const MonthCardContent = () => {
  const { monthData, setMonthData, saveCard, selectedDate, monthInsight } = useLifeStore();
  const [isAddingGoal, setIsAddingGoal] = React.useState(false);

  return (
    <div className="card-content-area" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 800, margin: 0 }}>This Month</h2>
        <Tooltip text="Set a monthly milestone">
          <button onClick={() => setIsAddingGoal(true)} style={{ padding: '10px 20px', border: '1px solid var(--border)', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--surface-2)' }}>
            <Plus size={18} /> <span style={{ fontSize: '13px', fontWeight: 700 }}>Add Goal</span>
          </button>
        </Tooltip>
      </div>

      <div>
        <SectionLabel icon={CalendarCheck} label="Month at a Glance" />
        <textarea 
          className="editable-textarea"
          style={{ width: '100%', minHeight: '80px', padding: '14px', borderRadius: '10px', fontSize: '14px' }}
          value={monthData}
          onChange={(e) => setMonthData(e.target.value)}
          onBlur={(e) => saveCard('month', getMonthStr(selectedDate), e.target.value)}
          placeholder="What's the big picture for this month?..."
        />
      </div>
      
      <GoalTrack type="month" />
      <TrajectorySummary type="month" />
      <BiometricTrendChart type="month" />
      <InsightBox text={monthInsight} />
      {isAddingGoal && <GoalEditor type="month" onClose={() => setIsAddingGoal(false)} />}
    </div>
  );
};

/* ─── YEAR CARD ─── */

export const YearCardContent = () => {
  const { yearData, setYearData, saveCard, selectedDate, yearInsight } = useLifeStore();
  const [isAddingGoal, setIsAddingGoal] = React.useState(false);

  return (
    <div className="card-content-area" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 800, margin: 0 }}>This Year</h2>
        <Tooltip text="Define a yearly vision">
          <button onClick={() => setIsAddingGoal(true)} style={{ padding: '10px 20px', border: '1px solid var(--border)', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--surface-2)' }}>
            <Plus size={18} /> <span style={{ fontSize: '13px', fontWeight: 700 }}>Add Goal</span>
          </button>
        </Tooltip>
      </div>

      <div>
        <SectionLabel icon={Mountain} label="Yearly Vision" />
        <textarea 
          className="editable-textarea"
          style={{ width: '100%', minHeight: '80px', padding: '14px', borderRadius: '10px', fontSize: '14px' }}
          value={yearData}
          onChange={(e) => setYearData(e.target.value)}
          onBlur={(e) => saveCard('year', getYearStr(selectedDate), e.target.value)}
          placeholder="What's your ultimate vision for this year?..."
        />
      </div>
      
      <GoalTrack type="year" />
      <TrajectorySummary type="year" />
      <BiometricTrendChart type="year" />
      <InsightBox text={yearInsight} />
      {isAddingGoal && <GoalEditor type="year" onClose={() => setIsAddingGoal(false)} />}
    </div>
  );
};
