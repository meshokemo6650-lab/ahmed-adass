/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  Check, Square, Trash2, Edit2, Copy, Share2, Star, Flame, MapPin, Clock, Paperclip, Link as LinkIcon, ChevronDown, ChevronUp, Mic
} from 'lucide-react';
import { Task, Category, UserProfile } from '../types';

interface TaskCardProps {
  user: UserProfile;
  task: Task;
  category?: Category;
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onCopy: (task: Task) => void;
  onShare: (task: Task) => void;
}

export default function TaskCard({ user, task, category, onToggleComplete, onEdit, onDelete, onCopy, onShare }: TaskCardProps) {
  const isAr = user.language === 'ar';
  const [expanded, setExpanded] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);

  const priorityColors = {
    low: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    medium: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10',
    high: 'text-amber-500 border-amber-500/30 bg-amber-500/10',
    urgent: 'text-rose-500 border-rose-500/30 bg-rose-500/10'
  }[task.priority];

  const priorityLabels = isAr 
    ? { low: 'منخفضة', medium: 'متوسطة', high: 'مرتفعة', urgent: 'عاجلة' }
    : { low: 'Low', medium: 'Medium', high: 'High', urgent: 'Urgent' };

  const handleShareClick = () => {
    onShare(task);
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 2000);
  };

  const getSubtasksCompletedCount = () => {
    if (!task.subtasks) return 0;
    return task.subtasks.filter(st => st.completed).length;
  };

  const subtasksCount = task.subtasks ? task.subtasks.length : 0;
  const completedSubtasksCount = getSubtasksCompletedCount();
  const subtasksPercentage = subtasksCount > 0 ? Math.round((completedSubtasksCount / subtasksCount) * 100) : 0;

  return (
    <div 
      className={`relative bg-slate-900/60 border hover:border-slate-700 rounded-3xl p-4 sm:p-5 transition-all duration-300 ${
        task.completed ? 'opacity-70 border-slate-800/40 bg-slate-950/20' : 'border-slate-800'
      }`}
      id={`task-card-${task.id}`}
    >
      {/* Top Main Section */}
      <div className="flex items-start justify-between gap-4">
        
        {/* Left: Quick Actions Grid */}
        <div className="flex items-center gap-1.5 self-center">
          <button
            onClick={() => onEdit(task)}
            className="p-2 hover:bg-slate-800 text-slate-400 hover:text-indigo-400 rounded-xl transition-all"
            title={isAr ? 'تعديل' : 'Edit'}
          >
            <Edit2 className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleShareClick}
            className="p-2 hover:bg-slate-800 text-slate-400 hover:text-emerald-400 rounded-xl transition-all"
            title={isAr ? 'مشاركة' : 'Share'}
          >
            <Share2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => onCopy(task)}
            className="p-2 hover:bg-slate-800 text-slate-400 hover:text-purple-400 rounded-xl transition-all"
            title={isAr ? 'نسخ مكرر' : 'Copy'}
          >
            <Copy className="w-4 h-4" />
          </button>

          <button
            onClick={() => onDelete(task.id)}
            className="p-2 hover:bg-slate-800 text-slate-400 hover:text-rose-400 rounded-xl transition-all"
            title={isAr ? 'حذف' : 'Delete'}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Center/Right: Task content & Checkbox */}
        <div className="flex items-start gap-4 flex-1 justify-end text-right">
          
          {/* Text Content */}
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex flex-wrap gap-2 items-center justify-end">
              {/* Category tag */}
              {category && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${category.color.replace('bg-', 'text-').replace('500', '400')} bg-slate-950/40 border border-slate-800`}>
                  {isAr ? category.nameAr : category.name}
                </span>
              )}

              {/* Priority badge */}
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${priorityColors}`}>
                {priorityLabels[task.priority]}
              </span>

              {task.autoMigrated && (
                <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full">
                  {isAr ? 'مُرحَّلَة تلقائياً' : 'Auto-migrated'}
                </span>
              )}
            </div>

            <h3 className={`text-sm sm:text-base font-extrabold text-white truncate leading-tight ${
              task.completed ? 'line-through text-slate-500' : ''
            }`}>
              {task.title}
            </h3>

            {task.description && (
              <p className="text-xs text-slate-400 line-clamp-1">
                {task.description}
              </p>
            )}

            {/* Timings line */}
            <div className="flex flex-wrap gap-3 items-center justify-end text-[10px] text-slate-500 font-medium">
              {task.duration && (
                <span className="flex items-center gap-1">
                  <span>{task.duration}</span>
                  <Clock className="w-3.5 h-3.5 text-slate-600" />
                </span>
              )}
              {task.location && (
                <span className="flex items-center gap-1">
                  <span>{task.location}</span>
                  <MapPin className="w-3.5 h-3.5 text-slate-600" />
                </span>
              )}
              {task.deadlineDate && (
                <span className="text-amber-500/80 font-semibold font-mono flex items-center gap-1">
                  <span>{task.deadlineDate} {task.deadlineTime || ''}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                </span>
              )}
            </div>
          </div>

          {/* Large Checkbox */}
          <button
            onClick={() => onToggleComplete(task.id)}
            className={`w-6.5 h-6.5 rounded-xl border flex items-center justify-center transition-all shrink-0 mt-1 ${
              task.completed
                ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 border-emerald-500 text-white shadow-lg shadow-emerald-500/15'
                : 'border-slate-800 bg-slate-950/40 text-transparent hover:border-indigo-500'
            }`}
            id={`checkbox-${task.id}`}
          >
            {task.completed && <Check className="w-4 h-4 stroke-[3]" />}
          </button>

        </div>
      </div>

      {/* Subtasks progress indicator */}
      {subtasksCount > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500 text-right">
          <div className="w-24 bg-slate-950/60 h-1.5 rounded-full overflow-hidden p-[1px] border border-slate-800/80">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${subtasksPercentage}%` }}
            />
          </div>
          <span>
            {isAr 
              ? `الخطوات الفرعية: إنجاز ${completedSubtasksCount} من ${subtasksCount}` 
              : `Subtasks: ${completedSubtasksCount} of ${subtasksCount} done`}
          </span>
        </div>
      )}

      {/* Details Expander Panel */}
      {(task.notes || task.links?.length || task.attachments?.length || task.voiceNoteUrl) && (
        <div className="mt-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-center gap-1.5 py-1 text-[10px] text-slate-500 hover:text-slate-300 font-semibold transition-all"
          >
            <span>{expanded ? (isAr ? 'عرض تفاصيل أقل' : 'Show less') : (isAr ? 'عرض المزيد من التفاصيل' : 'Show more details')}</span>
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {expanded && (
            <div className="mt-3 pt-3 border-t border-slate-800/60 text-right space-y-3 animate-fade-in text-xs text-slate-300">
              
              {/* Extra Notes */}
              {task.notes && (
                <div className="bg-slate-950/30 p-3 rounded-2xl border border-slate-850">
                  <span className="font-bold text-slate-400 block mb-1">{isAr ? 'ملاحظات إضافية:' : 'Extra Notes:'}</span>
                  <p className="leading-relaxed text-slate-300 whitespace-pre-line">{task.notes}</p>
                </div>
              )}

              {/* Embedded links */}
              {task.links && task.links.length > 0 && (
                <div className="space-y-1.5">
                  <span className="font-bold text-slate-400 block">{isAr ? 'الروابط المرجعية:' : 'Reference Links:'}</span>
                  <div className="flex flex-col gap-1 items-end">
                    {task.links.map((link, idx) => (
                      <a 
                        key={idx} 
                        href={link} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-indigo-400 hover:underline flex items-center gap-1 font-mono text-[10px]"
                      >
                        <span>{link}</span>
                        <LinkIcon className="w-3 h-3 text-slate-500" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Attachments */}
              {task.attachments && task.attachments.length > 0 && (
                <div className="space-y-2">
                  <span className="font-bold text-slate-400 block">{isAr ? 'المرفقات:' : 'Attachments:'}</span>
                  <div className="grid grid-cols-2 gap-2">
                    {task.attachments.map((att, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 bg-slate-950/40 rounded-xl border border-slate-850">
                        <span className="text-[10px] font-mono text-slate-400 truncate max-w-[120px]">{att.name}</span>
                        {att.type === 'image' && <Paperclip className="w-3.5 h-3.5 text-indigo-400" />}
                        {att.type === 'file' && <Paperclip className="w-3.5 h-3.5 text-emerald-400" />}
                        {att.type === 'audio' && <Mic className="w-3.5 h-3.5 text-amber-400" />}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Subtask checkboxes directly inside expander */}
              {task.subtasks && task.subtasks.length > 0 && (
                <div className="space-y-2">
                  <span className="font-bold text-slate-400 block">{isAr ? 'قائمة التحقق الفرعية:' : 'Subtask Checklist:'}</span>
                  <div className="space-y-2">
                    {task.subtasks.map((st) => (
                      <div key={st.id} className="flex items-center justify-end gap-2 text-xs">
                        <span className={st.completed ? 'line-through text-slate-500' : 'text-slate-300'}>{st.title}</span>
                        <div className="w-4.5 h-4.5 rounded border border-slate-800 flex items-center justify-center bg-slate-950">
                          {st.completed && <Check className="w-3 h-3 text-emerald-400 stroke-[2.5]" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      )}

      {/* Shared alert toast simulation */}
      {showShareToast && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-slate-950 border border-emerald-500/30 text-emerald-400 font-semibold text-xs px-3.5 py-1.5 rounded-full z-25 flex items-center gap-1.5 shadow-xl animate-bounce">
          <Check className="w-3.5 h-3.5 stroke-[3]" />
          <span>{isAr ? 'تم نسخ تفاصيل المهمة للمشاركة! 🚀' : 'Task details copied for sharing! 🚀'}</span>
        </div>
      )}
    </div>
  );
}
