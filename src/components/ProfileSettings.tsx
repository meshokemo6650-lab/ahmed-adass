/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { 
  User, Mail, Phone, Moon, Sun, Languages, Type, Bell, Volume2, ShieldCheck, Download, Upload, Trash2, 
  LogOut, Laptop, Check, Image as ImageIcon, Sparkles, Smartphone, Fingerprint, RefreshCw
} from 'lucide-react';
import { UserProfile, Task, Category } from '../types';

interface ProfileSettingsProps {
  user: UserProfile;
  tasks: Task[];
  categories: Category[];
  onUpdateUser: (updatedUser: Partial<UserProfile>) => void;
  onLogout: () => void;
  onImportData: (importedTasks: Task[], importedCategories: Category[]) => void;
  onClearAllData: () => void;
}

export default function ProfileSettings({ user, tasks, categories, onUpdateUser, onLogout, onImportData, onClearAllData }: ProfileSettingsProps) {
  const isAr = user.language === 'ar';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  const [saveStatus, setSaveStatus] = useState(false);

  // Editable Form states
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone || '');

  // Keep form inputs in sync if the user profile updates from elsewhere
  useEffect(() => {
    setName(user.name);
    setEmail(user.email);
    setPhone(user.phone || '');
  }, [user.name, user.email, user.phone]);

  const triggerSave = (updatedFields: Partial<UserProfile>) => {
    onUpdateUser(updatedFields);
    setSaveStatus(true);
    setTimeout(() => setSaveStatus(false), 2000);
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerSave({ name, email, phone: phone || undefined });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = () => {
      triggerSave({ photoUrl: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  // Real JSON Export of all Tasks, Categories, User Settings
  const handleExportData = () => {
    const stateToExport = {
      tasks,
      categories,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(stateToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Daily_Task_Manager_Backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Real JSON Import
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        if (parsed.tasks && parsed.categories) {
          onImportData(parsed.tasks, parsed.categories);
          alert(isAr ? 'تم استيراد البيانات والنسخة الاحتياطية بنجاح! 📂' : 'Backup imported successfully! 📂');
        } else {
          alert(isAr ? 'الملف المختار غير صالح.' : 'Invalid backup file format.');
        }
      } catch (err) {
        alert(isAr ? 'فشل قراءة الملف.' : 'Failed to parse the JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div id="settings-tab" className="space-y-6 pb-20 animate-fade-in text-right">
      
      {/* 1. Main Profile Info Card with Pic */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6">
        <h3 className="text-base font-extrabold text-slate-200 mb-6 flex items-center gap-2 justify-end">
          <User className="w-5 h-5 text-indigo-400" />
          <span>{isAr ? 'الملف الشخصي والمزامنة' : 'Profile & Synchronization'}</span>
        </h3>

        <form onSubmit={handleProfileSubmit} className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-6 justify-end">
            <div className="text-center sm:text-right space-y-1 order-last sm:order-none">
              <h4 className="font-extrabold text-white text-base">{user.name}</h4>
              <p className="text-xs text-slate-500 font-mono">{user.email}</p>
            </div>

            {/* Avatar Photo Frame */}
            <div className="relative group shrink-0">
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-slate-800 group-hover:border-indigo-500 transition-all flex items-center justify-center bg-slate-950">
                {user.photoUrl ? (
                  <img src={user.photoUrl} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-slate-700" />
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -left-1 p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all shadow-md"
              >
                <ImageIcon className="w-3.5 h-3.5" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-400 text-xs mb-1.5">{isAr ? 'رقم الهاتف' : 'Phone Number'}</label>
              <div className="relative">
                <span className="absolute inset-y-0 right-3.5 flex items-center text-slate-500">
                  <Phone className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-800 focus:border-indigo-500 rounded-xl py-2 px-3 pr-10 text-white text-xs outline-none text-right"
                  placeholder="+966 50 000 0000"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 text-xs mb-1.5">{isAr ? 'البريد الإلكتروني' : 'Email'}</label>
              <div className="relative">
                <span className="absolute inset-y-0 right-3.5 flex items-center text-slate-500">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-800 focus:border-indigo-500 rounded-xl py-2 px-3 pr-10 text-white text-xs outline-none text-right font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 text-xs mb-1.5">{isAr ? 'الاسم الكامل' : 'Full Name'}</label>
              <div className="relative">
                <span className="absolute inset-y-0 right-3.5 flex items-center text-slate-500">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-800 focus:border-indigo-500 rounded-xl py-2 px-3 pr-10 text-white text-xs outline-none text-right"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="submit"
              className="py-2.5 px-6 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-lg transition-all"
            >
              {isAr ? 'حفظ التعديلات' : 'Save Profiles'}
            </button>
          </div>
        </form>
      </div>

      {/* 2. Style & Interface Controls (Theme, Language, Font Size) */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-5">
        <h3 className="text-base font-extrabold text-slate-200 flex items-center gap-2 justify-end">
          <Languages className="w-5 h-5 text-indigo-400" />
          <span>{isAr ? 'إعدادات الواجهة والمظهر' : 'Interface & Theme Settings'}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Theme selection */}
          <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-2xl flex flex-col justify-between items-end">
            <div className="flex items-center gap-1.5 text-indigo-400 font-semibold text-xs mb-3">
              <Sun className="w-4 h-4" />
              <span>{isAr ? 'الوضع اللوني للمظهر' : 'Appearance Theme'}</span>
            </div>
            <div className="flex gap-2 w-full justify-end">
              <button
                type="button"
                onClick={() => triggerSave({ theme: 'light' })}
                className={`flex-1 py-1.5 text-center rounded-lg text-xs font-bold transition-all ${
                  user.theme === 'light' ? 'bg-indigo-600 text-white shadow' : 'bg-slate-900 text-slate-400'
                }`}
              >
                {isAr ? 'مضيء' : 'Light'}
              </button>
              <button
                type="button"
                onClick={() => triggerSave({ theme: 'dark' })}
                className={`flex-1 py-1.5 text-center rounded-lg text-xs font-bold transition-all ${
                  user.theme === 'dark' ? 'bg-indigo-600 text-white shadow' : 'bg-slate-900 text-slate-400'
                }`}
              >
                {isAr ? 'داكن' : 'Dark'}
              </button>
            </div>
          </div>

          {/* Language Selection */}
          <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-2xl flex flex-col justify-between items-end">
            <div className="flex items-center gap-1.5 text-indigo-400 font-semibold text-xs mb-3">
              <Languages className="w-4 h-4" />
              <span>{isAr ? 'اللغة الافتراضية' : 'Default Language'}</span>
            </div>
            <div className="flex gap-2 w-full justify-end">
              <button
                type="button"
                onClick={() => triggerSave({ language: 'en' })}
                className={`flex-1 py-1.5 text-center rounded-lg text-xs font-bold transition-all ${
                  user.language === 'en' ? 'bg-indigo-600 text-white shadow' : 'bg-slate-900 text-slate-400'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => triggerSave({ language: 'ar' })}
                className={`flex-1 py-1.5 text-center rounded-lg text-xs font-bold transition-all ${
                  user.language === 'ar' ? 'bg-indigo-600 text-white shadow' : 'bg-slate-900 text-slate-400'
                }`}
              >
                العربية
              </button>
            </div>
          </div>

          {/* Font Sizes */}
          <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-2xl flex flex-col justify-between items-end">
            <div className="flex items-center gap-1.5 text-indigo-400 font-semibold text-xs mb-3">
              <Type className="w-4 h-4" />
              <span>{isAr ? 'حجم الخط' : 'Font Size'}</span>
            </div>
            <div className="flex gap-1.5 w-full justify-end">
              {(['normal', 'large', 'xl'] as const).map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => triggerSave({ fontSize: sz })}
                  className={`flex-1 py-1.5 text-center rounded-lg text-[10px] font-bold transition-all capitalize ${
                    user.fontSize === sz ? 'bg-indigo-600 text-white shadow' : 'bg-slate-900 text-slate-400'
                  }`}
                >
                  {sz === 'normal' && (isAr ? 'عادي' : 'Normal')}
                  {sz === 'large' && (isAr ? 'كبير' : 'Large')}
                  {sz === 'xl' && (isAr ? 'ضخم' : 'X-Large')}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* 3. Notifications, sound, auto migration toggles */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-5">
        <h3 className="text-base font-extrabold text-slate-200 flex items-center gap-2 justify-end">
          <Bell className="w-5 h-5 text-indigo-400" />
          <span>{isAr ? 'التنبيهات والأتمتة' : 'Notifications & Automation'}</span>
        </h3>

        <div className="space-y-4">
          
          {/* Auto migration toggle */}
          <div className="flex items-center justify-between p-3.5 bg-slate-950/30 rounded-2xl border border-slate-850">
            <button
              onClick={() => triggerSave({ autoMigrateTasks: !user.autoMigrateTasks })}
              className={`w-11 h-6 rounded-full p-1 transition-all ${
                user.autoMigrateTasks ? 'bg-indigo-600' : 'bg-slate-800'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-all transform ${
                user.autoMigrateTasks ? (isAr ? '-translate-x-5' : 'translate-x-5') : 'translate-x-0'
              }`} />
            </button>
            
            <div className="text-right">
              <span className="text-xs font-extrabold text-white block">
                {isAr ? 'الترحيل التلقائي للمهام' : 'Auto-Migrate Overdue Tasks'}
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                {isAr 
                  ? 'ترحيل المهام غير المنجزة تلقائياً إلى اليوم التالي عند انتهاء اليوم.' 
                  : 'Automatically roll uncompleted tasks over to the next day.'}
              </span>
            </div>
          </div>

          {/* Sound toggle */}
          <div className="flex items-center justify-between p-3.5 bg-slate-950/30 rounded-2xl border border-slate-850">
            <button
              onClick={() => triggerSave({ soundEnabled: !user.soundEnabled })}
              className={`w-11 h-6 rounded-full p-1 transition-all ${
                user.soundEnabled ? 'bg-indigo-600' : 'bg-slate-800'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-all transform ${
                user.soundEnabled ? (isAr ? '-translate-x-5' : 'translate-x-5') : 'translate-x-0'
              }`} />
            </button>
            
            <div className="text-right">
              <span className="text-xs font-extrabold text-white block">
                {isAr ? 'نغمة الإشعارات الصوتية' : 'Notification Sounds'}
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                {isAr ? 'تشغيل منبهات صوتية فورية للتذكير بالمواعيد.' : 'Play audible alerts for upcoming task reminders.'}
              </span>
            </div>
          </div>

          {/* Vibration toggle */}
          <div className="flex items-center justify-between p-3.5 bg-slate-950/30 rounded-2xl border border-slate-850">
            <button
              onClick={() => triggerSave({ vibrationEnabled: !user.vibrationEnabled })}
              className={`w-11 h-6 rounded-full p-1 transition-all ${
                user.vibrationEnabled ? 'bg-indigo-600' : 'bg-slate-800'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-all transform ${
                user.vibrationEnabled ? (isAr ? '-translate-x-5' : 'translate-x-5') : 'translate-x-0'
              }`} />
            </button>
            
            <div className="text-right">
              <span className="text-xs font-extrabold text-white block">
                {isAr ? 'اهتزاز الهاتف' : 'Vibration Alerts'}
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                {isAr ? 'تفعيل ميزة الاهتزاز مع التنبيهات.' : 'Enable tactile feedback for task updates.'}
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* 4. Backup & Export Backup Panel */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-5">
        <h3 className="text-base font-extrabold text-slate-200 flex items-center gap-2 justify-end">
          <Download className="w-5 h-5 text-indigo-400" />
          <span>{isAr ? 'النسخ الاحتياطي وتصدير البيانات' : 'Data Backup & Import / Export'}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={handleExportData}
            className="p-4 bg-slate-950/40 hover:bg-slate-950 border border-slate-850 rounded-2xl flex flex-col items-center justify-center text-center gap-2 text-indigo-400 hover:text-indigo-300 transition-all"
          >
            <Download className="w-6 h-6" />
            <span className="text-xs font-extrabold">{isAr ? 'تصدير نسخة احتياطية (JSON)' : 'Export Backup file'}</span>
            <span className="text-[10px] text-slate-500">{isAr ? 'حفظ مهامك وتفضيلاتك في ملف على جهازك.' : 'Download your tasks and settings to local drive.'}</span>
          </button>

          <button
            type="button"
            onClick={() => importInputRef.current?.click()}
            className="p-4 bg-slate-950/40 hover:bg-slate-950 border border-slate-850 rounded-2xl flex flex-col items-center justify-center text-center gap-2 text-emerald-400 hover:text-emerald-300 transition-all"
          >
            <Upload className="w-6 h-6" />
            <span className="text-xs font-extrabold">{isAr ? 'استيراد نسخة احتياطية' : 'Import Backup file'}</span>
            <span className="text-[10px] text-slate-500">{isAr ? 'استرجاع مهامك السابقة من ملف خارجي.' : 'Restore previous tasks database from JSON file.'}</span>
            <input
              type="file"
              ref={importInputRef}
              onChange={handleImportData}
              accept=".json"
              className="hidden"
            />
          </button>
        </div>
      </div>

      {/* 5. Security & Device Active Sessions list */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-5">
        <h3 className="text-base font-extrabold text-slate-200 flex items-center gap-2 justify-end">
          <ShieldCheck className="w-5 h-5 text-indigo-400" />
          <span>{isAr ? 'الجلسات والأمان والخصوصية' : 'Security & Active Sessions'}</span>
        </h3>

        <div className="space-y-4">
          {/* Active Sessions Lists */}
          <div className="space-y-2 text-right">
            <span className="text-xs text-slate-400 font-bold block mb-2">{isAr ? 'الأجهزة والجلسات النشطة حالياً:' : 'Active logged-in devices:'}</span>
            {user.activeSessions.map((sess, idx) => (
              <div key={idx} className="flex justify-between items-center p-3.5 bg-slate-950/30 rounded-2xl border border-slate-850">
                <span className="text-[10px] text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded-full">{isAr ? 'نشط الآن' : 'Active now'}</span>
                
                <div className="flex items-center gap-3 justify-end">
                  <div className="text-right">
                    <span className="text-xs font-extrabold text-white block">{sess.device}</span>
                    <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">IP: {sess.ip} • Last Active: {sess.lastActive}</span>
                  </div>
                  {sess.device.includes('iPhone') || sess.device.includes('Android') ? (
                    <Smartphone className="w-5 h-5 text-slate-400" />
                  ) : (
                    <Laptop className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 6. Advanced Settings, Account deletions & logging outs */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-800/60 justify-end">
        <button
          onClick={onClearAllData}
          className="py-3 px-6 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 text-rose-400 hover:text-rose-300 font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition-all"
        >
          <Trash2 className="w-4 h-4" />
          <span>{isAr ? 'حذف كافة البيانات نهائياً' : 'Clear All Database Data'}</span>
        </button>
        
        <button
          onClick={onLogout}
          className="py-3 px-6 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>{isAr ? 'تسجيل الخروج الآمن' : 'Logout Securely'}</span>
        </button>
      </div>

      {/* Dynamic Save Changes Status Banner Toast */}
      {saveStatus && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-slate-950 border border-emerald-500/30 text-emerald-400 font-semibold text-xs px-4 py-2 rounded-full z-30 flex items-center gap-2 shadow-xl animate-bounce">
          <Check className="w-4 h-4 stroke-[3]" />
          <span>{isAr ? 'تم حفظ وتطبيق التغييرات بنجاح! ✨' : 'Settings applied successfully! ✨'}</span>
        </div>
      )}

    </div>
  );
}
