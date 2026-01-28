
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Lock,
  Moon,
  Sun,
  Droplets,
  BookOpen,
  Briefcase,
  Dumbbell,
  ShowerHead,
  Target,
  Trophy,
  Flame,
  Layout,
  Calendar,
  Settings,
  Plus,
  Trash2,
  X,
  Edit2,
  Navigation
} from 'lucide-react';
import { isAfter, isBefore, startOfDay, isToday as isDateToday, isSameMonth } from 'date-fns';
import { 
  HabitMap, 
  Habit,
  DEFAULT_HABITS,
  SLEEP_HABIT_ID, 
  createInitialTasks 
} from './types';
import { 
  getDaysInMonth, 
  formatDateKey, 
  getMonthYearString, 
  addMonths, 
  subMonths,
  getCalendarStats,
  getDate
} from './utils/dateUtils';

const HABIT_ICONS: Record<string, React.ReactNode> = {
  water: <Droplets size={16} className="text-blue-600 dark:text-blue-400" />,
  study: <BookOpen size={16} className="text-indigo-600 dark:text-indigo-400" />,
  work: <Briefcase size={16} className="text-slate-600 dark:text-slate-400" />,
  gym: <Dumbbell size={16} className="text-rose-600 dark:text-rose-400" />,
  bath: <ShowerHead size={16} className="text-emerald-600 dark:text-emerald-400" />,
  sleep: <Moon size={16} className="text-purple-600 dark:text-purple-400" />,
  default: <Target size={16} className="text-slate-500" />
};

