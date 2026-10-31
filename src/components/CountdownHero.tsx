import React, { useState, useEffect } from 'react';
import { ExamTarget, ExamId } from '../types';
import { Clock, Flame, Calendar, Award, CheckCircle2, ChevronRight, Zap, Target, BookMarked, Activity } from 'lucide-react';

interface CountdownHeroProps {
  exam: ExamTarget;
  allExams: ExamTarget[];
  onSelectExam: (examId: ExamId) => void;
  onLaunchCBT: () => void;
  onOpenAI: () => void;
  onOpenPYQ: () => void;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

export const CountdownHero: React.FC<CountdownHeroProps> = ({
  exam,
  allExams,
  onSelectExam,
  onLaunchCBT,
  onOpenAI,
  onOpenPYQ,
}) => {
  const [timeLeft, setTimeLeft] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPast: false,
  });

  useEffect(() => {
    const calculateTime = () => {
      const targetTime = new Date(exam.targetDate).getTime();
      const now = new Date().getTime();
      const difference = targetTime - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isPast: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [exam.targetDate]);

  const targetDateFormatted = new Date(exam.targetDate).toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Hero Countdown Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/80 border border-slate-800 shadow-2xl p-5 sm:p-8">
        {/* Ambient glow backgrounds */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left Title & Status */}
          <div className="space-y-3 max-w-xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                Target Exam Countdown
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase ${
                exam.urgencyLevel === 'Critical'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : exam.urgencyLevel === 'Intense'
                  ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                {exam.urgencyLevel} Priority
              </span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                {exam.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-500" />
                Scheduled: <span className="text-slate-200 font-medium">{targetDateFormatted}</span>
                <span className="text-slate-600">•</span>
                <span className="text-amber-400/90 font-medium">{exam.conductingBody}</span>
              </p>
            </div>

            {/* Quick exam chips switcher */}
            <div className="pt-2">
              <div className="text-[11px] font-medium text-slate-400 mb-2 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-amber-400" />
                Switch Target Goal:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {allExams.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => onSelectExam(t.id)}
                    className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-all ${
                      t.id === exam.id
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                    }`}
                  >
                    {t.name.replace(' 2027', '')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Real-time Live Countdown Cards */}
          <div className="grid grid-cols-4 gap-2 sm:gap-3 shrink-0">
            {/* Days */}
            <div className="flex flex-col items-center justify-center bg-slate-950/90 border border-amber-500/30 rounded-2xl p-3 sm:p-5 shadow-lg min-w-[70px] sm:min-w-[90px]">
              <span className="text-2xl sm:text-4xl font-black text-amber-400 font-mono tracking-tight">
                {String(timeLeft.days).padStart(2, '0')}
              </span>
              <span className="text-[10px] sm:text-xs uppercase font-bold text-slate-400 mt-1 tracking-wider">
                Days
              </span>
            </div>

            {/* Hours */}
            <div className="flex flex-col items-center justify-center bg-slate-950/90 border border-slate-800 rounded-2xl p-3 sm:p-5 shadow-lg min-w-[70px] sm:min-w-[90px]">
              <span className="text-2xl sm:text-4xl font-black text-white font-mono tracking-tight">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="text-[10px] sm:text-xs uppercase font-bold text-slate-400 mt-1 tracking-wider">
                Hours
              </span>
            </div>

            {/* Minutes */}
            <div className="flex flex-col items-center justify-center bg-slate-950/90 border border-slate-800 rounded-2xl p-3 sm:p-5 shadow-lg min-w-[70px] sm:min-w-[90px]">
              <span className="text-2xl sm:text-4xl font-black text-white font-mono tracking-tight">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="text-[10px] sm:text-xs uppercase font-bold text-slate-400 mt-1 tracking-wider">
                Mins
              </span>
            </div>

            {/* Seconds (Animated) */}
            <div className="flex flex-col items-center justify-center bg-slate-950/90 border border-orange-500/40 rounded-2xl p-3 sm:p-5 shadow-lg min-w-[70px] sm:min-w-[90px] relative overflow-hidden">
              <div className="absolute inset-0 bg-orange-500/5 animate-pulse" />
              <span className="text-2xl sm:text-4xl font-black text-orange-400 font-mono tracking-tight relative z-10">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <span className="text-[10px] sm:text-xs uppercase font-bold text-orange-300/80 mt-1 tracking-wider relative z-10">
                Secs
              </span>
            </div>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onLaunchCBT}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-sm shadow-lg shadow-orange-500/25 transition-all transform active:scale-95"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              Start Full NTA CBT Mock Test
            </button>

            <button
              onClick={onOpenAI}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/40 text-purple-200 border border-purple-500/40 font-bold text-sm transition-all"
            >
              <Activity className="w-4 h-4 text-purple-400" />
              Ask PrepAI Solver (5 Langs)
            </button>

            <button
              onClick={onOpenPYQ}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-sm transition-all"
            >
              <BookMarked className="w-4 h-4 text-emerald-400" />
              Solve 2027 Sample Papers
            </button>
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>NTA Marking: <strong>+{exam.markingScheme.correct} / {exam.markingScheme.incorrect}</strong></span>
          </div>
        </div>
      </div>

      {/* Target Adjuster Section: Dynamic Recalculated Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Syllabus Progress Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
                <Target className="w-4 h-4" />
              </div>
              <h2 className="font-bold text-white text-base">Syllabus Completion</h2>
            </div>
            <span className="text-lg font-black text-cyan-400">
              {exam.syllabusProgress.overall}%
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {/* Physics */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">Physics (Class 11 & 12)</span>
                <span className="text-cyan-300">{exam.syllabusProgress.physics}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-cyan-500 h-full rounded-full transition-all duration-700"
                  style={{ width: `${exam.syllabusProgress.physics}%` }}
                />
              </div>
            </div>

            {/* Chemistry */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">Chemistry (Physical + Organic + Inorg)</span>
                <span className="text-emerald-300">{exam.syllabusProgress.chemistry}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-700"
                  style={{ width: `${exam.syllabusProgress.chemistry}%` }}
                />
              </div>
            </div>

            {/* Mathematics */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">Mathematics (Calculus + Algebra + Vectors)</span>
                <span className="text-amber-300">{exam.syllabusProgress.math}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-700"
                  style={{ width: `${exam.syllabusProgress.math}%` }}
                />
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 flex items-center justify-between">
            <span>Class 11 Weightage: <strong>48%</strong></span>
            <span>Class 12 Weightage: <strong>52%</strong></span>
          </div>
        </div>

        {/* High-Yield Topics Dynamic Recalculation */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-bold text-white text-base">
                  Target-Specific High-Yield Focus (Recalculated)
                </h2>
                <p className="text-xs text-slate-400">
                  Priority topics with 60%+ question representation in {exam.name}
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2 py-1 bg-amber-500/20 text-amber-300 rounded-lg">
              Updated NTA Trend
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {exam.weightageFocus.map((wf) => (
              <div
                key={wf.subject}
                className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-sm text-slate-200">{wf.subject}</span>
                  <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                    {wf.class12Weightage}% Cl-12
                  </span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-400">
                  {wf.highYieldTopics.map((topic, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-1 text-slate-300">{topic}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Reminder / Study Target Notification */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-center justify-between text-xs text-amber-200">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Daily Recommended Target:</strong> 45 Solved Questions (15P + 15C + 15M) + 1 CBT Sectional Micro-Test.
              </span>
            </div>
            <button
              onClick={onLaunchCBT}
              className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 shrink-0 ml-2"
            >
              <span>Test Now</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
