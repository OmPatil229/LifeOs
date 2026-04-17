'use client';

import React, { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useLifeStore } from '../../store/useLifeStore';
import { Target, ChevronRight, CheckCircle2, ArrowRight } from 'lucide-react';

export const OnboardingFlow = () => {
  const [step, setStep] = useState(1); // 1: Year, 2: Month, 3: Week
  const [goalTitle, setGoalTitle] = useState('');
  const [lastGoalId, setLastGoalId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { completeOnboarding } = useAuthStore();
  const { createGoal, createHabit, createTask } = useLifeStore();
  const [selectedHabits, setSelectedHabits] = useState<number[]>([]);
  const [tasks, setTasks] = useState<string[]>(['', '']);

  const STEPS = [
    { title: 'Strategic Vision', subtitle: 'Define your Core Objective for the Year.', type: 'year' },
    { title: 'Phased Alignment', subtitle: 'What must happen this Month to stay on track?', type: 'month' },
    { title: 'Tactical Execution', subtitle: 'What is the #1 focus for this Week?', type: 'week' },
    { title: 'Behavioral Infrastructure', subtitle: 'Choose habits that drive this week\'s goal.', type: 'habits' },
    { title: 'Immediate Momentum', subtitle: 'What are 2 things you must do Today?', type: 'tasks' },
  ];

  const SEED_HABITS = [
    { name: 'Morning Focus Block', icon: '🧠', timeframe: 'morning', scheduleDays: [1,2,3,4,5] },
    { name: 'Daily Review', icon: '📋', timeframe: 'evening', scheduleDays: [0,1,2,3,4,5,6] },
    { name: 'Physical Output', icon: '💪', timeframe: 'afternoon', scheduleDays: [1,3,5] },
    { name: 'Deep Sleep Prep', icon: '🌙', timeframe: 'night', scheduleDays: [0,1,2,3,4,5,6] },
  ];

  const currentStep = STEPS[step - 1];

  const handleNext = async (skip = false) => {
    setIsSubmitting(true);
    try {
      if (step <= 3) {
        if (!skip && goalTitle.trim()) {
          const res: any = await createGoal({
            title: goalTitle.trim(),
            type: currentStep.type as any,
            parentId: lastGoalId || undefined,
            status: 'active',
            progressPercentage: 0,
          });
          if (res && res.id) setLastGoalId(res.id);
        } else {
          setLastGoalId(null);
        }
      } else if (step === 4) {
        // Create selected habits
        for (const idx of selectedHabits) {
          const h = SEED_HABITS[idx];
          await createHabit({
            ...h,
            goalId: lastGoalId || undefined,
            color: 'var(--gray-500)',
          });
        }
      } else if (step === 5) {
        // Create tasks
        for (const tTitle of tasks) {
          if (tTitle.trim()) {
            await createTask({
              title: tTitle.trim(),
              goalId: lastGoalId || undefined,
              timeframe: 'afternoon',
            });
          }
        }
        await completeOnboarding();
        return;
      }

      setStep(step + 1);
      setGoalTitle('');
    } catch (err) {
      console.error('Onboarding step failed', err);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div style={{ 
      position: 'fixed', 
      inset: 0, 
      background: 'black', 
      zIndex: 2000, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{ maxWidth: '480px', width: '100%', position: 'relative' }}>
        
        {/* Progress Bar */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '48px' }}>
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} style={{ 
              flex: 1, 
              height: '4px', 
              background: s <= step ? 'white' : 'var(--gray-900)',
              transition: 'all 0.5s ease' 
            }} />
          ))}
        </div>

        <div className="caps" style={{ color: 'var(--gray-500)', fontSize: '12px', marginBottom: '16px', letterSpacing: '0.2em' }}>
          STEP 0{step} — {currentStep.title.toUpperCase()}
        </div>

        <h1 style={{ fontSize: '42px', fontWeight: 900, color: 'white', lineHeight: 1.1, marginBottom: '16px', letterSpacing: '-0.03em' }}>
          {currentStep.subtitle}
        </h1>

        <div style={{ marginTop: '48px' }}>
           {step <= 3 && (
             <input 
              autoFocus
              className="editable-textarea"
              style={{ 
                  width: '100%', 
                  background: 'transparent', 
                  border: 'none', 
                  borderBottom: '2px solid var(--gray-800)',
                  fontSize: '24px',
                  padding: '16px 0',
                  color: 'white',
                  outline: 'none',
                  marginBottom: '48px'
              }}
              placeholder="Type your objective here..."
              value={goalTitle}
              onChange={(e) => setGoalTitle(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleNext()}
             />
           )}

           {step === 4 && (
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '48px' }}>
               {SEED_HABITS.map((h, i) => (
                 <button
                   key={i}
                   onClick={() => {
                     setSelectedHabits(prev => 
                       prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]
                     );
                   }}
                   style={{
                     padding: '24px',
                     background: selectedHabits.includes(i) ? 'white' : 'var(--gray-900)',
                     color: selectedHabits.includes(i) ? 'black' : 'white',
                     border: 'none',
                     textAlign: 'left',
                     cursor: 'pointer',
                     borderRadius: '2px',
                     transition: 'all 0.3s'
                   }}
                 >
                   <div style={{ fontSize: '24px', marginBottom: '12px' }}>{h.icon}</div>
                   <div style={{ fontWeight: 700 }}>{h.name}</div>
                   <div style={{ fontSize: '11px', opacity: 0.6, marginTop: '4px' }}>{h.timeframe.toUpperCase()}</div>
                 </button>
               ))}
             </div>
           )}

           {step === 5 && (
             <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '48px' }}>
               {tasks.map((t, i) => (
                 <input
                   key={i}
                   autoFocus={i === 0}
                   className="editable-textarea"
                   style={{ 
                     width: '100%', 
                     background: 'transparent', 
                     border: 'none', 
                     borderBottom: '2px solid var(--gray-800)',
                     fontSize: '24px',
                     padding: '16px 0',
                     color: 'white',
                     outline: 'none'
                   }}
                   placeholder={`Task ${i + 1}...`}
                   value={t}
                   onChange={(e) => {
                     const newTasks = [...tasks];
                     newTasks[i] = e.target.value;
                     setTasks(newTasks);
                   }}
                 />
               ))}
             </div>
           )}

           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
             <button 
               onClick={() => handleNext(true)}
               className="caps"
               style={{ background: 'none', border: 'none', color: 'var(--gray-700)', cursor: 'pointer', fontSize: '11px', fontWeight: 700, visibility: step > 3 ? 'hidden' : 'visible' }}
             >
               SKIP FOR NOW
             </button>

             <button 
               onClick={() => handleNext(false)}
               disabled={isSubmitting || (step <= 3 && !goalTitle.trim())}
               style={{ 
                 background: 'white', 
                 color: 'black', 
                 border: 'none', 
                 padding: '16px 32px', 
                 borderRadius: '2px', 
                 fontWeight: 900,
                 cursor: 'pointer',
                 display: 'flex',
                 alignItems: 'center',
                 gap: '12px',
                 opacity: (step > 3 || goalTitle.trim()) ? 1 : 0.3,
                 transition: 'all 0.3s'
               }}
             >
               {step === 5 ? 'INITIALIZE SYSTEM' : 'COMMIT & NEXT'}
               <ArrowRight size={18} />
             </button>
           </div>
        </div>

        {/* Footer Info */}
        <div style={{ marginTop: '80px', display: 'flex', alignItems: 'flex-start', gap: '16px', opacity: 0.4 }}>
            <Target size={16} style={{ marginTop: '2px' }} />
            <p style={{ fontSize: '12px', color: 'white', lineHeight: 1.5, margin: 0 }}>
                These objectives will form the core of your Strategic Alignment Pipeline. 
                Daily progress will automatically propagate up to these targets.
            </p>
        </div>
      </div>
    </div>
  );
};
