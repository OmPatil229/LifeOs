import { create } from 'zustand';
import { api } from '../lib/api';

export type EnergyLevel = 'low' | 'medium' | 'high';
export type SystemStatus = 'stable' | 'recovery' | 'declining';
export type TimeLayer = 'day' | 'week' | 'month' | 'year';

export interface Session {
  id: string;
  taskId?: string;
  startTime: string;
  endTime?: string;
  moodBefore?: number;
  moodAfter?: number;
}

export interface Goal {
  id: string;
  title: string;
  type: TimeLayer;
  status: string;
  progressPercentage: number;
  drift?: number;
  targetHours?: number;
  priority?: string;
  category?: string;
  parentId?: string;
}

export interface Habit {
  id: string;
  name: string;
  goalId?: string;
  timeframe: string;
  scheduleDays: number[];
  startTime?: string;
  color: string;
  icon: string;
  isActive: boolean;
  streakCurrent: number;
  streakBest: number;
  completionRate: number;
}

interface LifeState {
  // Performance
  score: number;
  consistency: number;
  burnoutRisk: number;
  focusHours: number;
  lostMinutes: number;

  // Behavior Context
  energy: EnergyLevel;
  status: SystemStatus;
  recoveryMode: boolean;
  wakeTime: string; // HH:mm

  // Date management
  selectedDate: string; // YYYY-MM-DD

  // Sessions
  activeSession: Session | null;
  startSession: (taskId?: string, moodBefore?: number) => Promise<void>;
  endSession: (moodAfter?: number, focusQuality?: number) => Promise<void>;
  fetchActiveSession: () => Promise<void>;

  // Insights Metrics
  insights: {
    accuracy: {
      isLocked: boolean;
      text: string;
      score: number;
      plannedCount: number;
      completedCount: number;
      reactiveCount: number;
    } | string | any;
    moodProductivity: string;
    peakTime: string;
    burnoutRisk: string | null;
    habitPerformance: string;
    focusQuality: { score: number, label: string };
    failureReason: string;
    monthTrajectory: number[];
    yearTrajectory: number[];
    capacityGain: number;
    consistencyRate: number;
    efficiencyFactor: number;
    focusMix: { label: string, value: number }[];
    goalStreak: number;
    categoryProgress: { label: string, value: number }[];
  };
  fetchInsights: () => Promise<void>;
  
  // Decision Engine
  decision: { title: string, subtitle: string, taskId?: string } | null;
  fetchDecision: () => Promise<void>;
  commitDailyPlan: () => Promise<void>;

