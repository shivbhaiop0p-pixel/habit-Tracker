
export interface Habit {
  id: string;
  label: string;
}

export interface HabitTask {
  id: string;
  label: string;
  isCompleted: boolean;
}

export interface DayHabits {
  id: string; // ISO Date String YYYY-MM-DD
  tasks: HabitTask[];
  completionPercentage: number;
}

export type HabitMap = Record<string, DayHabits>;

export interface MonthStats {
  totalDays: number;
  completedDays: number; 
  missedDays: number; 
  percentage: number;
  bestStreak: number;
}

export const DEFAULT_HABITS: Habit[] = [
  { id: 'water', label: 'Drink 4 Liters Water' },
  { id: 'study', label: 'Study 4 Hours' },
  { id: 'work', label: 'Work from home 5 Hours' },
  { id: 'gym', label: 'Gym 2 Hours' },
  { id: 'bath', label: 'Daily Bath' }
];

export const SLEEP_HABIT_ID = 'sleep';
export const SLEEP_HABIT_LABEL = 'Sleep for 7 Hours';

export const createInitialTasks = (customHabits: Habit[]): HabitTask[] => [
  ...customHabits.map(h => ({ ...h, isCompleted: false })),
  { id: SLEEP_HABIT_ID, label: SLEEP_HABIT_LABEL, isCompleted: false }
];
