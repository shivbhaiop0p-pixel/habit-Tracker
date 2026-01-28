
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  isToday as isTodayDate,
  startOfDay,
  isPast,
  addMonths,
  subMonths,
  getDate
} from 'date-fns';
import { HabitMap, MonthStats } from '../types';

export const getDaysInMonth = (date: Date) => {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  return eachDayOfInterval({ start, end });
};

export const formatDateKey = (date: Date) => format(date, 'yyyy-MM-dd');

export const isToday = (date: Date) => isTodayDate(date);

export const getMonthYearString = (date: Date) => format(date, 'MMMM yyyy');

export const getCalendarStats = (days: Date[], habits: HabitMap): MonthStats => {
  const today = startOfDay(new Date());
  const monthDayKeys = days.map(d => formatDateKey(d));
  
  let completedFullDays = 0;
  let missedDays = 0;
  let totalCompletionSum = 0;
  let currentStreak = 0;
  let maxStreak = 0;

  monthDayKeys.forEach(key => {
    const dayData = habits[key];
    const date = new Date(key);
    const percentage = dayData?.completionPercentage || 0;
    
    totalCompletionSum += percentage;

    if (percentage === 100) {
      completedFullDays++;
      currentStreak++;
      if (currentStreak > maxStreak) maxStreak = currentStreak;
    } else {
      if (isPast(date) && !isSameDay(date, today)) {
        currentStreak = 0;
      }
      if (isPast(date) && !isSameDay(date, today) && percentage === 0) {
        missedDays++;
      }
    }
  });

  const totalDaysInMonth = monthDayKeys.length;
  const averagePercentage = totalDaysInMonth > 0 
    ? Math.round(totalCompletionSum / totalDaysInMonth) 
    : 0;

  return {
    totalDays: totalDaysInMonth,
    completedDays: completedFullDays,
    missedDays: missedDays,
    percentage: averagePercentage,
    bestStreak: maxStreak
  };
};

export { addMonths, subMonths, getDate };
