import React from 'react';
import { ExamTarget, ExamId } from '../types';
import { Target, Sparkles, BookOpen, Clock, AlertTriangle, Layers, Cpu, Award } from 'lucide-react';

interface HeaderProps {
  examTargets: ExamTarget[];
  currentExam: ExamTarget;
  onSelectExam: (examId: ExamId) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  mistakeCount: number;
  onOpenAPKModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  examTargets,
  currentExam,
  onSelectExam,
  activeTab,
  setActiveTab,
  mistakeCount,
  onOpenAPKModal,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100">
      {/* Top Banner - Mobile & Desktop */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-600 flex items-center justify-center shadow-lg shadow-orange-500/20 font-black text-white text-lg tracking-wider border border-white/20">
            JEE
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-amber-300 via-white to-orange-300 bg-clip-text text-transparent">
                TrackPrep & AI Solver
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                2027 Ed.
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              NTA CBT Engine • 5-Language PrepAI • 10-Yr PYQ Vault
            </p>
          </div>
        </div>

        {/* Dynamic Exam Selector Dropdown & Mobile APK Actions */}
        <div className="flex items-center gap-2">
          {/* Universal Mobile APK / iOS Installer Button */}
          <button
            onClick={onOpenAPKModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black shadow-md shadow-emerald-600/25 transition-all transform active:scale-95 border border-emerald-400/30"
          >
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span>Install APK / App</span>
          </button>

          <div className="relative">
            <div className="flex items-center gap-1.5 bg-slate-800/90 border border-amber-500/40 rounded-xl px-2.5 py-1.5 shadow-inner">
              <Target className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
              <div className="text-left">
                <div className="text-[9px] uppercase tracking-wider text-amber-300 font-semibold leading-none">
                  Active Target
                </div>
                <select
                  value={currentExam.id}
                  onChange={(e) => onSelectExam(e.target.value as ExamId)}
                  className="bg-transparent text-xs sm:text-sm font-bold text-white focus:outline-none cursor-pointer pr-4 appearance-none"
                >
                  {examTargets.map((t) => (
                    <option key={t.id} value={t.id} className="bg-slate-900 text-white py-1">
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Aspirant badge */}
          <div className="hidden lg:flex items-center gap-2 bg-slate-800/50 border border-slate-700/60 rounded-xl px-3 py-1.5 text-xs text-slate-300">
            <Award className="w-4 h-4 text-yellow-400" />
            <span>Target: <strong className="text-white">IIT Bombay CSE</strong></span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="max-w-7xl mx-auto px-2 sm:px-6 flex overflow-x-auto scrollbar-none border-t border-slate-800/80">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-semibold whitespace-nowrap transition-all border-b-2 ${
            activeTab === 'dashboard'
              ? 'border-amber-400 text-amber-300 bg-amber-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Home & Countdown</span>
        </button>

        <button
          onClick={() => setActiveTab('cbt-test')}
          className={`flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-semibold whitespace-nowrap transition-all border-b-2 ${
            activeTab === 'cbt-test'
              ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
          }`}
        >
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>NTA CBT Test</span>
          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300">
            Live Simulator
          </span>
        </button>

        <button
          onClick={() => setActiveTab('prep-ai')}
          className={`flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-semibold whitespace-nowrap transition-all border-b-2 ${
            activeTab === 'prep-ai'
              ? 'border-purple-400 text-purple-300 bg-purple-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
          }`}
        >
          <Sparkles className="w-4 h-4 text-purple-400 animate-spin-slow" />
          <span>PrepAI Doubt Solver</span>
          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300">
            5 Languages
          </span>
        </button>

        <button
          onClick={() => setActiveTab('pyq-vault')}
          className={`flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-semibold whitespace-nowrap transition-all border-b-2 ${
            activeTab === 'pyq-vault'
              ? 'border-emerald-400 text-emerald-300 bg-emerald-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
          }`}
        >
          <BookOpen className="w-4 h-4 text-emerald-400" />
          <span>PYQ & 2027 Vault</span>
          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300">
            2017-2027
          </span>
        </button>

        <button
          onClick={() => setActiveTab('mistake-book')}
          className={`flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-semibold whitespace-nowrap transition-all border-b-2 ${
            activeTab === 'mistake-book'
              ? 'border-rose-400 text-rose-300 bg-rose-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          <span>Mistake Book</span>
          {mistakeCount > 0 && (
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-rose-500/30 text-rose-300">
              {mistakeCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('blueprint')}
          className={`flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-semibold whitespace-nowrap transition-all border-b-2 ${
            activeTab === 'blueprint'
              ? 'border-blue-400 text-blue-300 bg-blue-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
          }`}
        >
          <Cpu className="w-4 h-4 text-blue-400" />
          <span>Architecture & DDL</span>
        </button>
      </div>
    </header>
  );
};
