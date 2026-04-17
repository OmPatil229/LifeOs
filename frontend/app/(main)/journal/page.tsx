'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { SentimentMetric } from '../../../components/journal/JournalElements';
import { PenTool, Save, Lightbulb } from 'lucide-react';
import { useLifeStore } from '../../../store/useLifeStore';
import { format } from 'date-fns';

/**
 * Journal Page — Multi-horizon audit of behaviors and strategic vision.
 */
export default function JournalPage() {
  const { selectedDate, journal, fetchJournal, saveJournal, journalHistory, fetchJournalHistory, setSelectedDate, searchJournalEntries } = useLifeStore();
  const [localEntry, setLocalEntry] = useState({ mood: 3, energy: 3, stress: 1, content: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'day' | 'week' | 'month' | 'year'>('day');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Debounced Search Engine
  useEffect(() => {
    const timer = setTimeout(() => {
        searchJournalEntries(searchTerm);
    }, 400); // 400ms debounce to prevent API spam at scale
    return () => clearTimeout(timer);
  }, [searchTerm, searchJournalEntries]);

  // Derive the correct period string based on mode
  const currentPeriod = useMemo(() => {
    try {
      const dateObj = new Date(selectedDate + 'T00:00:00');
      if (filterMode === 'day') return selectedDate;
      if (filterMode === 'week') return format(dateObj, "yyyy-'W'II");
      if (filterMode === 'month') return format(dateObj, 'yyyy-MM');
      return format(dateObj, 'yyyy');
    } catch (e) {
      return selectedDate;
    }
  }, [selectedDate, filterMode]);

  useEffect(() => {
    fetchJournal(currentPeriod);
    fetchJournalHistory();
  }, [currentPeriod, fetchJournal, fetchJournalHistory]);

  useEffect(() => {
    if (journal) {
      setLocalEntry({
        mood: journal.mood || 3,
        energy: journal.energy || 3,
        stress: journal.stress || 1,
        content: journal.content || ''
      });
    } else {
      setLocalEntry({ mood: 3, energy: 3, stress: 1, content: '' });
    }
  }, [journal]);

  const handleSave = async () => {
    setIsSaving(true);
    await saveJournal(currentPeriod, localEntry);
    await fetchJournalHistory();
    setIsSaving(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const getLabel = (date: string) => {
    try {
        if (date.includes('-W')) return `Week ${date.split('-W')[1]}`;
        if (date.length === 7) return format(new Date(date + '-01T00:00:00'), 'MMMM');
        if (date.length === 4) return date;
        return format(new Date(date + 'T00:00:00'), 'MMM do');
    } catch(e) { return date; }
  };

  const displayHistory = useMemo(() => {
    return (journalHistory || []).sort((a: any, b: any) => b.date.localeCompare(a.date));
  }, [journalHistory]);

  const groupedHistory: Record<string, any[]> = {};
  displayHistory.forEach(entry => {
     let monthHeader = 'History';
     try {
       const dateRef = entry.date.length === 4 ? `${entry.date}-01-01` : entry.date.includes('-W') ? entry.date.split('-W')[0] + '-01-01' : entry.date.length === 7 ? `${entry.date}-01` : entry.date;
       monthHeader = format(new Date(dateRef + 'T00:00:00'), 'yyyy');
     } catch(e) {}
     if (!groupedHistory[monthHeader]) groupedHistory[monthHeader] = [];
     groupedHistory[monthHeader].push(entry);
  });

  return (
    <div className="content-max-width" style={{ animation: 'fadeIn 0.5s ease-out', display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 3fr', gap: 64 }}>
      
      {/* LEFT: Book of Records (Deep Filing System) */}
      <div style={{ position: 'sticky', top: 32, height: 'calc(100vh - 64px)', paddingRight: 32, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <PenTool size={20} color="var(--white)" />
            <h2 className="caps" style={{ fontSize: '13px', fontWeight: 900, letterSpacing: '0.1em' }}>{filterMode.toUpperCase()} Records</h2>
         </div>

         <div style={{ position: 'relative', marginBottom: 24 }}>
            <input 
              type="text" 
              placeholder={`Search ${filterMode} entries...`} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', background: 'var(--surface-3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 16px', color: 'white', fontSize: '13px', outline: 'none' }}
            />
         </div>

         <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
            {Object.entries(groupedHistory).map(([year, entries]) => (
              <div key={year}>
                 <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--gray-700)', textTransform: 'uppercase', marginBottom: 12, letterSpacing: '0.05em', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                    {year}
                 </div>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {entries.map((entry) => {
                       const isActive = entry.date === currentPeriod;
                       return (
                         <button 
                          key={entry.date}
                          onClick={() => {
                            if (entry.date.length === 10 && !entry.date.includes('-W')) setSelectedDate(entry.date);
                          }}
                          style={{ 
                            textAlign: 'left', background: isActive ? 'var(--surface-3)' : 'transparent', border: '1px solid',
                            borderColor: isActive ? 'var(--white)' : 'transparent', padding: '12px 14px', borderRadius: '12px', cursor: 'pointer',
                            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                          }}
                         >
                            <div style={{ fontSize: '13px', fontWeight: 700, color: 'white', marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {getLabel(entry.date)}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--gray-500)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {entry.content || 'Blank Record'}
                            </div>
                         </button>
                       );
                    })}
                 </div>
              </div>
            ))}
            {displayHistory.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--gray-700)', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}>
                {`No ${filterMode} records`}
              </div>
            )}
         </div>
      </div>

      {/* RIGHT: Active Area */}
      <div style={{ paddingBottom: 64 }}>
        <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontSize: '48px', fontWeight: 900, letterSpacing: '-0.05em', margin: 0 }}>Journal</h1>
            <p style={{ marginTop: '8px', color: 'var(--gray-500)', fontSize: '18px', fontWeight: 600 }}>{currentPeriod}</p>
          </div>

          <div style={{ display: 'flex', background: 'var(--surface-1)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border)' }}>
             {(['day', 'week', 'month', 'year'] as const).map((m) => (
               <button 
                key={m}
                onClick={() => setFilterMode(m)}
                style={{ 
                  padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                  fontSize: '12px', fontWeight: 700, textTransform: 'uppercase',
                  background: filterMode === m ? 'var(--white)' : 'transparent',
                  color: filterMode === m ? 'black' : 'var(--gray-500)',
                  transition: '0.2s'
                }}
               >
                 {m}
               </button>
             ))}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '40px', borderRadius: '24px', border: '1px solid var(--border)' }}>
            <div style={{ marginBottom: '40px' }}>
               <h3 className="caps" style={{ fontSize: '12px', fontWeight: 900, color: 'var(--gray-500)', marginBottom: '24px', letterSpacing: '0.1em' }}>Biometric Indicators</h3>
               <div style={{ display: 'flex', gap: 40 }}>
                  <SentimentMetric label="Mood" value={localEntry.mood} max={5} onChange={(v) => setLocalEntry({...localEntry, mood: v})} />
                  <SentimentMetric label="Energy" value={localEntry.energy} max={5} onChange={(v) => setLocalEntry({...localEntry, energy: v})} />
                  <SentimentMetric label="Stress" value={localEntry.stress} max={5} onChange={(v) => setLocalEntry({...localEntry, stress: v})} />
               </div>
            </div>

            <div style={{ marginBottom: '32px' }}>
               <h3 className="caps" style={{ fontSize: '12px', fontWeight: 900, color: 'var(--gray-500)', marginBottom: '20px', letterSpacing: '0.1em' }}>{filterMode.toUpperCase()} Narrative</h3>
               <textarea 
                  value={localEntry.content}
                  onChange={(e) => setLocalEntry({...localEntry, content: e.target.value})}
                  placeholder={`Record your ${filterMode} observations...`}
                  style={{ width: '100%', height: 380, background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: '16px', color: 'white', padding: '24px', fontSize: '17px', outline: 'none', resize: 'none', lineHeight: 1.8 }}
               />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 24 }}>
               {savedSuccess && <span style={{ color: 'var(--gray-500)', fontSize: '13px', fontWeight: 700 }}>Record Saved</span>}
               <button 
                  onClick={handleSave}
                  style={{ 
                    padding: '16px 40px', background: 'var(--white)', color: 'black', borderRadius: '12px',
                    fontWeight: 900, textTransform: 'uppercase', fontSize: '13px', cursor: 'pointer', border: 'none',
                    transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', gap: 10
                  }}
               >
                  {isSaving ? 'Logging...' : <><Save size={18} /> Update {filterMode}</>}
               </button>
            </div>
        </div>
      </div>
    </div>
  );
}
