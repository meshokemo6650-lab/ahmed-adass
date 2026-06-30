/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Plus, Check } from 'lucide-react';
import { Task, Category, UserProfile } from '../types';

interface CalendarViewProps {
  user: UserProfile;
  tasks: Task[];
  categories: Category[];
  onSelectDate: (date: string) => void;
  selectedDate: string;
  onQuickAdd: () => void;
  onSelectTask: (task: Task) => void;
}

export default function CalendarView({ user, tasks, categories, onSelectDate, selectedDate, onQuickAdd, onSelectTask }: CalendarViewProps) {
  const isAr = user.language === 'ar';
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const daysOfWeekEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const daysOfWeekAr = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const daysOfWeek = isAr ? daysOfWeekAr : daysOfWeekEn;

  // Monthly Helper: Get all days in active month
  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const days = [];
    
    // Add prefix empty slots
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }
    
    // Add actual days
    for (let i = 1; i <= totalDays; i++) {
      const dateObj = new Date(year, month, i);
      const dateStr = dateObj.toISOString().split('T')[0];
      days.push({
        day: i,
        date: dateStr,
        isCurrent: dateStr === new Date().toISOString().split('T')[0],
        isSelected: dateStr === selectedDate
      });
    }

    return days;
  };

  const handleMonthChange = (direction: 'next' | 'prev') => {
    const next = new Date(currentMonth);
    next.setMonth(currentMonth.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentMonth(next);
  };

  const monthName = currentMonth.toLocaleString(isAr ? 'ar-EG' : 'en-US', { month: 'long', year: 'numeric' });

  // Weekly Helper: Get 7 days of the active week (centered around selected date)
  const getWeeklyDays = () => {
    const current = new Date(selectedDate);
    const dayIndex = current.getDay();
    const startOfWeek = new Date(current);
    startOfWeek.setDate(current.getDate() - dayIndex);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      days.push({
        dayName: d.toLocaleDateString(isAr ? 'ar-EG' : 'en-US', { weekday: 'short' }),
        dayNum: d.getDate(),
        date: dateStr,
        isToday: dateStr === new Date().toISOString().split('T')[0],
        isSelected: dateStr === selectedDate
      });
    }
    return days;
  };

  // Filter tasks for Selected Date
  const selectedDateTasks = tasks.filter(t => t.date === selectedDate);

  // Day Agenda times list (Hours from 08:00 to 20:00)
  const hourSlots = Array.from({ length: 13 }, (_, i) => {
    const hour = 8 + i;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  return (
    <div id="calendar-tab" className="space-y-6 pb-20 animate-fade-in text-right">
      
      {/* View Toggle and Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900/60 border border-slate-800 p-4 rounded-3xl">
        {/* Toggle Mode buttons */}
        <div className="flex gap-1.5 p-1 bg-slate-950 rounded-2xl border border-slate-800">
          {(['month', 'week', 'day'] as const).map((mode) => {
            const label = isAr 
              ? { month: 'شهري', week: 'أسبوعي', day: 'يومي' }[mode]
              : { month: 'Monthly', week: 'Weekly', day: 'Daily' }[mode];
            return (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`py-1.5 px-4 text-xs font-bold rounded-xl transition-all ${
                  viewMode === mode 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white bg-transparent'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Date Month Display Controls */}
        <div className="flex items-center gap-3 justify-between sm:justify-end">
          <div className="flex gap-2">
            <button
              onClick={() => handleMonthChange('prev')}
              className="p-2 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-800 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleMonthChange('next')}
              className="p-2 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-800 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
          <h2 className="text-base font-bold text-white font-sans flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-indigo-400" />
            <span>{monthName}</span>
          </h2>
        </div>
      </div>

      {/* --- MONTH VIEW --- */}
      {viewMode === 'month' && (
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6">
          <div className="grid grid-cols-7 gap-2 mb-4">
            {daysOfWeek.map((day, idx) => (
              <div key={idx} className="text-center text-xs font-semibold text-slate-500 py-1 font-sans">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {getDaysInMonth().map((day, idx) => {
              if (!day) return <div key={idx} className="aspect-square bg-transparent"></div>;

              const dayTasks = tasks.filter(t => t.date === day.date);
              const pendingDayTasks = dayTasks.filter(t => !t.completed);

              return (
                <button
                  key={idx}
                  onClick={() => onSelectDate(day.date)}
                  className={`aspect-square rounded-2xl border flex flex-col justify-between p-1.5 sm:p-2.5 transition-all text-right relative ${
                    day.isSelected 
                      ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-inner shadow-indigo-500/10' 
                      : day.isCurrent 
                        ? 'bg-slate-900 border-indigo-500/30 text-indigo-300' 
                        : 'bg-slate-950/40 border-slate-850 hover:border-slate-700 text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <span className="text-xs font-bold font-mono">{day.day}</span>
                  
                  {/* Tasks list visual indicator */}
                  {dayTasks.length > 0 && (
                    <div className="flex gap-1 justify-end w-full">
                      {pendingDayTasks.map((t, tIdx) => (
                        <span 
                          key={t.id || tIdx}
                          className={`w-1.5 h-1.5 rounded-full ${t.color}`}
                          title={t.title}
                        />
                      ))}
                      {dayTasks.length > pendingDayTasks.length && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* --- WEEK VIEW --- */}
      {viewMode === 'week' && (
        <div className="grid grid-cols-7 gap-3 bg-slate-900/40 border border-slate-800/80 p-5 rounded-3xl">
          {getWeeklyDays().map((day) => {
            const dayTasks = tasks.filter(t => t.date === day.date);
            const pendingDayTasks = dayTasks.filter(t => !t.completed);

            return (
              <button
                key={day.date}
                onClick={() => onSelectDate(day.date)}
                className={`py-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                  day.isSelected 
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/15' 
                    : day.isToday
                      ? 'bg-slate-900 border-indigo-500/20 text-indigo-300' 
                      : 'bg-slate-950/50 border-slate-850 text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <span className="text-[10px] font-bold font-sans opacity-70">{day.dayName}</span>
                <span className="text-lg font-black font-mono">{day.dayNum}</span>
                
                {dayTasks.length > 0 && (
                  <span className={`w-1.5 h-1.5 rounded-full ${pendingDayTasks.length > 0 ? 'bg-indigo-400' : 'bg-emerald-400'}`}></span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* --- DAILY AGENDA TIMELINE --- */}
      {viewMode === 'day' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Daily Schedule Timeline Grid */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 md:col-span-2 space-y-4">
            <h3 className="text-sm font-bold text-slate-300">
              {isAr ? 'الجدول الزمني لليوم' : 'Today Schedule Timeline'}
            </h3>

            <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1 custom-scrollbar">
              {hourSlots.map((hour) => {
                // Find tasks matching this hour approximately (if deadlineTime begins with this hour)
                const matchingTasks = selectedDateTasks.filter(t => t.deadlineTime && t.deadlineTime.startsWith(hour.split(':')[0]));

                return (
                  <div key={hour} className="flex gap-4 items-start border-b border-slate-850/60 pb-3 last:border-0 text-right">
                    <div className="flex-1 space-y-2">
                      {matchingTasks.length > 0 ? (
                        matchingTasks.map((t) => (
                          <div
                            key={t.id}
                            onClick={() => onSelectTask(t)}
                            className={`p-3 rounded-2xl border cursor-pointer hover:scale-[0.99] transition-all flex justify-between items-center ${
                              t.completed 
                                ? 'bg-slate-950/30 border-slate-850/40 text-slate-500' 
                                : `bg-slate-950/50 border-l-4 ${t.color.replace('bg-', 'border-')} border-slate-850`
                            }`}
                          >
                            <span className="text-[10px] text-slate-500 font-mono">{t.duration || ''}</span>
                            <div className="space-y-0.5">
                              <h4 className={`text-xs font-bold ${t.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>{t.title}</h4>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="h-6 bg-slate-950/20 rounded-xl border border-dashed border-slate-850/40 flex items-center justify-end px-4 text-[10px] text-slate-600">
                          {isAr ? 'فترة فارغة ومثالية للإنجاز' : 'Free slot'}
                        </div>
                      )}
                    </div>
                    
                    <span className="text-xs font-bold text-indigo-400 font-mono shrink-0 w-12 text-left pt-0.5">
                      {hour}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick task selector drawer sidebar */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 flex flex-col h-[525px]">
            <h3 className="text-sm font-bold text-slate-300 mb-4">
              {isAr ? `مهام اليوم (${selectedDateTasks.length})` : `Today's Tasks (${selectedDateTasks.length})`}
            </h3>

            <div className="overflow-y-auto space-y-3 flex-1 pr-1 custom-scrollbar">
              {selectedDateTasks.length > 0 ? (
                selectedDateTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => onSelectTask(task)}
                    className="p-3 bg-slate-950/50 hover:bg-slate-950 border border-slate-800 rounded-2xl cursor-pointer flex justify-between items-center transition-all text-right group"
                  >
                    <span className="text-[10px] text-slate-500 font-mono">{task.deadlineTime || ''}</span>
                    <div className="space-y-1">
                      <h4 className={`text-xs font-bold text-slate-200 group-hover:text-white ${task.completed ? 'line-through text-slate-500' : ''}`}>{task.title}</h4>
                      <span className="text-[9px] text-slate-500">{categories.find(c => c.id === task.categoryId)?.nameAr}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-600">
                  <CalendarIcon className="w-10 h-10 stroke-[1.5] text-slate-700 mb-2" />
                  <p className="text-xs">{isAr ? 'لا توجد مهام مجدولة لهذا اليوم' : 'No tasks scheduled'}</p>
                </div>
              )}
            </div>

            <button
              onClick={onQuickAdd}
              className="w-full mt-4 py-3 bg-gradient-to-r from-indigo-600 to-emerald-500 hover:from-indigo-500 hover:to-emerald-400 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span>{isAr ? 'إضافة مهمة لهذا اليوم' : 'Add task to this day'}</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
