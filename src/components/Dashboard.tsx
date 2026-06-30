/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { 
  CheckCircle2, Clock, Play, TrendingUp, Calendar, AlertTriangle, ArrowRight, ArrowLeft, Star, Flame, Sparkles, Plus, CheckSquare, Quote, Heart, Sun
} from 'lucide-react';
import { Task, Category, UserProfile } from '../types';

interface DashboardProps {
  user: UserProfile;
  tasks: Task[];
  categories: Category[];
  onQuickAdd: () => void;
  onSelectTask: (task: Task) => void;
  onNavigateToTab: (tab: string) => void;
}

export default function Dashboard({ user, tasks, categories, onQuickAdd, onSelectTask, onNavigateToTab }: DashboardProps) {
  const [time, setTime] = useState(new Date());
  const [currentQuote, setCurrentQuote] = useState('');
  const [aiQuote, setAiQuote] = useState('');
  const [quoteLoading, setQuoteLoading] = useState(false);

  const PRESET_QUOTES_AR = [
    "كل صباح هو فرصة جديدة لتُشرق بروحك، وتصنع إنجازاً يسعد قلبك! ☀️",
    "ابتسم وثق بقدراتك؛ فاليوم يحمل لك فرصاً رائعة تليق بطموحك اللامحدود. ✨",
    "إنجازاتك الصغيرة اليوم هي حجر الأساس لنجاحاتك العظيمة غداً. استمر بشغف! 🌱",
    "الطاقة الإيجابية هي سر الإنتاجية السعيدة، اجعل تفاؤلك اليوم دافعاً للإبداع. 🎯",
    "تذكر دائماً أنك أقوى مما تظن، وأقرب إلى أهدافك مع كل خطوة تخطوها. 💪"
  ];

  const PRESET_QUOTES_EN = [
    "Every morning is a new chance to shine and create something beautiful! ☀️",
    "Believe in yourself; today brings amazing opportunities that match your passion. ✨",
    "Your small victories today build the foundation for your massive success tomorrow. 🌱",
    "Positive energy is the key to happy productivity. Let your optimism drive you! 🎯",
    "Never forget that you are stronger than you think, and closer to your goals with every step. 💪"
  ];

  const isAr = user.language === 'ar';

  useEffect(() => {
    const quotes = isAr ? PRESET_QUOTES_AR : PRESET_QUOTES_EN;
    const randomIndex = Math.floor(Math.random() * quotes.length);
    setCurrentQuote(quotes[randomIndex]);
  }, [user.language]);

  // Dynamic calculation for completed and total count
  const totalTasksCount = tasks.length;
  const completedTasks = tasks.filter(t => t.completed);
  const completedCount = completedTasks.length;

  const handleGetAiOptimismBoost = async () => {
    setQuoteLoading(true);
    try {
      const response = await fetch('/api/ai/optimism-boost', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userName: user.name,
          completedCount,
          totalCount: totalTasksCount,
          language: user.language
        })
      });
      if (response.ok) {
        const data = await response.json();
        setAiQuote(data.result);
      } else {
        throw new Error('Failed to fetch booster');
      }
    } catch (e) {
      // Fallback message
      setAiQuote(isAr 
        ? "أنت تقوم بعمل رائع اليوم يا بطل! واصل التقدم بكل ثقة وتطلع للأفضل دائماً! 🌟" 
        : "You are doing a phenomenal job today! Keep pushing forward with unshakeable confidence and optimistic spirit! 🌟"
      );
    } finally {
      setQuoteLoading(false);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Stats calculation
  const pendingCount = totalTasksCount - completedCount;
  const completionRate = totalTasksCount > 0 ? Math.round((completedCount / totalTasksCount) * 100) : 0;

  // Date formatted in Arabic/English
  const formatTodayDate = () => {
    const locale = isAr ? 'ar-EG' : 'en-US';
    return time.toLocaleDateString(locale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatTodayTime = () => {
    return time.toLocaleTimeString(isAr ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  };

  // Getting Greeting based on Hour
  const getGreeting = () => {
    const hour = time.getHours();
    if (isAr) {
      if (hour < 12) return 'صباح الخير والإنتاجية';
      if (hour < 18) return 'مساء الخير والنشاط';
      return 'مساء الخير والهدوء';
    } else {
      if (hour < 12) return 'Good Morning & Productive Day';
      if (hour < 18) return 'Good Afternoon & Active Day';
      return 'Good Evening & Calm Night';
    }
  };

  // Find high priority & urgent tasks
  const highPriorityTasks = tasks.filter(t => !t.completed && (t.priority === 'urgent' || t.priority === 'high'));

  // Closest deadline calculation
  const upcomingDeadlines = tasks
    .filter(t => !t.completed && t.deadlineDate)
    .sort((a, b) => {
      const dateA = new Date(`${a.deadlineDate}T${a.deadlineTime || '23:59'}`);
      const dateB = new Date(`${b.deadlineDate}T${b.deadlineTime || '23:59'}`);
      return dateA.getTime() - dateB.getTime();
    });

  const closestTask = upcomingDeadlines[0];

  // Formatting closest deadline
  const formatDeadline = (task: Task) => {
    if (!task || !task.deadlineDate) return '';
    const dateObj = new Date(`${task.deadlineDate}T${task.deadlineTime || '00:00'}`);
    const locale = isAr ? 'ar-EG' : 'en-US';
    return dateObj.toLocaleDateString(locale, { month: 'short', day: 'numeric' }) + ' ' + (task.deadlineTime || '');
  };

  // Recharts Chart Data (Completion trends over the last 7 days)
  const getChartData = () => {
    const days = [];
    const locale = isAr ? 'ar-EG' : 'en-US';
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString(locale, { weekday: 'short' });
      
      const dayTasks = tasks.filter(t => t.date === dateStr);
      const dayCompleted = dayTasks.filter(t => t.completed).length;
      
      days.push({
        name: dayName,
        [isAr ? 'المهام' : 'Tasks']: dayTasks.length,
        [isAr ? 'المكتملة' : 'Completed']: dayCompleted,
      });
    }
    return days;
  };

  const chartData = getChartData();

  return (
    <div className="space-y-6 pb-20 animate-fade-in" id="dashboard-tab">
      
      {/* 1. Header Hero Card with Greeting & Digital Clock */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-900 via-slate-900 to-emerald-950 p-6 sm:p-8 rounded-3xl border border-slate-800/80 shadow-2xl">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 text-right md:text-right">
            <div className="flex items-center gap-2 justify-end">
              <span className="text-emerald-400 font-bold text-xs px-2.5 py-1 bg-emerald-500/10 rounded-full flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                {isAr ? 'منظم ذكي' : 'Smart Organizer'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3.5xl font-extrabold text-white leading-tight">
              {getGreeting()}، {user.name} 👋
            </h1>
            <p className="text-slate-400 text-sm">
              {formatTodayDate()}
            </p>
          </div>

          <div className="flex flex-col items-center md:items-end justify-center bg-slate-950/40 backdrop-blur-md px-6 py-4 rounded-2xl border border-slate-800/80 shrink-0">
            <span className="text-2xl sm:text-3xl font-extrabold text-indigo-300 font-mono tracking-wider">
              {formatTodayTime()}
            </span>
            <span className="text-[10px] text-slate-500 font-medium uppercase mt-1 tracking-widest font-mono">
              {isAr ? 'التوقيت المحلي الحركي' : 'Active Local Time'}
            </span>
          </div>
        </div>
      </div>

      {/* 1.5. Daily Optimism & Joy Portal (بوابة التفاؤل والبهجة اليومية) */}
      <div className="relative overflow-hidden bg-gradient-to-r from-amber-500/10 via-rose-500/5 to-emerald-500/10 p-6 rounded-3xl border border-amber-500/20 shadow-xl text-right joyful-glow-pulse">
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2 justify-end">
              <span className="text-xs font-extrabold text-amber-500 uppercase tracking-widest flex items-center gap-1">
                <Sun className="w-4 h-4 text-amber-500 animate-spin-slow" />
                {isAr ? 'بوابة التفاؤل اليومية' : 'Daily Optimism Booster'}
              </span>
            </div>

            <div className="flex items-start gap-3 justify-end">
              <p className="text-sm sm:text-base font-bold text-white leading-relaxed max-w-2xl">
                {aiQuote ? aiQuote : currentQuote}
              </p>
              <Quote className="w-6 h-6 text-amber-400/40 rotate-180 shrink-0 mt-0.5" />
            </div>

            {aiQuote && (
              <div className="flex justify-end">
                <span className="text-[10px] text-emerald-400 font-mono bg-emerald-400/10 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Heart className="w-3 h-3 fill-current" />
                  {isAr ? 'جرعة تفاؤل ذكية مخصصة لك' : 'Custom AI Positivity Dose for You'}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={handleGetAiOptimismBoost}
            disabled={quoteLoading}
            className="shrink-0 py-3 px-6 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-white font-extrabold text-xs sm:text-sm rounded-2xl flex items-center gap-2 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all disabled:opacity-50"
          >
            {quoteLoading ? (
              <>
                <div className="w-4.5 h-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>{isAr ? 'جاري استقبال التفاؤل...' : 'Receiving optimism...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4.5 h-4.5 animate-pulse text-yellow-200" />
                <span>{isAr ? 'شحن طاقة التفاؤل (AI)' : 'Smart Positivity Boost (AI)'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Key Metrics & Interactive Completion Gauge */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Progress Circular Gauge Card */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 flex items-center justify-between gap-4">
          <div className="space-y-1 text-right order-2 md:order-none">
            <span className="text-xs text-slate-400 font-medium">
              {isAr ? 'معدل الإنجاز اليومي' : 'Daily Completion'}
            </span>
            <div className="text-3xl font-black text-white">
              {completionRate}%
            </div>
            <p className="text-xs text-slate-500">
              {isAr ? `إنجاز ${completedCount} من أصل ${totalTasksCount}` : `${completedCount} of ${totalTasksCount} tasks completed`}
            </p>
          </div>

          <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
            {/* Visual Circular SVG Gauge */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="38"
                className="stroke-slate-800"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="48"
                cy="48"
                r="38"
                className="stroke-emerald-500 transition-all duration-1000"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 38}
                strokeDashoffset={2 * Math.PI * 38 * (1 - completionRate / 100)}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute text-sm font-bold text-slate-200">
              {completionRate}%
            </div>
          </div>
        </div>

        {/* Pending & Completed Numbers */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 grid grid-cols-2 gap-4">
          <div className="flex flex-col justify-center items-end text-right border-l border-slate-800/60 pr-2">
            <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl mb-2">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-xs text-slate-400 font-medium">{isAr ? 'قيد التنفيذ' : 'Pending'}</span>
            <span className="text-2xl font-bold text-white mt-1">{pendingCount}</span>
          </div>

          <div className="flex flex-col justify-center items-end text-right">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl mb-2">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-xs text-slate-400 font-medium">{isAr ? 'المكتملة' : 'Completed'}</span>
            <span className="text-2xl font-bold text-white mt-1">{completedCount}</span>
          </div>
        </div>

        {/* Closest Deadline Notification Card */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <span className="text-[10px] uppercase font-bold text-amber-500 tracking-wider bg-amber-500/10 px-2 py-0.5 rounded-full">
              {isAr ? 'عاجل' : 'Urgent'}
            </span>
          </div>

          <div className="mt-4 text-right">
            <span className="text-xs text-slate-500 font-medium block">
              {isAr ? 'أقرب موعد نهائي' : 'Closest Deadline'}
            </span>
            {closestTask ? (
              <div className="mt-1">
                <h4 className="font-bold text-white text-sm line-clamp-1">
                  {closestTask.title}
                </h4>
                <p className="text-xs text-amber-400 font-semibold mt-0.5 font-mono">
                  {formatDeadline(closestTask)}
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-400 mt-1">
                {isAr ? 'لا توجد مواعيد نهائية قريبة' : 'No upcoming deadlines'}
              </p>
            )}
          </div>
        </div>

      </div>

      {/* 3. High Priority Tasks & Interactive Progress Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Recharts Completion Over the Week */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-500" />
              {isAr ? 'مستمر التحديث' : 'Live analytics'}
            </span>
            <h3 className="text-base font-bold text-slate-200">
              {isAr ? 'مؤشر الإنتاجية الأسبوعي' : 'Weekly Productivity Trend'}
            </h3>
          </div>

          <div className="h-60 w-full font-mono text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#475569" tickLine={false} />
                <YAxis stroke="#475569" tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '16px', color: '#fff' }}
                />
                <Area 
                  type="monotone" 
                  dataKey={isAr ? 'المهام' : 'Tasks'} 
                  stroke="#6366f1" 
                  fillOpacity={1} 
                  fill="url(#colorTasks)" 
                  strokeWidth={2}
                />
                <Area 
                  type="monotone" 
                  dataKey={isAr ? 'المكتملة' : 'Completed'} 
                  stroke="#10b981" 
                  fillOpacity={1} 
                  fill="url(#colorCompleted)" 
                  strokeWidth={2.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Urgent & High Priority Panel */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 flex flex-col h-[340px]">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 font-bold">
              {highPriorityTasks.length}
            </span>
            <h3 className="text-base font-bold text-slate-200">
              {isAr ? 'مهام ذات أولوية قصوى' : 'High Priority & Urgent'}
            </h3>
          </div>

          <div className="overflow-y-auto space-y-3 flex-1 pr-1 custom-scrollbar">
            {highPriorityTasks.length > 0 ? (
              highPriorityTasks.map((task) => {
                const category = categories.find(c => c.id === task.categoryId);
                return (
                  <div
                    key={task.id}
                    onClick={() => onSelectTask(task)}
                    className="group bg-slate-950/40 hover:bg-slate-950 border border-slate-800/60 hover:border-indigo-500/30 p-3.5 rounded-2xl cursor-pointer flex justify-between items-center transition-all duration-200 text-right"
                  >
                    <div className="flex items-center gap-2">
                      {task.priority === 'urgent' ? (
                        <Flame className="w-4.5 h-4.5 text-rose-500 animate-pulse" />
                      ) : (
                        <Star className="w-4.5 h-4.5 text-amber-500" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-200 text-xs line-clamp-1 group-hover:text-white transition-colors">
                        {task.title}
                      </h4>
                      <div className="flex gap-2 items-center justify-end text-[10px] text-slate-500">
                        <span>{task.duration || (isAr ? 'غير محدد' : 'N/A')}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                        <span className="text-indigo-400">{isAr ? category?.nameAr : category?.name}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 py-8">
                <CheckSquare className="w-10 h-10 stroke-[1.5] text-slate-700 mb-2" />
                <p className="text-xs">
                  {isAr ? 'كل المهام المهمة منجزة بنجاح! 🎉' : 'All high-priority tasks completed! 🎉'}
                </p>
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigateToTab('tasks')}
            className="w-full mt-4 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all"
          >
            {isAr ? (
              <>
                <ArrowLeft className="w-4 h-4" />
                <span>عرض جميع المهام اليومية</span>
              </>
            ) : (
              <>
                <span>View all daily tasks</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </div>

      {/* 4. Floating Action Row / Fast Access Buttons */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <div className="flex gap-3">
          <button
            onClick={() => onNavigateToTab('calendar')}
            className="p-3 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white rounded-2xl border border-slate-800 flex items-center gap-2 text-sm font-semibold transition-all"
            id="go-calendar-btn"
          >
            <Calendar className="w-4.5 h-4.5" />
            <span>{isAr ? 'التقويم' : 'Calendar'}</span>
          </button>
          
          <button
            onClick={() => onNavigateToTab('ai')}
            className="p-3 bg-gradient-to-r from-indigo-900/50 to-emerald-950/50 hover:from-indigo-900 hover:to-emerald-950 text-indigo-300 hover:text-indigo-200 rounded-2xl border border-indigo-500/20 flex items-center gap-2 text-sm font-semibold transition-all"
            id="go-ai-btn"
          >
            <Sparkles className="w-4.5 h-4.5 animate-pulse text-indigo-400" />
            <span>{isAr ? 'مستشار الذكاء الاصطناعي' : 'AI Assistant'}</span>
          </button>
        </div>

        <button
          onClick={onQuickAdd}
          className="py-3 px-5 bg-gradient-to-r from-indigo-600 to-emerald-500 hover:from-indigo-500 hover:to-emerald-400 text-white text-sm font-bold rounded-2xl flex items-center gap-2 shadow-lg shadow-indigo-500/15 hover:shadow-indigo-500/25 transition-all"
          id="quick-add-task-btn"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span>{isAr ? 'إضافة مهمة سريعة' : 'Quick Add Task'}</span>
        </button>
      </div>

    </div>
  );
}
