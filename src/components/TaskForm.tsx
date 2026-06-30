/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { 
  X, Calendar, Bell, AlertTriangle, List, Check, Plus, Paperclip, Image as ImageIcon, Mic, Link as LinkIcon, MapPin, 
  Clock, Play, Square, Loader, Sparkles
} from 'lucide-react';
import { Task, Category, Priority, Recurrence, UserProfile, TaskAttachment } from '../types';

interface TaskFormProps {
  user: UserProfile;
  taskToEdit?: Task | null;
  categories: Category[];
  onSave: (task: Partial<Task>) => void;
  onCancel: () => void;
  onAddCategory: (category: Omit<Category, 'id'>) => void;
}

const PRESET_COLORS = [
  'bg-emerald-500', 'bg-indigo-500', 'bg-rose-500', 'bg-amber-500', 
  'bg-sky-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-teal-500'
];

const PRESET_ICONS = [
  'Briefcase', 'Home', 'BookOpen', 'ShoppingBag', 'HeartPulse', 'Dumbbell', 
  'Users', 'CalendarDays', 'FolderGit', 'Coins', 'Globe'
];

export default function TaskForm({ user, taskToEdit, categories, onSave, onCancel, onAddCategory }: TaskFormProps) {
  const isAr = user.language === 'ar';

  // Basic Details
  const [title, setTitle] = useState(taskToEdit?.title || '');
  const [description, setDescription] = useState(taskToEdit?.description || '');
  const [date, setDate] = useState(taskToEdit?.date || new Date().toISOString().split('T')[0]);
  const [deadlineDate, setDeadlineDate] = useState(taskToEdit?.deadlineDate || '');
  const [deadlineTime, setDeadlineTime] = useState(taskToEdit?.deadlineTime || '');
  const [reminderTime, setReminderTime] = useState(taskToEdit?.reminderTime || 'none');
  const [color, setColor] = useState(taskToEdit?.color || 'bg-indigo-500');
  const [icon, setIcon] = useState(taskToEdit?.icon || 'Briefcase');
  const [priority, setPriority] = useState<Priority>(taskToEdit?.priority || 'medium');
  const [categoryId, setCategoryId] = useState(taskToEdit?.categoryId || categories[0]?.id || '');

  // Extras
  const [notes, setNotes] = useState(taskToEdit?.notes || '');
  const [location, setLocation] = useState(taskToEdit?.location || '');
  const [duration, setDuration] = useState(taskToEdit?.duration || '');
  const [recurrence, setRecurrence] = useState<Recurrence>(taskToEdit?.recurrence || 'none');
  const [recurrenceCount, setRecurrenceCount] = useState<number>(taskToEdit?.recurrenceCount || 1);

  // Subtasks
  const [subtasks, setSubtasks] = useState<{ id: string; title: string; completed: boolean }[]>(taskToEdit?.subtasks || []);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  // Links
  const [links, setLinks] = useState<string[]>(taskToEdit?.links || []);
  const [newLink, setNewLink] = useState('');

  // Attachments
  const [attachments, setAttachments] = useState<TaskAttachment[]>(taskToEdit?.attachments || []);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Voice Note Recording Mock State
  const [isRecording, setIsRecording] = useState(false);
  const [recordTimer, setRecordTimer] = useState(0);
  const [audioURL, setAudioURL] = useState<string | null>(taskToEdit?.voiceNoteUrl || null);
  const recordIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Category Creation State
  const [showNewCatForm, setShowNewCatForm] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatNameAr, setNewCatNameAr] = useState('');
  const [newCatColor, setNewCatColor] = useState('bg-indigo-500');
  const [newCatIcon, setNewCatIcon] = useState('Briefcase');

  // AI Assistance states for specific field prediction
  const [aiPredicting, setAiPredicting] = useState<'duration' | 'priority' | 'time' | null>(null);

  // Handles Voice Recording Mock
  useEffect(() => {
    if (isRecording) {
      setRecordTimer(0);
      recordIntervalRef.current = setInterval(() => {
        setRecordTimer((prev) => prev + 1);
      }, 1000);
    } else {
      if (recordIntervalRef.current) {
        clearInterval(recordIntervalRef.current);
      }
    }
    return () => {
      if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);
    };
  }, [isRecording]);

  const startRecording = () => {
    setIsRecording(true);
  };

  const stopRecording = () => {
    setIsRecording(false);
    // Simulate audio file creation
    setAudioURL('mock-audio-note');
    const mockAudioAttachment: TaskAttachment = {
      name: isAr ? 'تسجيل صوتي.wav' : 'VoiceNote.wav',
      type: 'audio',
      url: 'mock-audio'
    };
    setAttachments(prev => [...prev, mockAudioAttachment]);
  };

  const deleteVoiceNote = () => {
    setAudioURL(null);
    setAttachments(prev => prev.filter(att => att.type !== 'audio'));
  };

  // Handles Subtasks Adding
  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    setSubtasks([...subtasks, {
      id: Math.random().toString(),
      title: newSubtaskTitle.trim(),
      completed: false
    }]);
    setNewSubtaskTitle('');
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter(st => st.id !== id));
  };

  // Handles Link Adding
  const handleAddLink = () => {
    if (!newLink.trim()) return;
    let url = newLink.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    setLinks([...links, url]);
    setNewLink('');
  };

  const handleRemoveLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  // Handles Files/Images selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    
    // Read file
    const reader = new FileReader();
    reader.onload = () => {
      const newAtt: TaskAttachment = {
        name: file.name,
        type: file.type.startsWith('image/') ? 'image' : 'file',
        url: reader.result as string
      };
      setAttachments(prev => [...prev, newAtt]);
    };
    reader.readAsDataURL(file);
  };

  // Trigger New Category Inline Adding
  const handleCreateCategory = () => {
    if (!newCatName.trim() || !newCatNameAr.trim()) return;
    onAddCategory({
      name: newCatName.trim(),
      nameAr: newCatNameAr.trim(),
      color: newCatColor,
      icon: newCatIcon
    });
    setNewCatName('');
    setNewCatNameAr('');
    setShowNewCatForm(false);
  };

  // Handles Form Save
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      id: taskToEdit?.id,
      title: title.trim(),
      description: description.trim(),
      date,
      deadlineDate: deadlineDate || undefined,
      deadlineTime: deadlineTime || undefined,
      reminderTime,
      color,
      icon,
      priority,
      categoryId,
      notes: notes.trim() || undefined,
      location: location.trim() || undefined,
      duration: duration.trim() || undefined,
      recurrence,
      recurrenceCount: recurrence !== 'none' ? recurrenceCount : undefined,
      subtasks,
      links,
      attachments,
      voiceNoteUrl: audioURL || undefined
    });
  };

  // AI features directly inside Task Adding (predictions)
  const handleAIAssistant = async (field: 'duration' | 'priority' | 'time') => {
    if (!title) return;
    setAiPredicting(field);
    try {
      const response = await fetch('/api/ai/predict-field', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, field, language: user.language })
      });
      const data = await response.json();
      if (data.result) {
        if (field === 'duration') setDuration(data.result);
        if (field === 'priority') setPriority(data.result.toLowerCase() as Priority);
        if (field === 'time') setDeadlineTime(data.result);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAiPredicting(null);
    }
  };

  return (
    <div id="task-form-container" className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-40 flex justify-end animate-fade-in p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-full scrollbar-none text-right">
        
        {/* Header Title Row */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <button
            onClick={onCancel}
            className="p-2.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all"
            id="close-task-form"
          >
            <X className="w-5 h-5" />
          </button>
          
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            {taskToEdit 
              ? (isAr ? 'تعديل المهمة اليومية' : 'Edit Daily Task') 
              : (isAr ? 'إضافة مهمة جديدة' : 'Add New Task')}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Title and Description */}
          <div className="space-y-4">
            <div>
              <label className="block text-slate-300 text-sm font-semibold mb-2">
                {isAr ? 'عنوان المهمة' : 'Task Title'} *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-2xl py-3 px-4 text-white text-sm outline-none transition-all text-right"
                placeholder={isAr ? 'مثال: مراجعة العرض التقديمي للعميل' : 'e.g., Review client proposal'}
                id="task-title-input"
              />
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-semibold mb-2">
                {isAr ? 'الوصف التفصيلي' : 'Detailed Description'}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full bg-slate-950/50 border border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-2xl py-3 px-4 text-white text-sm outline-none transition-all text-right resize-none"
                placeholder={isAr ? 'أدخل تفاصيل المهمة وملاحظات التخطيط هنا...' : 'Enter task details and planning notes here...'}
                id="task-desc-input"
              />
            </div>
          </div>

          {/* AI Predict Field Toolbar */}
          {title && (
            <div className="bg-gradient-to-r from-indigo-950/40 via-slate-900 to-emerald-950/40 border border-indigo-500/10 p-4 rounded-2xl flex flex-wrap gap-2 justify-end items-center">
              <span className="text-xs text-indigo-300 font-semibold flex items-center gap-1.5 order-last">
                <Sparkles className="w-3.5 h-3.5" />
                {isAr ? 'تعبئة ذكية بواسطة AI:' : 'AI Field Predictors:'}
              </span>
              <button
                type="button"
                onClick={() => handleAIAssistant('duration')}
                disabled={!!aiPredicting}
                className="py-1.5 px-3 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1"
              >
                {aiPredicting === 'duration' ? <Loader className="w-3 h-3 animate-spin" /> : null}
                {isAr ? 'توقع المدة' : 'Predict Duration'}
              </button>
              <button
                type="button"
                onClick={() => handleAIAssistant('priority')}
                disabled={!!aiPredicting}
                className="py-1.5 px-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1"
              >
                {aiPredicting === 'priority' ? <Loader className="w-3 h-3 animate-spin" /> : null}
                {isAr ? 'تحديد الأولوية' : 'Determine Priority'}
              </button>
              <button
                type="button"
                onClick={() => handleAIAssistant('time')}
                disabled={!!aiPredicting}
                className="py-1.5 px-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1"
              >
                {aiPredicting === 'time' ? <Loader className="w-3 h-3 animate-spin" /> : null}
                {isAr ? 'أفضل وقت تنفيذ' : 'Suggest Time'}
              </button>
            </div>
          )}

          {/* Date, Deadline Date and Deadline Time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-300 text-xs font-semibold mb-2">
                {isAr ? 'تاريخ التنفيذ' : 'Execution Date'}
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-2xl py-2.5 px-4 text-white text-xs outline-none transition-all text-right"
                  id="task-date"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 text-xs font-semibold mb-2">
                {isAr ? 'موعد نهائي' : 'Deadline Date'}
              </label>
              <input
                type="date"
                value={deadlineDate}
                onChange={(e) => setDeadlineDate(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-2xl py-2.5 px-4 text-white text-xs outline-none transition-all text-right"
                id="task-deadline-date"
              />
            </div>

            <div>
              <label className="block text-slate-300 text-xs font-semibold mb-2">
                {isAr ? 'وقت الموعد النهائي' : 'Deadline Time'}
              </label>
              <input
                type="time"
                value={deadlineTime}
                onChange={(e) => setDeadlineTime(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-2xl py-2.5 px-4 text-white text-xs outline-none transition-all text-right font-mono"
                id="task-deadline-time"
              />
            </div>
          </div>

          {/* Category selection and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Category */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <button
                  type="button"
                  onClick={() => setShowNewCatForm(!showNewCatForm)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isAr ? 'تصنيف جديد' : 'New Category'}</span>
                </button>
                <label className="block text-slate-300 text-sm font-semibold">
                  {isAr ? 'تصنيف المهمة' : 'Task Category'}
                </label>
              </div>

              {!showNewCatForm ? (
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-2xl py-3 px-4 text-white text-sm outline-none transition-all text-right"
                  id="task-category-select"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id} className="bg-slate-900 text-right">
                      {isAr ? cat.nameAr : cat.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="bg-slate-950/40 p-3 rounded-2xl border border-slate-800 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={newCatNameAr}
                      onChange={(e) => setNewCatNameAr(e.target.value)}
                      placeholder="الاسم بالعربية"
                      className="bg-slate-950 border border-slate-800 py-1.5 px-2.5 rounded-xl text-xs text-white text-right outline-none focus:border-indigo-500"
                    />
                    <input
                      type="text"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      placeholder="Name in English"
                      className="bg-slate-950 border border-slate-800 py-1.5 px-2.5 rounded-xl text-xs text-white text-right outline-none focus:border-indigo-500"
                    />
                  </div>
                  
                  {/* Preset Colors */}
                  <div className="flex flex-wrap gap-1.5 justify-end">
                    {PRESET_COLORS.map((col) => (
                      <button
                        key={col}
                        type="button"
                        onClick={() => setNewCatColor(col)}
                        className={`w-6 h-6 rounded-full ${col} flex items-center justify-center`}
                      >
                        {newCatColor === col && <Check className="w-3 h-3 text-white" />}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setShowNewCatForm(false)}
                      className="py-1 px-3 bg-slate-800 text-slate-400 text-xs rounded-lg hover:text-white"
                    >
                      {isAr ? 'إلغاء' : 'Cancel'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCreateCategory}
                      className="py-1 px-3 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-500 font-bold"
                    >
                      {isAr ? 'إنشاء' : 'Create'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Priority */}
            <div>
              <label className="block text-slate-300 text-sm font-semibold mb-2">
                {isAr ? 'مستوى الأولوية' : 'Priority Level'}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['low', 'medium', 'high', 'urgent'] as Priority[]).map((p) => {
                  const label = isAr 
                    ? { low: 'منخفض', medium: 'متوسط', high: 'مرتفع', urgent: 'عاجل' }[p]
                    : { low: 'Low', medium: 'Medium', high: 'High', urgent: 'Urgent' }[p];
                  
                  const activeClass = {
                    low: 'bg-slate-800 text-emerald-400 border-slate-700',
                    medium: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
                    high: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
                    urgent: 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  }[p];

                  const isSelected = priority === p;

                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`py-2 px-1 text-center rounded-xl text-xs font-semibold border transition-all ${
                        isSelected ? activeClass + ' ring-2 ring-indigo-500/20' : 'border-slate-800 text-slate-500 bg-transparent'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Color & Icon select row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Color */}
            <div>
              <label className="block text-slate-300 text-sm font-semibold mb-2">
                {isAr ? 'لون المهمة' : 'Task Theme Color'}
              </label>
              <div className="flex flex-wrap gap-2 justify-end">
                {PRESET_COLORS.map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setColor(col)}
                    className={`w-7 h-7 rounded-full ${col} flex items-center justify-center border border-slate-900 shadow-md transform hover:scale-105 transition-all`}
                  >
                    {color === col && <Check className="w-4 h-4 text-white font-bold" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Recurrence */}
            <div>
              <label className="block text-slate-300 text-sm font-semibold mb-2">
                {isAr ? 'تكرار المهمة' : 'Task Recurrence'}
              </label>
              <div className="flex gap-2 justify-end">
                {recurrence !== 'none' && (
                  <input
                    type="number"
                    min="1"
                    value={recurrenceCount}
                    onChange={(e) => setRecurrenceCount(parseInt(e.target.value) || 1)}
                    className="w-16 bg-slate-950/50 border border-slate-800 rounded-xl text-center text-white text-xs py-2 pr-1 font-mono"
                    placeholder="Times"
                  />
                )}
                <select
                  value={recurrence}
                  onChange={(e) => setRecurrence(e.target.value as Recurrence)}
                  className="bg-slate-950/50 border border-slate-800 rounded-xl text-white text-xs py-2 px-4 outline-none text-right"
                  id="task-recurrence"
                >
                  <option value="none">{isAr ? 'لا يتكرر' : 'No Recurrence'}</option>
                  <option value="daily">{isAr ? 'يومياً' : 'Daily'}</option>
                  <option value="weekly">{isAr ? 'أسبوعياً' : 'Weekly'}</option>
                  <option value="monthly">{isAr ? 'شهرياً' : 'Monthly'}</option>
                  <option value="yearly">{isAr ? 'سنوياً' : 'Yearly'}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Location & Reminder & Duration */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-300 text-xs font-semibold mb-2">
                {isAr ? 'المدة المتوقعة (ساعات/دقائق)' : 'Expected Duration'}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 right-3.5 flex items-center text-slate-500">
                  <Clock className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-800 focus:border-indigo-500 rounded-2xl py-2 px-3 pr-9 text-white text-xs outline-none text-right font-mono"
                  placeholder={isAr ? 'ساعتان، 45 دقيقة' : 'e.g., 2 hours'}
                  id="task-duration"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 text-xs font-semibold mb-2">
                {isAr ? 'وقت التذكير' : 'Reminder Trigger'}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 right-3.5 flex items-center text-slate-500">
                  <Bell className="w-4 h-4" />
                </span>
                <select
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value as any)}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-2 px-3 pr-9 text-white text-xs outline-none text-right"
                  id="task-reminder"
                >
                  <option value="none">{isAr ? 'بدون تذكير' : 'No Reminder'}</option>
                  <option value="5m">{isAr ? 'قبل الموعد بـ 5 دقائق' : '5 mins before'}</option>
                  <option value="15m">{isAr ? 'قبل الموعد بـ 15 دقيقة' : '15 mins before'}</option>
                  <option value="30m">{isAr ? 'قبل الموعد بـ 30 دقيقة' : '30 mins before'}</option>
                  <option value="1h">{isAr ? 'قبل الموعد بساعة' : '1 hour before'}</option>
                  <option value="1d">{isAr ? 'قبل الموعد بيوم' : '1 day before'}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 text-xs font-semibold mb-2">
                {isAr ? 'الموقع الجغرافي للمهمة' : 'Location Address'}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 right-3.5 flex items-center text-slate-500">
                  <MapPin className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-800 focus:border-indigo-500 rounded-2xl py-2 px-3 pr-9 text-white text-xs outline-none text-right"
                  placeholder={isAr ? 'المنزل، مقر الشركة' : 'e.g., Conference room'}
                  id="task-location"
                />
              </div>
            </div>
          </div>

          {/* Subtasks checklist */}
          <div className="space-y-3">
            <label className="block text-slate-300 text-sm font-semibold text-right">
              {isAr ? 'تقسيم المهمة لخطوات فرعية' : 'Break down into Subtasks'}
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleAddSubtask}
                className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
              >
                {isAr ? 'إضافة' : 'Add'}
              </button>
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubtask())}
                className="flex-1 bg-slate-950/50 border border-slate-800 focus:border-indigo-500 rounded-xl py-2 px-3 text-right text-xs text-white"
                placeholder={isAr ? 'أدخل خطوة فرعية...' : 'Enter subtask step...'}
                id="new-subtask"
              />
            </div>

            {subtasks.length > 0 && (
              <div className="bg-slate-950/30 p-3 rounded-2xl border border-slate-800/60 space-y-2">
                {subtasks.map((st) => (
                  <div key={st.id} className="flex justify-between items-center text-right py-1.5 border-b border-slate-800/30 last:border-0">
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(st.id)}
                      className="text-rose-500 hover:text-rose-400 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <span className="text-xs text-slate-300">{st.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Links Row */}
          <div className="space-y-3">
            <label className="block text-slate-300 text-sm font-semibold text-right">
              {isAr ? 'روابط مفيدة' : 'Useful Links'}
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleAddLink}
                className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
              >
                {isAr ? 'ربط' : 'Link'}
              </button>
              <div className="flex-1 relative">
                <span className="absolute inset-y-0 right-3 flex items-center text-slate-500">
                  <LinkIcon className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={newLink}
                  onChange={(e) => setNewLink(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddLink())}
                  className="w-full bg-slate-950/50 border border-slate-800 focus:border-indigo-500 rounded-xl py-2 pr-9 pl-3 text-right text-xs text-white font-mono"
                  placeholder="https://example.com"
                  id="new-link"
                />
              </div>
            </div>

            {links.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-end">
                {links.map((lnk, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 bg-slate-800/60 border border-slate-700/60 px-3 py-1 rounded-full text-[10px] text-slate-300 font-mono">
                    <button type="button" onClick={() => handleRemoveLink(idx)} className="text-rose-400 hover:text-white">
                      <X className="w-3 h-3" />
                    </button>
                    <span className="truncate max-w-[150px]">{lnk}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Audio voice recording + attachment lists */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            
            {/* Audio Recording */}
            <div className="bg-slate-950/30 p-4 rounded-2xl border border-slate-800 flex flex-col items-center justify-center min-h-[110px]">
              <span className="text-xs text-slate-400 font-medium mb-3">
                {isAr ? 'تسجيل ملاحظة صوتية' : 'Record Audio Note'}
              </span>
              
              {!isRecording ? (
                <div className="flex items-center gap-3">
                  {audioURL && (
                    <button
                      type="button"
                      onClick={deleteVoiceNote}
                      className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 rounded-xl text-xs transition-all"
                    >
                      {isAr ? 'حذف الصوت' : 'Delete'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={startRecording}
                    className="py-2 px-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-indigo-400 hover:text-indigo-300 font-bold rounded-xl text-xs flex items-center gap-2 transition-all"
                  >
                    <Mic className="w-4 h-4" />
                    <span>{audioURL ? (isAr ? 'تسجيل جديد' : 'Re-record') : (isAr ? 'بدء التسجيل' : 'Record')}</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
                    <span className="text-rose-400 font-bold text-xs font-mono">{recordTimer}s</span>
                  </div>
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="py-1.5 px-4 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 animate-pulse"
                  >
                    <Square className="w-3 h-3 fill-white" />
                    <span>{isAr ? 'إيقاف وحفظ' : 'Stop & Save'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Attach Files & Images */}
            <div className="bg-slate-950/30 p-4 rounded-2xl border border-slate-800 flex flex-col items-center justify-center min-h-[110px]">
              <span className="text-xs text-slate-400 font-medium mb-3">
                {isAr ? 'المرفقات والصور' : 'Attachments & Pictures'}
              </span>
              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 rounded-2xl flex items-center gap-2 text-xs font-bold transition-all"
                >
                  <Paperclip className="w-4 h-4" />
                  <span>{isAr ? 'ملف' : 'File'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="p-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 rounded-2xl flex items-center gap-2 text-xs font-bold transition-all"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>{isAr ? 'صورة' : 'Photo'}</span>
                </button>
              </div>

              {/* Hidden Inputs */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="*/*"
              />
              <input
                type="file"
                ref={imageInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
              />
            </div>

          </div>

          {/* List current attachments */}
          {attachments.length > 0 && (
            <div className="border border-slate-800/80 p-4 rounded-2xl bg-slate-950/20 space-y-3 text-right">
              <span className="text-xs text-slate-400 font-semibold">{isAr ? 'المرفقات الحالية:' : 'Current Attachments:'}</span>
              <div className="grid grid-cols-2 gap-3">
                {attachments.map((att, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2.5 bg-slate-950/50 border border-slate-850 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))}
                      className="text-rose-400 hover:text-rose-300 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-2 justify-end truncate">
                      <span className="text-xs text-slate-300 truncate font-mono max-w-[150px]">{att.name}</span>
                      {att.type === 'image' && <ImageIcon className="w-4 h-4 text-indigo-400" />}
                      {att.type === 'file' && <Paperclip className="w-4 h-4 text-emerald-400" />}
                      {att.type === 'audio' && <Mic className="w-4 h-4 text-amber-400" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Note Area */}
          <div>
            <label className="block text-slate-300 text-sm font-semibold mb-2">
              {isAr ? 'ملاحظات إضافية' : 'Extra Notes'}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full bg-slate-950/50 border border-slate-800 focus:border-indigo-500 rounded-2xl py-3 px-4 text-white text-sm outline-none text-right"
              placeholder={isAr ? 'أضف ملاحظات إضافية للمهمة...' : 'Add any extra notes here...'}
              id="task-notes"
            />
          </div>

          {/* Actions Save & Cancel */}
          <div className="flex gap-4 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-white font-bold text-sm rounded-2xl transition-all"
              id="cancel-task-btn"
            >
              {isAr ? 'إلغاء الأمر' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="flex-1 py-3.5 bg-gradient-to-r from-indigo-600 to-emerald-500 hover:from-indigo-500 hover:to-emerald-400 text-white font-bold text-sm rounded-2xl shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all font-sans"
              id="save-task-btn"
            >
              {isAr ? 'حفظ المهمة والجدولة' : 'Save Task & Schedule'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
