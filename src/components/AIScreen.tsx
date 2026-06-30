/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  Sparkles, ListOrdered, CalendarDays, BrainCircuit, CheckSquare, BarChart3, Clock, Shuffle, Flame, 
  Loader, ArrowRight, ArrowLeft, RefreshCw, AlertCircle
} from 'lucide-react';
import { Task, Category, UserProfile } from '../types';

interface AIScreenProps {
  user: UserProfile;
  tasks: Task[];
  categories: Category[];
  onApplyAIChanges?: (updatedTasks: Task[]) => void;
}

interface AIFeature {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  icon: any;
  color: string;
  endpoint: string;
}

export default function AIScreen({ user, tasks, categories }: AIScreenProps) {
  const isAr = user.language === 'ar';
  const [activeFeature, setActiveFeature] = useState<AIFeature | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [selectedTaskIdForSplit, setSelectedTaskIdForSplit] = useState<string>('');
  const [error, setError] = useState<string>('');

  const aiFeatures: AIFeature[] = [
    {
      id: 'prioritize',
      title: 'Task Prioritization',
      titleAr: 'ترتيب المهام ذكياً',
      description: 'Prioritize your tasks automatically based on impact, deadlines, and urgency.',
      descriptionAr: 'ترتيب مهامك تلقائياً بناءً على الأهمية القصوى، المواعيد النهائية، والجهد.',
      icon: ListOrdered,
      color: 'from-amber-500 to-orange-600 shadow-amber-500/10',
      endpoint: '/api/ai/prioritize'
    },
    {
      id: 'suggest_time',
      title: 'Best Execution Times',
      titleAr: 'أوقات التنفيذ المثالية',
      description: 'Determine the best hours of the day to tackle your pending tasks.',
      descriptionAr: 'تحديد أفضل ساعات العمل خلال اليوم لإنجاز مهامك المعلقة بناءً على طبيعتها.',
      icon: Clock,
      color: 'from-emerald-500 to-teal-600 shadow-emerald-500/10',
      endpoint: '/api/ai/suggest-time'
    },
    {
      id: 'summarize',
      title: 'Daily Task Summary',
      titleAr: 'تلخيص المهام اليومية',
      description: 'Get a concise, motivating summary of your daily workload and progress.',
      descriptionAr: 'احصل على ملخص تنفيذي ومحفز لجميع مهام يومك الحالية ومستوى تقدمك.',
      icon: BrainCircuit,
      color: 'from-indigo-500 to-violet-600 shadow-indigo-500/10',
      endpoint: '/api/ai/summarize'
    },
    {
      id: 'daily_plan',
      title: 'Auto Daily Plan',
      titleAr: 'إنشاء خطة يومية تلقائياً',
      description: 'Let the AI create a step-by-step balanced daily agenda for you.',
      descriptionAr: 'دع الذكاء الاصطناعي يرسم لك جدولاً زمنياً متزناً ومتكاملاً لكل ساعات يومك.',
      icon: CalendarDays,
      color: 'from-pink-500 to-rose-600 shadow-pink-500/10',
      endpoint: '/api/ai/daily-plan'
    },
    {
      id: 'subtasks',
      title: 'Split Large Tasks',
      titleAr: 'تقسيم المهام الكبيرة',
      description: 'Break down complex tasks into small, actionable checklists.',
      descriptionAr: 'تفكيك المهام الكبيرة والمعقدة إلى خطوات فرعية بسيطة وقابلة للإنجاز المباشر.',
      icon: CheckSquare,
      color: 'from-sky-500 to-blue-600 shadow-sky-500/10',
      endpoint: '/api/ai/split-subtasks'
    },
    {
      id: 'productivity',
      title: 'Productivity Analysis',
      titleAr: 'تحليل مستوى الإنتاجية',
      description: 'Analyze your weekly completion stats and suggest personal advice.',
      descriptionAr: 'تحليل معدلات إنجازك الأسبوعية وتقديم نصائح مخصصة لتحسين الكفاءة.',
      icon: BarChart3,
      color: 'from-purple-500 to-fuchsia-600 shadow-purple-500/10',
      endpoint: '/api/ai/productivity'
    },
    {
      id: 'optimize_schedule',
      title: 'Optimize Work Schedule',
      titleAr: 'تحسين جدول العمل',
      description: 'Identify bottlenecks and suggest workflow optimizations.',
      descriptionAr: 'اكتشاف أوقات الضغط واقتراح تعديلات جوهرية لتحسين توزيع وقتك ومهامك.',
      icon: Shuffle,
      color: 'from-teal-500 to-cyan-600 shadow-teal-500/10',
      endpoint: '/api/ai/optimize-schedule'
    }
  ];

  const handleRunFeature = async (feature: AIFeature) => {
    setActiveFeature(feature);
    setLoading(true);
    setResult('');
    setError('');

    // Pre-validation for splitting tasks
    if (feature.id === 'subtasks' && !selectedTaskIdForSplit) {
      // Find first available task to auto-select
      if (tasks.length > 0) {
        setSelectedTaskIdForSplit(tasks[0].id);
      } else {
        setError(isAr ? 'الرجاء إضافة مهام أولاً ليتمكن الذكاء الاصطناعي من تقسيمها.' : 'Please add some tasks first so the AI can split them.');
        setLoading(false);
        return;
      }
    }

    try {
      const response = await fetch(feature.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tasks: tasks.map(t => ({
            id: t.id,
            title: t.title,
            description: t.description,
            priority: t.priority,
            category: categories.find(c => c.id === t.categoryId)?.nameAr || '',
            completed: t.completed,
            date: t.date,
            duration: t.duration
          })),
          targetTaskId: feature.id === 'subtasks' ? selectedTaskIdForSplit : undefined,
          language: user.language
        })
      });

      if (!response.ok) {
        throw new Error('API server request failed');
      }

      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data.result);
      }
    } catch (err: any) {
      setError(isAr 
        ? 'حدث خطأ أثناء الاتصال بـ Gemini AI. يرجى التأكد من تشغيل الخادم وتثبيت مفتاح API.' 
        : 'Failed to communicate with Gemini AI. Ensure the backend is running with a valid API key.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="ai-tab" className="space-y-6 pb-20 animate-fade-in text-right">
      
      {/* Top Banner Header */}
      <div className="bg-gradient-to-tr from-indigo-950 via-slate-900 to-purple-950 p-6 sm:p-8 rounded-3xl border border-indigo-500/10 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-[200px] h-[200px] bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2 justify-end">
              <Sparkles className="w-6 h-6 text-indigo-400 animate-pulse" />
              <span>{isAr ? 'مستشار الذكاء الاصطناعي اليومي' : 'Daily AI Task Advisor'}</span>
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm max-w-xl">
              {isAr 
                ? 'استغل قدرات نموذج Gemini AI المطور لترتيب يومك، تلخيص التزاماتك، وتحليل إنتاجيتك بخطوات بسيطة وفعالة.' 
                : 'Leverage the power of Gemini AI to prioritize your workload, summarize commitments, and analyze productivity.'}
            </p>
          </div>
        </div>
      </div>

      {!activeFeature ? (
        /* Bento Grid of AI Features */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {aiFeatures.map((feature) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={feature.id}
                onClick={() => handleRunFeature(feature)}
                className="group bg-slate-900/40 hover:bg-slate-900 border border-slate-800/80 hover:border-indigo-500/20 p-5 rounded-3xl cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between min-h-[170px] relative overflow-hidden text-right"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/5 to-transparent rounded-full blur-xl pointer-events-none"></div>
                
                <div className="flex justify-between items-start">
                  <div className={`p-3 bg-gradient-to-tr ${feature.color} text-white rounded-2xl`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest font-mono">
                    Gemini AI
                  </span>
                </div>

                <div className="mt-4 space-y-1">
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-200 group-hover:text-white transition-colors">
                    {isAr ? feature.titleAr : feature.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                    {isAr ? feature.descriptionAr : feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Active Feature Result Viewer */
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 animate-fade-in">
          {/* Active Header bar */}
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <button
              onClick={() => {
                setActiveFeature(null);
                setResult('');
                setError('');
              }}
              className="py-1.5 px-3.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all"
            >
              {isAr ? (
                <>
                  <ArrowRight className="w-4 h-4" />
                  <span>العودة للمستشار</span>
                </>
              ) : (
                <>
                  <span>Back to features</span>
                  <ArrowLeft className="w-4 h-4" />
                </>
              )}
            </button>

            <h3 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
              <span>{isAr ? activeFeature.titleAr : activeFeature.title}</span>
            </h3>
          </div>

          {/* Special inputs like Task Selector for splitting */}
          {activeFeature.id === 'subtasks' && !loading && (
            <div className="p-4 bg-slate-950/40 rounded-2xl border border-slate-850 max-w-md ml-auto">
              <label className="block text-xs text-slate-400 font-bold mb-2">
                {isAr ? 'اختر المهمة الكبيرة لتفكيكها:' : 'Select task to break down:'}
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => handleRunFeature(activeFeature)}
                  className="py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{isAr ? 'تقسيم' : 'Split'}</span>
                </button>
                <select
                  value={selectedTaskIdForSplit}
                  onChange={(e) => setSelectedTaskIdForSplit(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs py-2 px-3 outline-none text-right"
                >
                  {tasks.map((task) => (
                    <option key={task.id} value={task.id}>
                      {task.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Loading Active state */}
          {loading && (
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-xl animate-pulse"></div>
                <div className="p-5 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 rounded-full animate-spin">
                  <RefreshCw className="w-8 h-8" />
                </div>
              </div>
              <h4 className="font-extrabold text-white text-base">
                {isAr ? 'جاري الاتصال بنموذج Gemini AI المعزز...' : 'Querying Gemini AI Model...'}
              </h4>
              <p className="text-xs text-slate-400 max-w-md">
                {isAr 
                  ? 'يقوم الذكاء الاصطناعي الآن بقراءة مهامك الحالية، ترتيبها وتحليل إنتاجيتك بعناية فائقة...' 
                  : 'The AI is currently parsing your tasks and compiling tailored schedule optimizations...'}
              </p>
            </div>
          )}

          {/* Error Feed */}
          {error && (
            <div className="p-5 bg-rose-500/10 border border-rose-500/25 text-rose-300 rounded-2xl flex items-start gap-3 text-sm text-right">
              <div className="flex-1 space-y-1">
                <h4 className="font-bold text-rose-200">{isAr ? 'لم نتمكن من إتمام الطلب' : 'Request Failed'}</h4>
                <p className="text-xs leading-relaxed opacity-90">{error}</p>
              </div>
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
            </div>
          )}

          {/* Beautiful Markdown Response Container */}
          {result && !loading && (
            <div className="bg-slate-950/40 p-6 sm:p-8 rounded-3xl border border-slate-850 text-right leading-relaxed text-sm text-slate-200">
              <div className="markdown-body prose prose-invert max-w-none text-right">
                <ReactMarkdown>{result}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
