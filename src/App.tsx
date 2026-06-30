/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  CheckSquare, Calendar, Sparkles, User, Bell, Languages, Search, SlidersHorizontal, Plus, ChevronRight, Check, CheckCircle2, Clock, MapPin, Sparkle
} from 'lucide-react';
import { Task, Category, UserProfile, AppNotification } from './types';

// Subcomponents
import SplashScreen from './components/SplashScreen';
import AuthScreen from './components/AuthScreen';
import Dashboard from './components/Dashboard';
import TaskForm from './components/TaskForm';
import TaskCard from './components/TaskCard';
import CalendarView from './components/CalendarView';
import AIScreen from './components/AIScreen';
import ProfileSettings from './components/ProfileSettings';
import NotificationDrawer from './components/NotificationDrawer';

const PRESET_CATEGORIES: Category[] = [
  { id: 'cat-work', name: 'Work', nameAr: 'العمل', color: 'bg-indigo-500', icon: 'Briefcase' },
  { id: 'cat-home', name: 'Home', nameAr: 'المنزل', color: 'bg-emerald-500', icon: 'Home' },
  { id: 'cat-study', name: 'Study', nameAr: 'الدراسة', color: 'bg-purple-500', icon: 'BookOpen' },
  { id: 'cat-shop', name: 'Shopping', nameAr: 'التسوق', color: 'bg-amber-500', icon: 'ShoppingBag' },
  { id: 'cat-health', name: 'Health', nameAr: 'الصحة والرياضة', color: 'bg-rose-500', icon: 'HeartPulse' },
  { id: 'cat-other', name: 'Other', nameAr: 'أخرى', color: 'bg-slate-500', icon: 'Globe' }
];

// Uplifting synthesized sounds for professional optimistic feedback
const playUpliftingSound = (type: 'success' | 'welcome' | 'click') => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    if (type === 'success') {
      const playTone = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.12, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
        osc.start(start);
        osc.stop(start + duration);
      };
      
      const now = ctx.currentTime;
      playTone(523.25, now, 0.15); // C5
      playTone(659.25, now + 0.08, 0.15); // E5
      playTone(783.99, now + 0.16, 0.2); // G5
      playTone(1046.50, now + 0.24, 0.35); // C6
    } else if (type === 'welcome') {
      const osc = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc2.type = 'triangle';
      osc.frequency.setValueAtTime(329.63, ctx.currentTime);
      osc2.frequency.setValueAtTime(392.00, ctx.currentTime);
      
      osc.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      
      const now = ctx.currentTime;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      
      osc.start(now);
      osc.stop(now + 1.2);
      osc2.start(now);
      osc2.stop(now + 1.2);
    } else if (type === 'click') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(700, ctx.currentTime);
      gain.gain.setValueAtTime(0.02, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    }
  } catch (e) {
    console.warn('Audio error:', e);
  }
};