  // Goals
  goals: Goal[];
  fetchGoals: (type?: TimeLayer) => Promise<void>;
  createGoal: (goalData: Partial<Goal>) => Promise<any>;
  updateGoal: (id: string, goalData: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;

  // Weekly Pipeline
  weeklyTimeline: Record<string, any[]>;
  fetchWeeklyTimeline: (startDate: string) => Promise<void>;
  completeTask: (taskId: string) => Promise<void>;
  moveTask: (taskId: string, newDate: string, timeframe: string) => Promise<void>;

  // Analytics
  analytics: {
    productivityTrend: any[];
    biometricTrend: { mood: number[], energy: number[] };
  };
  fetchProductivityTrend: (days?: number) => Promise<void>;

  // Actions
  setEnergy: (energy: EnergyLevel) => void;
  setSelectedDate: (date: string) => void;
  syncPerformance: (data: Partial<LifeState>) => void;

  // Time Stack UI
  activeTimeLayer: TimeLayer;
  setActiveTimeLayer: (layer: TimeLayer) => void;
  dayData: string;
  setDayData: (data: string) => void;
  weekData: string;
  setWeekData: (data: string) => void;
  monthData: string;
  setMonthData: (data: string) => void;
  yearData: string;
  setYearData: (data: string) => void;

  dayInsight: string;
  weekInsight: string;
  monthInsight: string;
  yearInsight: string;
  
  // Journal Entry
  journal: { 
    mood: number, 
    energy: number, 
    stress: number, 
    content: string,
    checkins?: {
      morning?: { mood: number, energy: number },
      afternoon?: { mood: number, energy: number },
      evening?: { mood: number, energy: number },
      night?: { mood: number, energy: number }
    }
  } | null;
  journalHistory: any[];
  fetchJournal: (dateStr: string) => Promise<void>;
  fetchJournalHistory: () => Promise<void>;
  saveJournal: (dateStr: string, data: any) => Promise<void>;
  searchJournalEntries: (query: string) => Promise<void>;

  // Tasks (Daily To-Do CRUD)
  createTask: (taskData: any) => Promise<any>;
  updateTask: (id: string, updates: any) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;

  // Carry-Forward
  carryForwardStats: { week: number; month: number; year: number };
  fetchCarryForwardStats: () => Promise<void>;
  rescheduleToNextDay: (taskId: string) => Promise<void>;
  carryForwardAllTasks: () => Promise<void>;

  // Async API Actions
  fetchCard: (layer: TimeLayer, dateStr: string) => Promise<void>;
  saveCard: (layer: TimeLayer, dateStr: string, content: string) => Promise<void>;
  
  // Strategic Categories
  categories: string[];
  addCategory: (name: string) => void;
  resetState: () => void;

  // Habits CRUD
  habits: Habit[];
  fetchHabits: () => Promise<void>;
  createHabit: (habitData: Partial<Habit>) => Promise<any>;
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  markHabitComplete: (habitId: string, dateStr: string) => Promise<void>;
  
  // Timeline
  timeline: { morning: any[], afternoon: any[], evening: any[], night: any[] };
  fetchTimeline: (dateStr: string) => Promise<void>;
}

export const useLifeStore = create<LifeState>((set, get) => ({
  score: 0,
  consistency: 0,
  burnoutRisk: 0,
  focusHours: 0,
  lostMinutes: 0,

  energy: 'medium',
  status: 'stable',
  recoveryMode: false,
  wakeTime: '--:--',

  selectedDate: new Date().toISOString().split('T')[0],

  activeTimeLayer: 'day',
  dayData: '',
  weekData: '',
  monthData: '',
  yearData: '',

  dayInsight: '',
  weekInsight: '',
  monthInsight: '',
  yearInsight: '',

  activeSession: null,
  goals: [],
  categories: ['Health', 'Skill', 'Business', 'Life', 'Growth'],
  
  addCategory: (name: string) => {
    if (!get().categories.includes(name)) {
      set((state) => ({ categories: [...state.categories, name] }));
    }
  },

  weeklyTimeline: {},
  analytics: {
    productivityTrend: [],
    biometricTrend: { mood: [], energy: [] }
  },
  decision: null,
  journal: null,
  journalHistory: [],
  timeline: { morning: [], afternoon: [], evening: [], night: [] },
  habits: [],
  carryForwardStats: { week: 0, month: 0, year: 0 },
  insights: {
    accuracy: {
      isLocked: false,
      text: 'Calculating...',
      score: 0,
      plannedCount: 0,
      completedCount: 0,
      reactiveCount: 0
    },
    moodProductivity: 'Analyzing correlation...',
    peakTime: 'Analyzing...',
    burnoutRisk: null,
    habitPerformance: 'Calculating...',
    focusQuality: { score: 0, label: 'No Data' },
    failureReason: 'Analyzing...',
    monthTrajectory: [],
    yearTrajectory: [],
    capacityGain: 0,
    consistencyRate: 0,
    efficiencyFactor: 1.0,
    focusMix: [],
    goalStreak: 0,
    categoryProgress: []
  },

  setEnergy: (energy) => set({ energy }),
  setSelectedDate: (date) => {
    set({ selectedDate: date });
    get().fetchJournal(date);
  },
  syncPerformance: (data) => set((state) => ({ ...state, ...data })),
  setActiveTimeLayer: (layer) => set({ activeTimeLayer: layer }),
  setDayData: (data) => set({ dayData: data }),
  setWeekData: (data) => set({ weekData: data }),
  setMonthData: (data) => set({ monthData: data }),
  setYearData: (data) => set({ yearData: data }),

  fetchInsights: async () => {
    try {
      const res = await api.get(`/dashboard/insights?date=${get().selectedDate}`);
      if (res.data?.success) {
        set({ insights: res.data.data });
      }
    } catch (err) {
      console.error('Failed to fetch insights', err);
    }
  },

  commitDailyPlan: async () => {
    try {
      const res = await api.post('/dashboard/commit-plan');
      if (res.data?.success) {
        await get().fetchInsights();
      }
    } catch (err) {
      console.error('Failed to commit daily plan', err);
    }
  },

  fetchDecision: async () => {
    try {
      const energy = get().energy;
      const res = await api.get(`/dashboard/decision?energy=${energy}`);
      if (res.data?.success) {
        set({ decision: res.data.data });
      }
    } catch (err) {
      console.error('Failed to fetch decision', err);
    }
  },

  fetchProductivityTrend: async (days = 7) => {
    try {
      const res = await api.get(`/dashboard/trend?days=${days}`);
      if (res.data?.success) {
        set({ 
          analytics: {
            productivityTrend: res.data.data.productivity,
            biometricTrend: res.data.data.biometrics
          }
        });
      }
    } catch (err) {
      console.error('Failed to fetch productivity trend', err);
    }
  },

  fetchWeeklyTimeline: async (dateStr: string) => {
    try {
      const res = await api.get(`/timeline/week?startDate=${dateStr}`);
      if (res.data?.success) {
        set({ weeklyTimeline: res.data.data });
      }
    } catch (err) {
      console.error('Failed to fetch weekly timeline', err);
    }
  },

  completeTask: async (taskId: string) => {
    try {
      const res = await api.put(`/tasks/${taskId}/complete`);
      if (res.data?.success) {
        const selectedDate = get().selectedDate;
        await Promise.all([
          get().fetchTimeline(selectedDate),
          get().fetchWeeklyTimeline(selectedDate),
          get().fetchInsights(),
          get().fetchGoals()
        ]);
      }
    } catch (err) {
      console.error('Failed to complete task', err);
    }
  },

  moveTask: async (taskId: string, newDate: string, timeframe: string) => {
    try {
      await api.put(`/tasks/${taskId}`, { date: newDate, timeframe });
      const selectedDate = get().selectedDate;
      await Promise.all([
        get().fetchTimeline(selectedDate),
        get().fetchWeeklyTimeline(selectedDate),
        get().fetchCard('day', selectedDate)
      ]);
    } catch (err) {
      console.error('Failed to move task', err);
    }
  },

  startSession: async (taskId, moodBefore) => {
    try {
      const res = await api.post('/sessions/start', { taskId, moodBefore });
      if (res.data?.success) {
        set({ activeSession: res.data.data });
      }
    } catch (err) {
      console.error('Failed to start session', err);
    }
  },

  endSession: async (moodAfter, focusQuality) => {
    try {
      const res = await api.post('/sessions/end', { moodAfter, focusQuality });
      if (res.data?.success) {
        set({ activeSession: null });
        get().fetchCard('day', get().selectedDate);
      }
    } catch (err) {
      console.error('Failed to end session', err);
    }
  },

  fetchActiveSession: async () => {
    try {
      const res = await api.get('/sessions/active');
      if (res.data?.success) {
        set({ activeSession: res.data.data });
      }
    } catch (err) {
      console.error('Failed to fetch active session', err);
    }
  },

  fetchGoals: async (type?: string) => {
    try {
      const url = type ? `/goals?type=${type}` : '/goals';
      const res = await api.get(url);
      if (res.data?.success) {
        set({ goals: res.data.data });
      }
    } catch (err) {
      console.error('Failed to fetch goals', err);
    }
  },

  createGoal: async (goalData: any) => {
    try {
      const res = await api.post('/goals', goalData);
      if (res.data?.success) {
        await get().fetchGoals();
        return res.data.data;
      }
    } catch (err) {
      console.error('Failed to create goal', err);
    }
  },

  updateGoal: async (id: string, goalData: any) => {
    try {
      const res = await api.put(`/goals/${id}`, goalData);
      if (res.data?.success) {
        await get().fetchGoals();
      }
    } catch (err) {
      console.error('Failed to update goal', err);
    }
  },

  deleteGoal: async (id: string) => {
    try {
      const res = await api.delete(`/goals/${id}`);
      if (res.data?.success) {
        await get().fetchGoals();
      }
    } catch (err) {
      console.error('Failed to delete goal', err);
    }
  },

  fetchCard: async (layer, dateStr) => {
    try {
      const res = await api.get(`/timecards/${layer}/${dateStr}`);
      if (res.data?.success) {
        const { content, insight } = res.data.data;
        set((state) => ({
          ...state,
          [`${layer}Data`]: content || '',
          [`${layer}Insight`]: insight || '',
        }));
      }
    } catch (err) {
      console.error(`Failed to fetch ${layer} card`, err);
    }
  },

  saveCard: async (layer, dateStr, content) => {
    try {
      set((state) => ({ ...state, [`${layer}Data`]: content }));
      const res = await api.post(`/timecards/${layer}/${dateStr}`, { content });
      if (res.data?.success) {
        const { insight } = res.data.data;
        set((state) => ({
          ...state,
          [`${layer}Insight`]: insight || '',
        }));
      }
    } catch (err) {
      console.error(`Failed to save ${layer} card`, err);
    }
  },
  resetState: () => {
    set({
      dayData: '',
      weekData: '',
      monthData: '',
      yearData: '',
      dayInsight: '',
      weekInsight: '',
      monthInsight: '',
      yearInsight: '',
      goals: [],
      weeklyTimeline: {},
      analytics: {
        productivityTrend: [],
        biometricTrend: { mood: [], energy: [] }
      },
      decision: null,
      journal: null,
      timeline: { morning: [], afternoon: [], evening: [], night: [] },
      activeSession: null
    });
  },

  fetchJournal: async (dateStr) => {
    try {
      const res = await api.get(`/journal/${dateStr}`);
      if (res.data?.success) {
        set({ journal: res.data.data });
      }
    } catch (err) {
      console.error('Failed to fetch journal', err);
    }
  },

  fetchJournalHistory: async () => {
    try {
      // Fetch last 30 entries
      const end = new Date().toISOString().split('T')[0];
      const start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const res = await api.get(`/journal/history?from=${start}&to=${end}`);
      if (res.data?.success) {
        set({ journalHistory: res.data.data });
      }
    } catch (err) {
      console.error('Failed to fetch journal history', err);
    }
  },

  saveJournal: async (dateStr: string, data: any) => {
    try {
      const res = await api.post(`/journal/${dateStr}`, data);
      if (res.data?.success) {
        set({ journal: res.data.data });
        await Promise.all([
          get().fetchInsights(),
          get().fetchCard('day', dateStr)
        ]);
      }
    } catch (err) {
      console.error('Failed to save journal', err);
    }
  },

  searchJournalEntries: async (query: string) => {
    if (!query) {
      await get().fetchJournalHistory();
      return;
    }
    try {
      const res = await api.get(`/journal/search?q=${encodeURIComponent(query)}`);
      if (res.data?.success) {
        set({ journalHistory: res.data.data });
      }
    } catch (err) {
      console.error('Failed to search journal entries', err);
    }
  },

  fetchTimeline: async (dateStr) => {
    try {
      const res = await api.get(`/timeline?date=${dateStr}`);
      if (res.data?.success) {
        set({ timeline: res.data.data });
      }
    } catch (err) {
      console.error('Failed to fetch timeline', err);
    }
  },

  fetchHabits: async () => {
    try {
      const res = await api.get('/habits');
      if (res.data?.success) {
        set({ habits: res.data.data });
      }
    } catch (err) {
      console.error('Failed to fetch habits', err);
    }
  },

  createHabit: async (habitData) => {
    try {
      const res = await api.post('/habits', habitData);
      if (res.data?.success) {
        await get().fetchHabits();
        await get().fetchGoals();
        return res.data.data;
      }
    } catch (err) {
      console.error('Failed to create habit', err);
    }
  },

  updateHabit: async (id, updates) => {
    try {
      const res = await api.put(`/habits/${id}`, updates);
      if (res.data?.success) {
        await Promise.all([
          get().fetchHabits(),
          get().fetchGoals(),
          get().fetchTimeline(get().selectedDate)
        ]);
      }
    } catch (err) {
      console.error('Failed to update habit', err);
    }
  },

  deleteHabit: async (id) => {
    try {
      const res = await api.delete(`/habits/${id}`);
      if (res.data?.success) {
        await Promise.all([
          get().fetchHabits(),
          get().fetchGoals(),
          get().fetchTimeline(get().selectedDate)
        ]);
      }
    } catch (err) {
      console.error('Failed to delete habit', err);
    }
  },

  markHabitComplete: async (habitId, dateStr) => {
    try {
      const res = await api.post(`/habits/${habitId}/complete`, { date: dateStr });
      if (res.data?.success) {
        await Promise.all([
          get().fetchTimeline(dateStr),
          get().fetchCard('day', dateStr),
          get().fetchGoals()
        ]);
      }
    } catch (err) {
      console.error('Failed to mark habit complete', err);
    }
  },

  createTask: async (taskData) => {
    try {
      const res = await api.post('/tasks', { ...taskData, date: get().selectedDate });
      if (res.data?.success) {
        await Promise.all([
          get().fetchTimeline(get().selectedDate),
          get().fetchGoals()
        ]);
        return res.data.data;
      }
    } catch (err) {
      console.error('Failed to create task', err);
    }
  },

  updateTask: async (id, updates) => {
    try {
      const res = await api.put(`/tasks/${id}`, updates);
      if (res.data?.success) {
        await Promise.all([
          get().fetchTimeline(get().selectedDate),
          get().fetchGoals()
        ]);
      }
    } catch (err) {
      console.error('Failed to update task', err);
    }
  },

  deleteTask: async (id) => {
    try {
      const res = await api.delete(`/tasks/${id}`);
      if (res.data?.success) {
        await Promise.all([
          get().fetchTimeline(get().selectedDate),
          get().fetchGoals()
        ]);
      }
    } catch (err) {
      console.error('Failed to delete task', err);
    }
  },

  fetchCarryForwardStats: async () => {
    try {
      const res = await api.get('/tasks/carry-forward-stats');
      if (res.data?.success) {
        set({ carryForwardStats: res.data.data });
      }
    } catch (err) {
      console.error('Failed to fetch carry-forward stats', err);
    }
  },

  rescheduleToNextDay: async (taskId: string) => {
    try {
      const res = await api.post(`/tasks/${taskId}/carry-forward`);
      if (res.data?.success) {
        const selectedDate = get().selectedDate;
        await Promise.all([
          get().fetchTimeline(selectedDate),
          get().fetchCarryForwardStats(),
          get().fetchInsights()
        ]);
      }
    } catch (err) {
      console.error('Failed to reschedule task to next day', err);
    }
  },

  carryForwardAllTasks: async () => {
    try {
      const res = await api.post('/tasks/carry-forward', { date: get().selectedDate });
      if (res.data?.success) {
        const selectedDate = get().selectedDate;
        await Promise.all([
          get().fetchTimeline(selectedDate),
          get().fetchCarryForwardStats(),
          get().fetchInsights()
        ]);
      }
    } catch (err) {
      console.error('Failed to carry forward tasks', err);
    }
  }
}));
