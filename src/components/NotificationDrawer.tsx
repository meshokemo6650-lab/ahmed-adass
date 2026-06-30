/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { X, Bell, CheckCircle2, AlertTriangle, RefreshCw, Calendar, Sparkles } from 'lucide-react';
import { AppNotification, UserProfile } from '../types';

interface NotificationDrawerProps {
  user: UserProfile;
  notifications: AppNotification[];
  onClose: () => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
}

export default function NotificationDrawer({ user, notifications, onClose, onMarkAllAsRead, onClearAll }: NotificationDrawerProps) {
  const isAr = user.language === 'ar';

  const getIcon = (type: string) => {
    switch (type) {
      case 'reminder':
        return <Bell className="w-4 h-4 text-amber-400" />;
      case 'task_new':
        return <Calendar className="w-4 h-4 text-indigo-400" />;
      case 'task_overdue':
        return <AlertTriangle className="w-4 h-4 text-rose-500 animate-pulse" />;
      case 'task_completed':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'sync':
        return <RefreshCw className="w-4 h-4 text-sky-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-purple-400" />;
    }
  };

  const formatTime = (timeStr: string) => {
    const d = new Date(timeStr);
    return d.toLocaleTimeString(isAr ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-slate-900 border-l border-slate-800 shadow-2xl z-50 flex flex-col animate-slide-in text-right">
      
      {/* Title Header */}
      <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950/20">
        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all"
        >
          <X className="w-4.5 h-4.5" />
        </button>
        
        <h3 className="text-base font-extrabold text-white flex items-center gap-2">
          <Bell className="w-4.5 h-4.5 text-indigo-400" />
          <span>{isAr ? 'مركز التنبيهات والطلبات' : 'Notifications Feed'}</span>
        </h3>
      </div>

      {/* Buttons Options */}
      {notifications.length > 0 && (
        <div className="px-5 py-2.5 bg-slate-950/40 border-b border-slate-850 flex justify-between items-center text-xs">
          <button
            onClick={onClearAll}
            className="text-rose-400 hover:text-rose-300 font-bold"
          >
            {isAr ? 'مسح الكل' : 'Clear All'}
          </button>
          
          <button
            onClick={onMarkAllAsRead}
            className="text-indigo-400 hover:text-indigo-300 font-bold"
          >
            {isAr ? 'تحديد المقروء' : 'Mark all Read'}
          </button>
        </div>
      )}

      {/* Notifications listings list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {notifications.length > 0 ? (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 rounded-2xl border transition-all flex items-start gap-3 justify-end text-right ${
                notif.read 
                  ? 'bg-slate-950/20 border-slate-850/40 opacity-70' 
                  : 'bg-slate-950/60 border-slate-850 shadow-md ring-1 ring-indigo-500/5'
              }`}
            >
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-500 font-mono">{formatTime(notif.createdAt)}</span>
                  <h4 className={`text-xs font-extrabold text-slate-200 ${notif.read ? 'font-normal' : ''}`}>
                    {notif.title}
                  </h4>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {notif.body}
                </p>
              </div>

              {/* Notification icon matching type */}
              <div className="p-2 bg-slate-900 border border-slate-800 rounded-xl shrink-0 mt-0.5">
                {getIcon(notif.type)}
              </div>
            </div>
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 py-10 space-y-2">
            <Bell className="w-10 h-10 stroke-[1.5] text-slate-700" />
            <p className="text-xs">{isAr ? 'سجل الإشعارات فارغ تماماً حالياً.' : 'Your notification log is clear.'}</p>
          </div>
        )}
      </div>

    </div>
  );
}
