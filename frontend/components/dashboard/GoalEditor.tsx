import React, { useState } from 'react';
import { useLifeStore, TimeLayer } from '../../store/useLifeStore';
import { X, Plus, Target } from 'lucide-react';

export const GoalEditor = ({ type, onClose }: { type: TimeLayer, onClose: () => void }) => {
  const { createGoal, categories, addCategory } = useLifeStore();
  const [title, setTitle] = useState('');
  const [targetHours, setTargetHours] = useState(4);
  const [priority, setPriority] = useState('High');
  const [category, setCategory] = useState('Skill');

  const typeLabel = type === 'day' ? 'daily' : type === 'week' ? 'weekly' : type === 'month' ? 'monthly' : 'yearly';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createGoal({ title, type, targetHours, priority, category, status: 'active' });
    onClose();
  };

  return (
    <div style={{ 
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
      background: 'rgba(0, 0, 0, 0.85)', 
      backdropFilter: 'blur(8px)',
      zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div className="glass-card" style={{ 
        width: '440px', padding: '36px', borderRadius: '20px',
        boxShadow: '0 40px 100px rgba(0,0,0,1)',
        border: '1px solid var(--border)',
        background: 'var(--surface-1)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
             <Target size={22} color="var(--white)" />
             <span style={{ fontSize: '18px', fontWeight: 800 }}>Add a {typeLabel} Goal</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-500)', padding: '4px' }}>
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Title */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--gray-400)' }}>What do you want to achieve?</label>
            <input 
              className="editable-textarea"
              style={{ minHeight: '48px', padding: '14px 16px', fontSize: '15px', borderRadius: '10px', border: '1px solid var(--border)' }}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Complete the landing page redesign"
              required
            />
          </div>

          {/* Hours + Priority */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--gray-400)' }}>Hours needed</label>
              <input 
                type="number"
                className="editable-textarea"
                style={{ minHeight: '48px', padding: '14px 16px', fontSize: '15px', borderRadius: '10px', border: '1px solid var(--border)' }}
                value={targetHours}
                onChange={(e) => setTargetHours(Number(e.target.value))}
                min={1} max={24}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--gray-400)' }}>Priority</label>
              <select 
                className="editable-textarea"
                style={{ minHeight: '48px', padding: '14px 16px', fontSize: '15px', borderRadius: '10px', border: '1px solid var(--border)' }}
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          {/* Category */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--gray-400)' }}>Category</label>
              <button 
                type="button" 
                onClick={() => {
                  const name = prompt('New category name:');
                  if (name) addCategory(name.trim());
                }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-500)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                 <Plus size={14} /> Add New
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {categories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  style={{ 
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 700,
                    border: category === cat ? '2px solid var(--white)' : '1px solid var(--border)',
                    background: category === cat ? 'var(--white)' : 'transparent',
                    color: category === cat ? 'black' : 'var(--gray-400)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button 
            type="submit"
            style={{ 
              marginTop: '8px', padding: '16px', borderRadius: '12px',
              background: 'var(--white)', color: 'black',
              fontWeight: 800, fontSize: '15px',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            <Plus size={20} /> Add Goal
          </button>
        </form>
      </div>
    </div>
  );
};
