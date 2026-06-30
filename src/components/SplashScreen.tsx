/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { CheckSquare } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 2500; // 2.5 seconds
    const intervalTime = 50;
    const step = 100 / (duration / intervalTime);

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onFinish, 200);
          return 100;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [onFinish]);

  return (
    <div id="splash-screen" className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center text-white z-50 overflow-hidden">
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div className="relative z-10 flex flex-col items-center max-w-md px-6 text-center">
        {/* Animated App Logo Wrapper */}
        <div className="mb-6 p-5 bg-gradient-to-tr from-indigo-600 to-emerald-500 rounded-3xl shadow-2xl shadow-indigo-500/20 animate-bounce">
          <CheckSquare className="w-16 h-16 text-white" />
        </div>

        {/* App Title in Arabic */}
        <h1 className="text-4xl font-extrabold tracking-tight mb-3 text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300 font-sans">
          منظم المهام اليومية
        </h1>

        <p className="text-indigo-200/80 font-medium text-lg mb-10 font-sans tracking-wide">
          "ابدأ يومك بتنظيم أفضل."
        </p>

        {/* Loading Bar Container */}
        <div className="w-64 h-2 bg-slate-900 rounded-full overflow-hidden p-[1px] border border-slate-800/80">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 rounded-full transition-all duration-75 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Subtitle footer */}
        <div className="mt-8 text-xs text-slate-500 font-mono tracking-widest uppercase">
          Daily Task Manager v1.0
        </div>
      </div>
    </div>
  );
}
