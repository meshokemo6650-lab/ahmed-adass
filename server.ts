/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

// Setup JSON body parser
app.use(express.json({ limit: '5mb' }));

// Initializing server-side Gemini SDK client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Helper: Run generic Gemini generation with specific prompt
async function runGeminiPrompt(systemPrompt: string, userPrompt: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      }
    });
    return response.text || '';
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    throw new Error(error.message || 'Error occurred in Gemini AI communication');
  }
}

// --- AI API Proxies ---

// 1. Prioritize Tasks
app.post('/api/ai/prioritize', async (req, res) => {
  const { tasks, language } = req.body;
  const isAr = language === 'ar';

  const systemInstruction = isAr
    ? "أنت مساعد تخطيط وتنظيم متميز وخبير بالذكاء الاصطناعي. قم بتحليل قائمة مهام المستخدم وقرر الترتيب الأمثل لإنجازها لتوفير أعلى إنتاجية وأقل ضغط. اكتب تقريراً باللغة العربية بأسلوب راقٍ ومنظم باستخدام خطوط عريضة وقوائم نقطية جميلة ومنسقة بالكامل بصيغة Markdown، ووضح الأسباب الكامنة وراء الترتيب المقترح."
    : "You are an expert Productivity and Task Organization Coach. Analyze the user's tasks and suggest an optimal prioritization queue to maximize productivity and reduce stress. Output a highly polished Markdown report with reasons, bullet points, and actionable tips in English.";

  const userPrompt = `Here is my current task list:\n${JSON.stringify(tasks, null, 2)}\n\nPlease suggest the best order of execution and provide reasoning.`;

  try {
    const result = await runGeminiPrompt(systemInstruction, userPrompt);
    res.json({ result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Best Execution Times
app.post('/api/ai/suggest-time', async (req, res) => {
  const { tasks, language } = req.body;
  const isAr = language === 'ar';

  const systemInstruction = isAr
    ? "أنت مستشار تنظيم الوقت وإدارة الطاقة الإنتاجية اليومية. قم بتحليل المهام المعلقة واقترح توزيعاً ذكياً على ساعات اليوم (مثال: الفترة الصباحية لمهام التركيز العالي، وفترة العصر للمهام الروتينية، إلخ). اكتب الإجابة بتنسيق Markdown رائع باللغة العربية يوضح التوزيع الزمني والسبب."
    : "You are a Daily Energy and Schedule Planner. Suggest the best time frames (e.g., Deep Work Morning, Administrative Afternoon) for each task. Present a beautifully formatted Markdown schedule in English with concise rationale.";

  const userPrompt = `These are my pending tasks:\n${JSON.stringify(tasks, null, 2)}\n\nPlease allocate them to best energy zones throughout the day.`;

  try {
    const result = await runGeminiPrompt(systemInstruction, userPrompt);
    res.json({ result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Daily Task Summary
app.post('/api/ai/summarize', async (req, res) => {
  const { tasks, language } = req.body;
  const isAr = language === 'ar';

  const systemInstruction = isAr
    ? "أنت محفز تخطيط شخصي. اكتب ملخصاً مشجعاً ومختصراً جداً لالتزامات ومهام المستخدم اليومية ومعدل تقدمه. يجب أن يكون الأسلوب ملهماً، وافر الطاقة، وسهل القراءة، مكتوباً باللغة العربية بتنسيق Markdown يبرز أهم المهام التي يجب التركيز عليها اليوم."
    : "You are a highly encouraging personal productivity coach. Write a concise, energetic, and motivating executive summary of the user's day based on their tasks and completion rate. Use professional English Markdown, bolding key focus areas.";

  const userPrompt = `Summarize my tasks for today:\n${JSON.stringify(tasks, null, 2)}`;

  try {
    const result = await runGeminiPrompt(systemInstruction, userPrompt);
    res.json({ result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Daily Plan Timeline
app.post('/api/ai/daily-plan', async (req, res) => {
  const { tasks, language } = req.body;
  const isAr = language === 'ar';

  const systemInstruction = isAr
    ? "أنت خبير رسم الخطط اليومية المنسقة. ارسم خطة كاملة لليوم، مقسمة بساعات زمنية واضحة تشمل فترات راحة قصيرة وتركيزاً عميقاً لجميع المهام الحالية. نسق الرد بلغة عربية سليمة وواضحة جداً بصيغة جدول أو قائمة خطة زمنية باستخدام Markdown."
    : "You are an expert Daily Routine Designer. Map out a cohesive hour-by-hour schedule for the day, including deep work slots and restorative breaks. Structure the output as a clean Markdown timeline in English.";

  const userPrompt = `Help me schedule this task list into a balanced daily timeline:\n${JSON.stringify(tasks, null, 2)}`;

  try {
    const result = await runGeminiPrompt(systemInstruction, userPrompt);
    res.json({ result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Split Large Task
app.post('/api/ai/split-subtasks', async (req, res) => {
  const { tasks, targetTaskId, language } = req.body;
  const isAr = language === 'ar';

  const targetTask = tasks.find((t: any) => t.id === targetTaskId);
  if (!targetTask) {
    return res.status(400).json({ error: 'Task not found' });
  }

  const systemInstruction = isAr
    ? "أنت مهندس تفكيك الأهداف المعقدة. ساعد المستخدم على تقسيم مهمته الكبيرة والصعبة إلى قائمة تحقق فرعية (Subtasks) مكونة من 4 إلى 7 خطوات صغيرة وسريعة وقابلة للتنفيذ الفوري المباشر. اكتب قائمة الخطوات باللغة العربية منسقة بوضوح بصيغة Markdown."
    : "You are a Task Breakdown Specialist. Convert a single complex, large task into an actionable checklist of 4-7 smaller, bite-sized subtasks. Provide the checklist in clean, easy-to-read English Markdown.";

  const userPrompt = `Please split this large task into a small actionable checklist:\nTask Title: ${targetTask.title}\nDescription: ${targetTask.description || ''}`;

  try {
    const result = await runGeminiPrompt(systemInstruction, userPrompt);
    res.json({ result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Productivity Stats Analysis
app.post('/api/ai/productivity', async (req, res) => {
  const { tasks, language } = req.body;
  const isAr = language === 'ar';

  const systemInstruction = isAr
    ? "أنت خبير كفاءة العمليات والإنتاجية الفردية. قم بتحليل معدلات إنجاز المستخدم لمهامه بناءً على القائمة الحالية، واكشف مواطن القوة، وضع 3 إرشادات عملية لتحسين كفاءته الشخصية غداً. اكتب الإجابة بلغة عربية محفزة بأسلوب متميز مستخدماً Markdown."
    : "You are a Workplace Performance Analyst. Analyze the user's task completions, identify energy leaks or strong areas, and offer 3 clear, evidence-based recommendations to level up their work efficiency tomorrow. Present in clean English Markdown.";

  const userPrompt = `Analyze my completion rates and metrics:\n${JSON.stringify(tasks, null, 2)}`;

  try {
    const result = await runGeminiPrompt(systemInstruction, userPrompt);
    res.json({ result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Optimize Work Schedule
app.post('/api/ai/optimize-schedule', async (req, res) => {
  const { tasks, language } = req.body;
  const isAr = language === 'ar';

  const systemInstruction = isAr
    ? "أنت مستشار تنظيم جداول الأعمال وتوازن الحياة مع العمل. اقترح طرقاً لتحسين جدول مهام المستخدم الحالي لزيادة أوقات الراحة الذهنية، وتنظيم الفواصل، ومحاربة الاحتراق الوظيفي. اكتب الاقتراحات باللغة العربية منسقة بـ Markdown راقٍ وعملي."
    : "You are a Work-Life Balance consultant. Analyze the schedule, locate bottleneck periods of stress, and suggest workflow re-arrangements to prevent burnout. Output in professional English Markdown.";

  const userPrompt = `Help me optimize this schedule for better work-life balance:\n${JSON.stringify(tasks, null, 2)}`;

  try {
    const result = await runGeminiPrompt(systemInstruction, userPrompt);
    res.json({ result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 7.5. Smart Optimism Booster (بوابة التفاؤل اليومية)
app.post('/api/ai/optimism-boost', async (req, res) => {
  const { userName, completedCount, totalCount, language } = req.body;
  const isAr = language === 'ar';

  const systemInstruction = isAr
    ? "أنت محفز وباعث للأمل والتفاؤل متميز جداً. اكتب فقرة قصيرة جداً وملهمة ومبهجة باللغة العربية الفصحى تشحن المستخدم بالطاقة الإيجابية والثقة والتفاؤل الشديد لليوم. استخدم بضع كلمات دافئة ومشرقة تلمس القلب، مثل 'شروق'، 'شغف'، 'نجاحك'، 'قوتك الكامنة'. لا تستخدم أي لغة خشبية أو جافة."
    : "You are an incredibly inspiring life and positivity coach. Write a very brief, cheerful, and highly optimistic paragraph to boost the user's energy, hope, and confidence for the day. Use warm, radiant, and encouraging words in English.";

  const userPrompt = `My name is ${userName}. Today I have completed ${completedCount} tasks out of ${totalCount}. Give me a beautiful, highly optimistic booster to feel happy and hopeful!`;

  try {
    const result = await runGeminiPrompt(systemInstruction, userPrompt);
    res.json({ result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Predict Individual Task Field (Duration, Priority, Suggested Time)
app.post('/api/ai/predict-field', async (req, res) => {
  const { title, description, field, language } = req.body;
  const isAr = language === 'ar';

  let systemInstruction = '';
  if (field === 'duration') {
    systemInstruction = isAr
      ? "توقع المدة الزمنية المتوقعة لإنجاز هذه المهمة بشكل معقول (مثال: '45 دقيقة', 'ساعة ونصف', '3 ساعات'). أجب فقط بالكلمات المحددة للمدة، بدون أي تحية أو شرح إضافي."
      : "Predict a reasonable expected duration for this task (e.g., '45 mins', '1.5 hours', '3 hours'). Answer ONLY with the predicted duration words, with no other text.";
  } else if (field === 'priority') {
    systemInstruction = isAr
      ? "حدد مستوى الأولوية المناسب للمهمة بناءً على عنوانها ووصفها. يجب أن تكون الإجابة كلمة واحدة فقط من الحالات التالية: 'low', 'medium', 'high', 'urgent'. أجب بالإنجليزية فقط."
      : "Analyze and determine the priority level of this task. Answer ONLY with one of the following lowercase strings: 'low', 'medium', 'high', 'urgent'.";
  } else if (field === 'time') {
    systemInstruction = isAr
      ? "اقترح وقت البدء المثالي لهذه المهمة بتنسيق 24 ساعة (مثال: '09:00', '14:30', '18:00'). أجب فقط بالوقت المحدد ولا تكتب أي شيء آخر."
      : "Suggest an ideal start time in 24-hour format (e.g., '09:00', '14:30', '18:00'). Answer ONLY with the time string, nothing else.";
  }

  const userPrompt = `Task Title: ${title}\nDescription: ${description || ''}`;

  try {
    const result = await runGeminiPrompt(systemInstruction, userPrompt);
    res.json({ result: result.trim() });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Server & Vite Mounting ---

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    // Mount Vite dev server middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static asset serving
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Daily Task Manager Backend] Server booted successfully on port ${PORT}`);
  });
}

startServer();
