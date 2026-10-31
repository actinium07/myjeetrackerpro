import React, { useState } from 'react';
import { MistakeBookItem, Subject } from '../types';
import { AlertTriangle, BookMarked, Trash2, Sparkles, Filter, CheckCircle, Tag, RotateCw } from 'lucide-react';

interface MistakeBookViewProps {
  mistakes: MistakeBookItem[];
  onRemoveMistake: (id: string) => void;
  onSolveWithAI: (text: string) => void;
}

export const MistakeBookView: React.FC<MistakeBookViewProps> = ({
  mistakes,
  onRemoveMistake,
  onSolveWithAI,
}) => {
  const [filterSubject, setFilterSubject] = useState<Subject | 'All'>('All');
  const [filterReason, setFilterReason] = useState<string>('All');

  const filtered = mistakes.filter((m) => {
    const matchSubj = filterSubject === 'All' || m.subject === filterSubject;
    const matchReason = filterReason === 'All' || m.mistakeReason === filterReason;
    return matchSubj && matchReason;
  });

  const categoryCounts = mistakes.reduce((acc, curr) => {
    acc[curr.mistakeReason] = (acc[curr.mistakeReason] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
                <AlertTriangle className="w-5 h-5" />
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Personal JEE Mistake Book
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Spaced repetition log of traps fallen into during NTA Mock Tests & PrepAI problem-solving sessions.
            </p>
          </div>

          <div className="px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-300">
            Total Logged Errors: <strong className="text-rose-400">{mistakes.length}</strong>
          </div>
        </div>

        {/* Category Breakdown Chips */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-wrap gap-2 text-xs">
          {['Conceptual Error', 'Calculation Slip', 'Question Misread', 'Time Pressure'].map((cat) => (
            <div
              key={cat}
              className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-2 text-slate-300"
            >
              <Tag className="w-3.5 h-3.5 text-amber-400" />
              <span>{cat}:</span>
              <strong className="text-white">{categoryCounts[cat] || 0}</strong>
            </div>
          ))}
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 p-3 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {(['All', 'Physics', 'Chemistry', 'Mathematics'] as const).map((sub) => (
            <button
              key={sub}
              onClick={() => setFilterSubject(sub)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                filterSubject === sub
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-400 flex items-center gap-2">
          <span>Filter by Reason:</span>
          <select
            value={filterReason}
            onChange={(e) => setFilterReason(e.target.value)}
            className="bg-slate-950 text-white font-bold p-1 rounded-lg border border-slate-800 focus:outline-none"
          >
            <option value="All">All Error Types</option>
            <option value="Conceptual Error">Conceptual Error</option>
            <option value="Calculation Slip">Calculation Slip</option>
            <option value="Question Misread">Question Misread</option>
            <option value="Time Pressure">Time Pressure</option>
          </select>
        </div>
      </div>

      {/* Mistake Items Grid */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-2">
            <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
            <p className="font-bold text-white text-base">Mistake Book Clear!</p>
            <p className="text-xs">
              Take CBT Mock Tests or solve doubts in PrepAI to tag and review your tricky problem traps.
            </p>
          </div>
        ) : (
          filtered.map((m) => (
            <div
              key={m.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    {m.mistakeReason}
                  </span>
                  <span className="text-sm font-bold text-white">
                    [{m.subject} • {m.chapter}]
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSolveWithAI(m.questionText)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-bold transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Re-solve with AI</span>
                  </button>

                  <button
                    onClick={() => onRemoveMistake(m.id)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/30 text-slate-400 hover:text-rose-400 transition-all"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
                {m.questionText}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-400">My Mistake: </span>
                  <span className="text-rose-400 font-semibold">{m.userWrongAnswer}</span>
                </div>
                <div>
                  <span className="text-slate-400">Correct Value: </span>
                  <span className="text-emerald-400 font-bold">{m.correctAnswer}</span>
                </div>
                <div className="sm:col-span-2 text-amber-300/90 italic">
                  <strong>Key Takeaway:</strong> {m.keyTakeaway}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