const INITIAL_USER: UserProfile = {
  name: 'أحمد محمد',
  email: 'demo@taskmanager.com',
  isLoggedIn: false,
  timezone: 'UTC+3',
  language: 'ar',
  theme: 'dark',
  fontSize: 'normal',
  autoMigrateTasks: true,
  vibrationEnabled: true,
  soundEnabled: true,
  activeSessions: [
    { device: 'MacBook Pro Chrome', ip: '192.168.1.15', lastActive: 'الآن' }
  ]
};

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>(PRESET_CATEGORIES);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  // Modals & Panels toggles
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Date and Task Filters
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'completed' | 'overdue'>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState<string>('all');

  // Load from LocalStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('dtm_user');
    const savedTasks = localStorage.getItem('dtm_tasks');
    const savedCategories = localStorage.getItem('dtm_categories');
    const savedNotifs = localStorage.getItem('dtm_notifications');

    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedCategories) setCategories(JSON.parse(savedCategories));
    
    // Set default tasks on first launch
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    } else {
      const todayStr = new Date().toISOString().split('T')[0];
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      const initialTasks: Task[] = [
        {
          id: 'task-demo-1',
          title: 'مراجعة العرض التقديمي للشركة والعميل الجديد',
          description: 'مراجعة العناوين والألوان والتأكد من توافق الأرقام المالية مع تقارير الربع الحالي.',
          date: todayStr,
          deadlineDate: todayStr,
          deadlineTime: '15:30',
          reminderTime: '30m',
          color: 'bg-indigo-500',
          icon: 'Briefcase',
          priority: 'high',
          categoryId: 'cat-work',
          completed: false,
          completionPercentage: 0,
          recurrence: 'none',
          duration: 'ساعة ونصف',
          location: 'مكتب الرياض الرئيسي',
          createdAt: new Date().toISOString(),
          subtasks: [
            { id: 'sub-1', title: 'مراجعة الميزانية التشغيلية', completed: false },
            { id: 'sub-2', title: 'تدقيق الأرقام في صفحة 5', completed: false }
          ]
        },
        {
          id: 'task-demo-2',
          title: 'شراء مستلزمات البقالة الأسبوعية للعائلة',
          description: 'خضار وفواكه طازجة، صدور دجاج، حليب، ومستلزمات العشاء العائلي اليوم.',
          date: todayStr,
          reminderTime: 'none',
          color: 'bg-amber-500',
          icon: 'ShoppingBag',
          priority: 'medium',
          categoryId: 'cat-shop',
          completed: true,
          completionPercentage: 100,
          recurrence: 'weekly',
          duration: '45 دقيقة',
          createdAt: new Date().toISOString()
        },
        {
          id: 'task-demo-3',
          title: 'ممارسة الرياضة الصباحية والجري',
          description: 'تمارين الكارديو الخفيفة والجري لتنشيط الدورة الدموية.',
          date: todayStr,
          deadlineTime: '08:00',
          reminderTime: '15m',
          color: 'bg-rose-500',
          icon: 'HeartPulse',
          priority: 'low',
          categoryId: 'cat-health',
          completed: false,
          completionPercentage: 0,
          recurrence: 'daily',
          duration: '30 دقيقة',
          location: 'النادي الرياضي',
          createdAt: new Date().toISOString()
        },
        {
          id: 'task-demo-4',
          title: 'تحديث خطة عمل قاعدة البيانات',
          description: 'مهمة من الأمس لم يتم إنجازها بعد، تحتاج للإنهاء الفوري والترحيل اليوم.',
          date: yesterdayStr,
          deadlineDate: yesterdayStr,
          deadlineTime: '18:00',
          reminderTime: '1h',
          color: 'bg-indigo-500',
          icon: 'Briefcase',
          priority: 'urgent',
          categoryId: 'cat-work',
          completed: false,
          completionPercentage: 0,
          recurrence: 'none',
          duration: 'ساعتان',
          createdAt: yesterday.toISOString()
        }
      ];
      setTasks(initialTasks);
      localStorage.setItem('dtm_tasks', JSON.stringify(initialTasks));
    }

    if (savedNotifs) {
      setNotifications(JSON.parse(savedNotifs));
    } else {
      const initialNotifs: AppNotification[] = [
        {
          id: 'notif-1',
          title: 'مرحباً بك في منظم المهام اليومية! 🎉',
          body: 'ابدأ تنظيم جدول أعمالك بذكاء وسهولة بالغة بالتعاون مع مستشار الذكاء الاصطناعي.',
          type: 'sync',
          createdAt: new Date().toISOString(),
          read: false
        }
      ];
      setNotifications(initialNotifs);
      localStorage.setItem('dtm_notifications', JSON.stringify(initialNotifs));
    }
  }, []);

  // Sync to LocalStorage on modifications
  const saveTasksToStorage = (updated: Task[]) => {
    setTasks(updated);
    localStorage.setItem('dtm_tasks', JSON.stringify(updated));
  };

  const saveUserToStorage = (updated: Partial<UserProfile>) => {
    setUser(prev => {
      const merged = { ...prev, ...updated };
      localStorage.setItem('dtm_user', JSON.stringify(merged));
      return merged;
    });
  };

  const saveNotificationsToStorage = (updated: AppNotification[]) => {
    setNotifications(updated);
    localStorage.setItem('dtm_notifications', JSON.stringify(updated));
  };

  // 1. Task Auto-Migration Engine (Roll yesterday's pending tasks over to today)
  useEffect(() => {
    if (!user.isLoggedIn || tasks.length === 0 || !user.autoMigrateTasks) return;

    const todayStr = new Date().toISOString().split('T')[0];
    let migrationHappened = false;
    
    const updatedTasks = tasks.map(task => {
      const isPastDate = task.date < todayStr;
      if (isPastDate && !task.completed) {
        migrationHappened = true;
        return {
          ...task,
          date: todayStr,
          autoMigrated: true
        };
      }
      return task;
    });

    if (migrationHappened) {
      saveTasksToStorage(updatedTasks);
      // Trigger a beautiful system notification
      const newNotif: AppNotification = {
        id: 'notif-migrate-' + Date.now(),
        title: user.language === 'ar' ? 'تم ترحيل المهام غير المكتملة 🚀' : 'Tasks Auto-Migrated 🚀',
        body: user.language === 'ar' 
          ? 'تم ترحيل جميع المهام المعلقة السابقة تلقائياً إلى تاريخ اليوم لمساعدتك على إنجازها.'
          : 'All past pending tasks have been automatically rolled over to today.',
        type: 'task_overdue',
        createdAt: new Date().toISOString(),
        read: false
      };
      saveNotificationsToStorage([newNotif, ...notifications]);
    }
  }, [user.isLoggedIn, tasks.length]);

  // Auth Submit Handlers
  const handleLogin = (updatedUser: Partial<UserProfile>) => {
    const profile = { ...user, ...updatedUser, isLoggedIn: true };
    saveUserToStorage(profile);
    
    // Play sound simulation
    if (profile.soundEnabled) {
      playUpliftingSound('welcome');
    }
  };

  const handleLogout = () => {
    const profile = { ...user, isLoggedIn: false };
    saveUserToStorage(profile);
  };

  // Task Actions
  const handleToggleComplete = (id: string) => {
    const updated = tasks.map(t => {
      if (t.id === id) {
        const nextState = !t.completed;
        // Trigger sound / vibration simulation
        if (nextState && user.soundEnabled) {
          playUpliftingSound('success');
        }
        return { ...t, completed: nextState };
      }
      return t;
    });
    saveTasksToStorage(updated);
  };

  const handleSaveTask = (taskFields: Partial<Task>) => {
    if (taskFields.id) {
      // Edit mode
      const updated = tasks.map(t => t.id === taskFields.id ? { ...t, ...taskFields } as Task : t);
      saveTasksToStorage(updated);
    } else {
      // Create mode
      const newTask: Task = {
        id: 'task-' + Math.random().toString(36).substring(2, 9),
        title: taskFields.title || '',
        description: taskFields.description || '',
        date: taskFields.date || selectedDate,
        deadlineDate: taskFields.deadlineDate,
        deadlineTime: taskFields.deadlineTime,
        reminderTime: taskFields.reminderTime || 'none',
        color: taskFields.color || 'bg-indigo-500',
        icon: taskFields.icon || 'Briefcase',
        priority: taskFields.priority || 'medium',
        categoryId: taskFields.categoryId || 'cat-other',
        completed: false,
        completionPercentage: 0,
        recurrence: taskFields.recurrence || 'none',
        recurrenceCount: taskFields.recurrenceCount,
        duration: taskFields.duration,
        location: taskFields.location,
        notes: taskFields.notes,
        links: taskFields.links,
        attachments: taskFields.attachments,
        voiceNoteUrl: taskFields.voiceNoteUrl,
        createdAt: new Date().toISOString()
      };
      saveTasksToStorage([newTask, ...tasks]);
      
      // Notify
      const newNotif: AppNotification = {
        id: 'notif-new-' + Date.now(),
        title: user.language === 'ar' ? 'تمت إضافة مهمة بنجاح 📌' : 'Task Created Successfully 📌',
        body: `${newTask.title}`,
        type: 'task_new',
        createdAt: new Date().toISOString(),
        read: false
      };
      saveNotificationsToStorage([newNotif, ...notifications]);
    }
    setShowTaskForm(false);
    setTaskToEdit(null);
  };

  const handleDeleteTask = (id: string) => {
    const updated = tasks.filter(t => t.id !== id);
    saveTasksToStorage(updated);
  };

  const handleCopyTask = (task: Task) => {
    const copy: Task = {
      ...task,
      id: 'task-copy-' + Math.random().toString(36).substring(2, 9),
      title: `${task.title} (${user.language === 'ar' ? 'نسخة' : 'Copy'})`,
      completed: false,
      createdAt: new Date().toISOString()
    };
    saveTasksToStorage([copy, ...tasks]);
  };

  const handleShareTask = (task: Task) => {
    const textToShare = `Daily Task: ${task.title}\nDescription: ${task.description || ''}\nDeadline: ${task.deadlineDate || ''} ${task.deadlineTime || ''}`;
    navigator.clipboard.writeText(textToShare);
  };

  const handleAddCategory = (newCat: Omit<Category, 'id'>) => {
    const cat: Category = {
      ...newCat,
      id: 'cat-' + Math.random().toString(36).substring(2, 9)
    };
    const updated = [...categories, cat];
    setCategories(updated);
    localStorage.setItem('dtm_categories', JSON.stringify(updated));
  };

  // Backup Import & Clears
  const handleImportBackup = (importedTasks: Task[], importedCategories: Category[]) => {
    saveTasksToStorage(importedTasks);
    setCategories(importedCategories);
    localStorage.setItem('dtm_categories', JSON.stringify(importedCategories));
  };

  const handleClearAllData = () => {
    const confirm = window.confirm(user.language === 'ar' ? 'هل أنت متأكد من حذف كافة المهام وقاعدة البيانات؟' : 'Are you sure you want to delete all tasks database?');
    if (confirm) {
      saveTasksToStorage([]);
      setNotifications([]);
      localStorage.removeItem('dtm_tasks');
      localStorage.removeItem('dtm_notifications');
    }
  };

  // Filters logic
  const getFilteredTasks = () => {
    return tasks.filter((task) => {
      // Date restriction: Daily filter
      const matchesDate = task.date === selectedDate;
      
      // Search text restriction
      const matchesSearch = 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.location?.toLowerCase().includes(searchQuery.toLowerCase());

      // Tab filters
      const matchesTabFilter = 
        activeFilter === 'all' ||
        (activeFilter === 'pending' && !task.completed) ||
        (activeFilter === 'completed' && task.completed) ||
        (activeFilter === 'overdue' && !task.completed && task.deadlineDate && task.deadlineDate < new Date().toISOString().split('T')[0]);

      // Category filter restriction
      const matchesCategory = selectedCategoryFilter === 'all' || task.categoryId === selectedCategoryFilter;

      // Priority filter restriction
      const matchesPriority = selectedPriorityFilter === 'all' || task.priority === selectedPriorityFilter;

      return matchesDate && matchesSearch && matchesTabFilter && matchesCategory && matchesPriority;
    });
  };

  const filteredTasks = getFilteredTasks();
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  return (
    <div 
      className={`min-h-screen bg-slate-950 text-white font-sans ${user.theme === 'light' ? 'light-mode-theme bg-slate-50 text-slate-900' : ''}`}
      style={{ fontSize: user.fontSize === 'normal' ? '16px' : user.fontSize === 'large' ? '18px' : '20px' }}
    >
      
      {/* 1. Splash Screen entry */}
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

      {/* 2. Authentication Login/Signup screens */}
      {!showSplash && !user.isLoggedIn && (
        <AuthScreen user={user} onLogin={handleLogin} />
      )}

      {/* 3. Authentic App Shell Panel Dashboard */}
      {!showSplash && user.isLoggedIn && (
        <div className="flex flex-col min-h-screen relative max-w-7xl mx-auto px-4 md:px-8">
          
          {/* Main Top App Bar Header */}
          <header className="py-5 flex items-center justify-between border-b border-slate-800/80 mb-6 relative z-30">
            {/* Left Header options */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleLogin({ language: user.language === 'ar' ? 'en' : 'ar' })}
                className="p-2.5 bg-slate-900/40 hover:bg-slate-900 border border-slate-800/80 rounded-2xl flex items-center gap-1.5 text-xs font-bold transition-all text-slate-400 hover:text-white"
                id="language-toggle-btn"
                title={user.language === 'ar' ? 'English' : 'العربية'}
              >
                <Languages className="w-4 h-4 text-indigo-400" />
                <span className="hidden sm:inline">{user.language === 'ar' ? 'English' : 'العربية'}</span>
              </button>

              {/* Notification Bell with Red Dot indicator */}
              <button
                onClick={() => setShowNotifications(true)}
                className="p-2.5 bg-slate-900/40 hover:bg-slate-900 border border-slate-800/80 rounded-2xl transition-all text-slate-400 hover:text-white relative"
                id="notifications-bell-btn"
              >
                <Bell className="w-4.5 h-4.5" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1 left-1 w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                )}
              </button>
            </div>

            {/* Right Brand Name display */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-white font-sans leading-none">
                  {user.language === 'ar' ? 'منظم المهام اليومية' : 'Daily Task Manager'}
                </h1>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest font-mono">
                  Daily Task Sync
                </span>
              </div>
              <div className="p-2 bg-gradient-to-tr from-indigo-500 to-emerald-400 rounded-xl shadow-lg shadow-indigo-500/10">
                <CheckSquare className="w-5 h-5 text-white stroke-[2.5]" />
              </div>
            </div>
          </header>

          {/* Main Active content layout renderer */}
          <main className="flex-1">
            
            {/* Dashboard View */}
            {activeTab === 'dashboard' && (
              <Dashboard
                user={user}
                tasks={tasks}
                categories={categories}
                onQuickAdd={() => {
                  setTaskToEdit(null);
                  setShowTaskForm(true);
                }}
                onSelectTask={(task) => {
                  setTaskToEdit(task);
                  setShowTaskForm(true);
                }}
                onNavigateToTab={(tab) => setActiveTab(tab)}
              />
            )}

            {/* Daily Tasks List View */}
            {activeTab === 'tasks' && (
              <div className="space-y-6 pb-20 animate-fade-in text-right">
                
                {/* Search & Filter Inputs Row */}
                <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-5 space-y-4">
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setTaskToEdit(null);
                        setShowTaskForm(true);
                      }}
                      className="py-3 px-5 bg-gradient-to-r from-indigo-600 to-emerald-500 hover:from-indigo-500 hover:to-emerald-400 text-white font-bold text-xs rounded-2xl shrink-0 flex items-center gap-1.5 shadow-lg"
                    >
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                      <span>{user.language === 'ar' ? 'إضافة مهمة' : 'Add Task'}</span>
                    </button>

                    <div className="flex-1 relative">
                      <span className="absolute inset-y-0 right-4 flex items-center text-slate-500">
                        <Search className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-950/50 border border-slate-800 focus:border-indigo-500 rounded-2xl py-3 pr-11 pl-4 text-white text-xs outline-none text-right transition-all"
                        placeholder={user.language === 'ar' ? 'البحث عن المهام، التصنيفات، أو الكلمات الدلالية...' : 'Search tasks, tags, or categories...'}
                        id="tasks-search-input"
                      />
                    </div>
                  </div>

                  {/* Filter Badges and Dropdowns */}
                  <div className="flex flex-wrap gap-2.5 justify-end items-center text-xs">
                    <select
                      value={selectedPriorityFilter}
                      onChange={(e) => setSelectedPriorityFilter(e.target.value)}
                      className="bg-slate-950/50 border border-slate-800 text-slate-300 rounded-xl py-1.5 px-3 outline-none text-right"
                    >
                      <option value="all">{user.language === 'ar' ? 'كل الأولويات' : 'All Priorities'}</option>
                      <option value="low">{user.language === 'ar' ? 'منخفضة' : 'Low'}</option>
                      <option value="medium">{user.language === 'ar' ? 'متوسطة' : 'Medium'}</option>
                      <option value="high">{user.language === 'ar' ? 'مرتفعة' : 'High'}</option>
                      <option value="urgent">{user.language === 'ar' ? 'عاجلة' : 'Urgent'}</option>
                    </select>

                    <select
                      value={selectedCategoryFilter}
                      onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                      className="bg-slate-950/50 border border-slate-800 text-slate-300 rounded-xl py-1.5 px-3 outline-none text-right"
                    >
                      <option value="all">{user.language === 'ar' ? 'كل التصنيفات' : 'All Categories'}</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{user.language === 'ar' ? c.nameAr : c.name}</option>
                      ))}
                    </select>

                    <div className="h-4 w-px bg-slate-800"></div>

                    {(['all', 'pending', 'completed', 'overdue'] as const).map((filter) => {
                      const label = user.language === 'ar'
                        ? { all: 'الكل', pending: 'قيد التنفيذ', completed: 'المكتملة', overdue: 'المتأخرة' }[filter]
                        : { all: 'All', pending: 'Pending', completed: 'Completed', overdue: 'Overdue' }[filter];
                      
                      return (
                        <button
                          key={filter}
                          onClick={() => setActiveFilter(filter)}
                          className={`py-1.5 px-3.5 rounded-xl font-bold transition-all text-[11px] ${
                            activeFilter === filter 
                              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30' 
                              : 'bg-transparent text-slate-500 hover:text-slate-300 border border-transparent'
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Day Scrolling Picker Row */}
                <div className="flex items-center gap-3 justify-between bg-slate-900/20 p-4 border border-slate-800 rounded-3xl">
                  <span className="text-xs text-slate-400 font-bold">
                    {user.language === 'ar' ? 'تاريخ عرض القائمة:' : 'Current view date:'} {selectedDate}
                  </span>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const d = new Date(selectedDate);
                        d.setDate(d.getDate() - 1);
                        setSelectedDate(d.toISOString().split('T')[0]);
                      }}
                      className="p-1.5 bg-slate-900 hover:bg-slate-850 text-slate-300 rounded-lg border border-slate-800 text-xs transition-all"
                    >
                      {user.language === 'ar' ? 'اليوم السابق' : 'Previous Day'}
                    </button>
                    <button
                      onClick={() => {
                        const d = new Date(selectedDate);
                        d.setDate(d.getDate() + 1);
                        setSelectedDate(d.toISOString().split('T')[0]);
                      }}
                      className="p-1.5 bg-slate-900 hover:bg-slate-850 text-slate-300 rounded-lg border border-slate-800 text-xs transition-all"
                    >
                      {user.language === 'ar' ? 'اليوم التالي' : 'Next Day'}
                    </button>
                  </div>
                </div>

                {/* Tasks Cards Grid Renderer */}
                <div className="space-y-4">
                  {filteredTasks.length > 0 ? (
                    filteredTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        user={user}
                        task={task}
                        category={categories.find(c => c.id === task.categoryId)}
                        onToggleComplete={handleToggleComplete}
                        onEdit={(t) => {
                          setTaskToEdit(t);
                          setShowTaskForm(true);
                        }}
                        onDelete={handleDeleteTask}
                        onCopy={handleCopyTask}
                        onShare={handleShareTask}
                      />
                    ))
                  ) : (
                    <div className="py-20 flex flex-col items-center justify-center text-center text-slate-500 space-y-3">
                      <CheckCircle2 className="w-12 h-12 stroke-[1.5] text-slate-700" />
                      <h4 className="font-extrabold text-slate-400">{user.language === 'ar' ? 'لا توجد مهام مطابقة' : 'No tasks match your filters'}</h4>
                      <p className="text-xs text-slate-600 max-w-sm">
                        {user.language === 'ar' 
                          ? 'استمتع بوقتك! لا توجد التزامات معلقة مجدولة لتاريخ وفلاتر البحث هذه.' 
                          : 'All clear! No pending tasks found matching the active date and filters.'}
                      </p>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* Calendar Grid & Timeline Module */}
            {activeTab === 'calendar' && (
              <CalendarView
                user={user}
                tasks={tasks}
                categories={categories}
                onSelectDate={setSelectedDate}
                selectedDate={selectedDate}
                onQuickAdd={() => {
                  setTaskToEdit(null);
                  setShowTaskForm(true);
                }}
                onSelectTask={(task) => {
                  setTaskToEdit(task);
                  setShowTaskForm(true);
                }}
              />
            )}

            {/* AI Advisor Assistant Screen */}
            {activeTab === 'ai' && (
              <AIScreen
                user={user}
                tasks={tasks}
                categories={categories}
              />
            )}

            {/* Settings & Configuration Manager */}
            {activeTab === 'settings' && (
              <ProfileSettings
                user={user}
                tasks={tasks}
                categories={categories}
                onUpdateUser={saveUserToStorage}
                onLogout={handleLogout}
                onImportData={handleImportBackup}
                onClearAllData={handleClearAllData}
              />
            )}

          </main>

          {/* Bottom Custom Gradients navigation toolbar */}
          <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-xl border-t border-slate-800/80 py-3 z-30">
            <div className="max-w-md mx-auto flex justify-around px-4">
              {[
                { id: 'dashboard', label: 'الرئيسية', labelEn: 'Home', icon: Calendar },
                { id: 'tasks', label: 'مهامي', labelEn: 'My Tasks', icon: CheckSquare },
                { id: 'calendar', label: 'التقويم', labelEn: 'Calendar', icon: Calendar },
                { id: 'ai', label: 'الذكاء الاصطناعي', labelEn: 'Gemini AI', icon: Sparkles },
                { id: 'settings', label: 'الإعدادات', labelEn: 'Settings', icon: User }
              ].map((tab) => {
                const IconComponent = tab.icon;
                const isSelected = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex flex-col items-center gap-1 transition-all ${
                      isSelected ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'
                    }`}
                    id={`nav-${tab.id}`}
                  >
                    <IconComponent className={`w-5 h-5 ${isSelected ? 'animate-pulse' : ''}`} />
                    <span className="text-[10px] font-bold font-sans">
                      {user.language === 'ar' ? tab.label : tab.labelEn}
                    </span>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Task creation and editing Drawer */}
          {showTaskForm && (
            <TaskForm
              user={user}
              taskToEdit={taskToEdit}
              categories={categories}
              onSave={handleSaveTask}
              onCancel={() => {
                setShowTaskForm(false);
                setTaskToEdit(null);
              }}
              onAddCategory={handleAddCategory}
            />
          )}

          {/* Active Notifications drawer log */}
          {showNotifications && (
            <NotificationDrawer
              user={user}
              notifications={notifications}
              onClose={() => setShowNotifications(false)}
              onMarkAllAsRead={() => {
                const updated = notifications.map(n => ({ ...n, read: true }));
                saveNotificationsToStorage(updated);
              }}
              onClearAll={() => saveNotificationsToStorage([])}
            />
          )}

        </div>
      )}

    </div>
  );
}