const App: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [notes, setNotes] = useState(() => localStorage.getItem('goalsprint_notes') || '');
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('goalsprint_theme') === 'dark');
  const [showSettings, setShowSettings] = useState(false);
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  
  const todayRef = useRef<HTMLTableHeaderCellElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [habitsList, setHabitsList] = useState<Habit[]>(() => {
    const saved = localStorage.getItem('goalsprint_habits_list');
    return saved ? JSON.parse(saved) : DEFAULT_HABITS;
  });

  const [habitsData, setHabitsData] = useState<HabitMap>(() => {
    const saved = localStorage.getItem('goalsprint_habit_data');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('goalsprint_habit_data', JSON.stringify(habitsData));
    localStorage.setItem('goalsprint_notes', notes);
    localStorage.setItem('goalsprint_habits_list', JSON.stringify(habitsList));
    localStorage.setItem('goalsprint_theme', isDarkMode ? 'dark' : 'light');
    
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [habitsData, notes, habitsList, isDarkMode]);

  const days = useMemo(() => getDaysInMonth(currentMonth), [currentMonth]);
  const stats = useMemo(() => getCalendarStats(days, habitsData), [days, habitsData]);

  const scrollToToday = () => {
    if (todayRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const element = todayRef.current;
      const scrollLeft = element.offsetLeft - (container.offsetWidth / 2) + (element.offsetWidth / 2);
      container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (isSameMonth(currentMonth, new Date())) {
      const timer = setTimeout(scrollToToday, 600);
      return () => clearTimeout(timer);
    }
  }, [currentMonth]);

  const toggleHabit = (date: Date, taskId: string) => {
    const targetDate = startOfDay(date);
    if (!isDateToday(targetDate)) return;

    const key = formatDateKey(date);
    const dayData = habitsData[key] || {
      id: key,
      tasks: createInitialTasks(habitsList),
      completionPercentage: 0
    };

    const newTasks = dayData.tasks.map(t => 
      t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t
    );

    const completedCount = newTasks.filter(t => t.isCompleted).length;
    const percentage = Math.round((completedCount / newTasks.length) * 100);

    setHabitsData(prev => ({
      ...prev,
      [key]: {
        ...dayData,
        tasks: newTasks,
        completionPercentage: percentage
      }
    }));
  };

  const addHabit = (label: string) => {
    if (!label.trim()) return;
    const newHabit: Habit = {
      id: `custom-${Date.now()}`,
      label: label.trim()
    };
    setHabitsList(prev => [...prev, newHabit]);
  };

  const updateHabitLabel = (id: string, newLabel: string) => {
    if (!newLabel.trim()) return;
    setHabitsList(prev => prev.map(h => h.id === id ? { ...h, label: newLabel.trim() } : h));
    setEditingHabitId(null);
  };

  const removeHabit = (id: string) => {
    setHabitsList(prev => prev.filter(h => h.id !== id));
  };

  const nextMonth = () => setCurrentMonth(prev => addMonths(prev, 1));
  const prevMonth = () => setCurrentMonth(prev => subMonths(prev, 1));

  const isCurrentMonthActive = isSameMonth(currentMonth, new Date());
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen p-3 md:p-6 lg:p-10 max-w-[1440px] mx-auto transition-colors duration-300">
      
      {/* Clean & Balanced Header Section */}
      <header className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl p-5 md:p-8 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
        
        {/* Branding - Renamed to ProgressPulse */}
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-600 dark:bg-indigo-500 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-sm">
            <Target size={22} className="md:size-26" />
          </div>
          <h1 className="text-xl md:text-2xl font-black tracking-tight dark:text-white uppercase leading-none">ProgressPulse</h1>
        </div>

        {/* Month Selector */}
        <div className="flex items-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-1 border border-slate-200 dark:border-slate-800 w-full md:w-auto md:min-w-[300px]">
          <button onClick={prevMonth} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-colors text-slate-600 dark:text-slate-400">
            <ChevronLeft size={20} />
          </button>
          <div className="px-4 text-center flex-grow">
            <span className="text-sm md:text-lg font-black uppercase tracking-widest text-slate-800 dark:text-slate-200 leading-none">
              {getMonthYearString(currentMonth)}
            </span>
          </div>
          <button onClick={nextMonth} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-colors text-slate-600 dark:text-slate-400">
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 transition-all shadow-sm"
            title="Toggle Theme"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className={`p-3 rounded-2xl border transition-all shadow-sm ${showSettings ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700'}`}
            title="Manage Habits"
          >
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* Habit Settings Panel */}
      {showSettings && (
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 mb-8 shadow-lg animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800 dark:text-white uppercase tracking-tight">
              Habit Configuration
            </h2>
            <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <X size={20} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">New Sprint Goal</p>
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const input = (e.target as any).elements.habitLabel;
                  addHabit(input.value);
                  input.value = '';
                }}
                className="flex gap-2"
              >
                <input 
                  name="habitLabel"
                  type="text" 
                  placeholder="e.g. Code for 2 hours"
                  className="flex-grow bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm dark:text-slate-200 outline-none focus:border-indigo-500 transition-colors"
                />
                <button type="submit" className="bg-indigo-600 text-white px-5 py-3 rounded-xl hover:bg-indigo-700 transition-colors shadow-md active:scale-95">
                  <Plus size={20} />
                </button>
              </form>
            </div>
            
            <div className="space-y-4">
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Active Sprint List</p>
              <div className="max-h-[240px] overflow-y-auto custom-scrollbar space-y-2 pr-2">
                {habitsList.map(h => (
                  <div key={h.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-700 group hover:border-indigo-200 dark:hover:border-indigo-800 transition-all">
                    {editingHabitId === h.id ? (
                      <input 
                        autoFocus
                        defaultValue={h.label}
                        onBlur={(e) => updateHabitLabel(h.id, e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && updateHabitLabel(h.id, (e.target as any).value)}
                        className="bg-white dark:bg-slate-900 border border-indigo-400 rounded-lg px-2 py-1 text-sm w-full mr-3 outline-none dark:text-white"
                      />
                    ) : (
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate">{h.label}</span>
                    )}
                    <div className="flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setEditingHabitId(h.id)} className="text-slate-400 hover:text-indigo-500 p-1"><Edit2 size={14} /></button>
                      <button onClick={() => removeHabit(h.id)} className="text-slate-400 hover:text-rose-500 p-1"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Sprint Table */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-3xl overflow-hidden mb-8">
        <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layout size={14} className="text-indigo-600" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Monthly Sprint Progress</h2>
          </div>
          {isCurrentMonthActive && (
             <button 
               onClick={scrollToToday}
               className="text-[10px] font-black uppercase bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors"
             >
               Focus Today
             </button>
          )}
        </div>
        
        <div 
          ref={scrollContainerRef} 
          className="overflow-x-auto custom-scrollbar select-none"
        >
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/30 dark:bg-slate-800/10">
                <th className="px-6 py-4 text-left text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 border-r border-slate-100 dark:border-slate-800 w-36 md:w-64 min-w-[150px] sticky left-0 z-10 bg-white dark:bg-slate-900">Sprint Goal</th>
                {days.map(day => (
                  <th 
                    key={day.toString()} 
                    ref={isDateToday(day) ? todayRef : null}
                    className={`p-2 text-center text-[11px] font-black border-b border-slate-100 dark:border-slate-800 min-w-[65px] md:min-w-[44px] transition-colors ${isDateToday(day) ? 'bg-indigo-600 text-white' : 'text-slate-400 dark:text-slate-600'}`}
                  >
                    {getDate(day)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {habitsList.map((habit) => (
                <tr key={habit.id} className="border-b border-slate-50 dark:border-slate-800/40 hover:bg-slate-50/20 transition-colors">
                  <td className="px-6 py-4 border-r border-slate-100 dark:border-slate-800 sticky left-0 z-10 bg-white dark:bg-slate-900">
                    <div className="flex items-center gap-3">
                      <div className="hidden md:flex p-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        {HABIT_ICONS[habit.id] || HABIT_ICONS.default}
                      </div>
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 leading-tight truncate max-w-[110px] md:max-w-none">{habit.label}</span>
                    </div>
                  </td>
                  {days.map(day => {
                    const key = formatDateKey(day);
                    const isTodayFlag = isDateToday(day);
                    const isDone = habitsData[key]?.tasks?.find(t => t.id === habit.id)?.isCompleted;
                    const isPastFlag = isBefore(startOfDay(day), startOfDay(new Date()));
                    const isFutureFlag = isAfter(startOfDay(day), startOfDay(new Date()));
                    
                    return (
                      <td 
                        key={key} 
                        onClick={() => toggleHabit(day, habit.id)}
                        className={`
                          p-2 text-center transition-all relative
                          ${isTodayFlag ? 'bg-indigo-50/30 dark:bg-indigo-900/5 cursor-pointer group' : 'cursor-default'}
                          ${isPastFlag || isFutureFlag ? 'opacity-30' : ''}
                        `}
                      >
                        <div className="flex items-center justify-center">
                          {isDone ? (
                            <div className="bg-emerald-500 text-white w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-xl shadow-sm transform active:scale-90 transition-transform">
                              <Check size={16} strokeWidth={4} />
                            </div>
                          ) : (
                            <div className={`w-8 h-8 md:w-9 md:h-9 rounded-xl border-2 transition-all ${isTodayFlag ? 'border-indigo-400 bg-white dark:bg-slate-800 group-hover:border-indigo-600 group-active:scale-95' : 'border-slate-100 dark:border-slate-800/40 bg-slate-50/10'}`}></div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Analytics Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-16">
        
        {/* Performance Summary */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-10 shadow-sm">
           <div className="flex items-center gap-3 mb-10">
             <Trophy size={18} className="text-amber-500" />
             <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Sprint Analytics</h3>
           </div>

           <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
              {[
                { label: 'Victory Days', value: stats.completedDays, icon: <Check size={14} />, color: 'emerald' },
                { label: 'Sprint Rate', value: `${stats.percentage}%`, icon: <Trophy size={14} />, color: 'indigo' },
                { label: 'Max Streak', value: stats.bestStreak, icon: <Flame size={14} />, color: 'orange' },
                { label: 'Days Active', value: stats.totalDays, icon: <Calendar size={14} />, color: 'slate' }
              ].map((item, i) => (
                <div key={i} className="p-5 bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col items-center group hover:border-indigo-100 transition-colors">
                   <div className={`text-${item.color}-500 mb-3 transform group-hover:scale-110 transition-transform`}>{item.icon}</div>
                   <p className="text-xl md:text-3xl font-black dark:text-white leading-none mb-2 tracking-tighter">{item.value}</p>
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">{item.label}</p>
                </div>
              ))}
           </div>

           <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">Velocity Meter</span>
                <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">{stats.percentage}%</span>
              </div>
              <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800 p-0.5">
                <div 
                  className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${stats.percentage}%` }}
                />
              </div>
           </div>
        </div>

        {/* Reflection Journal */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen size={16} className="text-indigo-600" />
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Monthly Notes</h3>
          </div>
          <textarea 
             value={notes}
             onChange={(e) => setNotes(e.target.value)}
             placeholder="Log barriers or breakthroughs..."
             className="flex-grow w-full bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 text-sm font-medium dark:text-slate-300 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/10 transition-all resize-none"
           />
        </div>
      </section>

      {/* Footer & Copyright Info */}
      <footer className="text-center pb-24 border-t border-slate-100 dark:border-slate-900 pt-12 mt-12">
        <p className="text-[11px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.5em] mb-4">Built for Consistency</p>
        <div className="flex flex-col items-center gap-4">
          <div className="inline-flex items-center gap-3 bg-white dark:bg-slate-900 px-6 py-3 rounded-full border border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest shadow-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            Status: Syncing Locally
          </div>
          <div className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest flex items-center gap-2 opacity-60">
            <span>&copy; {currentYear} ProgressPulse.</span>
            <span>All rights reserved.</span>
          </div>
        </div>
      </footer>

      {/* Status Badge */}
      <div className="print-hidden fixed bottom-6 right-6 flex items-center gap-4 bg-slate-950 dark:bg-indigo-700 text-white px-6 py-4 rounded-3xl shadow-2xl border border-white/5 z-50">
        <Lock size={16} className="text-indigo-400 dark:text-indigo-200" />
        <div className="flex flex-col">
          <span className="text-[8px] font-black uppercase tracking-widest opacity-50">Safety Protocol</span>
          <span className="text-[10px] font-bold">Only today is editable</span>
        </div>
      </div>

    </div>
  );
};

export default App;
