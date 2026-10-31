import React, { useState, useMemo } from 'react';
import { CBTQuestion, Subject, IndianLanguage } from '../types';
import { BookOpen, Calendar, Filter, Sparkles, Zap, ChevronDown, CheckCircle2, AlertTriangle, Layers, Globe } from 'lucide-react';

interface PYQSampleVaultProps {
  questions: CBTQuestion[];
  onLaunchExamMode: (filteredQuestions: CBTQuestion[]) => void;
  onOpenPrepAIWithQuestion: (q: CBTQuestion) => void;
}

export const PYQSampleVault: React.FC<PYQSampleVaultProps> = ({
  questions,
  onLaunchExamMode,
  onOpenPrepAIWithQuestion,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<Subject | 'All'>('All');
  const [selectedYear, setSelectedYear] = useState<number | 'All'>(2026);
  const [mode, setMode] = useState<'PRACTICE' | 'EXAM'>('PRACTICE');
  const [selectedLang, setSelectedLang] = useState<IndianLanguage>('en');
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);

  const availableYears = [2027, 2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017];

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchSubj = selectedSubject === 'All' || q.subject === selectedSubject;
      const matchYear = selectedYear === 'All' || q.year === selectedYear;
      return matchSubj && matchYear;
    });
  }, [questions, selectedSubject, selectedYear]);

  const toggleExpand = (id: string) => {
    setExpandedQuestionId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                <BookOpen className="w-5 h-5" />
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                PYQ Bank & 2027 Sample Paper Vault
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Last 10 Years Real Shift Papers (2017–2026) + Predicted 2027 NTA Curriculum Papers with Multilingual Solutions.
            </p>
          </div>

          {/* Practice Mode vs Exam Mode Toggle */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 shrink-0">
            <button
              onClick={() => setMode('PRACTICE')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                mode === 'PRACTICE'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Practice Mode (Instant Solutions)</span>
            </button>
            <button
              onClick={() => {
                setMode('EXAM');
                if (filteredQuestions.length > 0) {
                  onLaunchExamMode(filteredQuestions);
                }
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                mode === 'EXAM'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Exam Mode (Timed CBT)</span>
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Subject Filter */}
            <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
              {(['All', 'Physics', 'Chemistry', 'Mathematics'] as const).map((sub) => (
                <button
                  key={sub}
                  onClick={() => setSelectedSubject(sub)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    selectedSubject === sub
                      ? 'bg-slate-800 text-amber-300'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>

            {/* Year Selector */}
            <div className="flex items-center gap-1.5 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-400 font-semibold">Year/Shift:</span>
              <select
                value={selectedYear}
                onChange={(e) =>
                  setSelectedYear(e.target.value === 'All' ? 'All' : parseInt(e.target.value))
                }
                className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
              >
                <option value="All" className="bg-slate-900">All Shifts</option>
                {availableYears.map((yr) => (
                  <option key={yr} value={yr} className="bg-slate-900">
                    {yr === 2027 ? '2027 (Predicted Sample)' : `${yr} PYQ Shift`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Solution Language Filter for Practice Mode */}
          {mode === 'PRACTICE' && (
            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <Globe className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-slate-400 font-medium">Explain In:</span>
              <div className="flex gap-1">
                {[
                  { code: 'en', label: 'EN' },
                  { code: 'hi', label: 'हिंदी' },
                  { code: 'bn', label: 'বাংলা' },
                  { code: 'gu', label: 'ગુજ' },
                  { code: 'as', label: 'অসমীয়া' },
                ].map((l) => (
                  <button
                    key={l.code}
                    onClick={() => setSelectedLang(l.code as IndianLanguage)}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                      selectedLang === l.code
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Questions Listing */}
      <div className="space-y-4">
        {filteredQuestions.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
            No questions matching the selected filter criteria.
          </div>
        ) : (
          filteredQuestions.map((q, idx) => {
            const isExpanded = expandedQuestionId === q.id;

            return (
              <div
                key={q.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 transition-all"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-white">
                      {idx + 1}
                    </span>
                    <span className="font-extrabold text-sm text-white">
                      [{q.subject} • {q.chapter}]
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                      {q.year ? `${q.year} (${q.shift})` : 'JEE 2027 Predicted'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {q.section === 'SECTION_A_MCQ' ? 'Section-A MCQ' : 'Section-B Numerical'}
                    </span>
                    <button
                      onClick={() => onOpenPrepAIWithQuestion(q)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-bold transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>PrepAI Solver</span>
                    </button>
                  </div>
                </div>

                {/* Question Statement */}
                <p className="text-sm text-slate-200 leading-relaxed font-medium">
                  {q.questionText}
                </p>

                {/* MCQ Options (if Section A) */}
                {q.section === 'SECTION_A_MCQ' && q.options && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {q.options.map((opt) => (
                      <div
                        key={opt.key}
                        className={`p-2.5 rounded-xl border text-xs flex items-center gap-2.5 ${
                          isExpanded && opt.key === q.correctAnswer
                            ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 font-bold'
                            : 'bg-slate-950/60 border-slate-800/80 text-slate-300'
                        }`}
                      >
                        <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-black shrink-0">
                          {opt.key}
                        </span>
                        <span>{opt.text}</span>
                        {isExpanded && opt.key === q.correctAnswer && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 ml-auto shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Practice Mode Toggle Solution Button */}
                {mode === 'PRACTICE' && (
                  <div className="pt-2">
                    <button
                      onClick={() => toggleExpand(q.id)}
                      className="flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300 transition-all"
                    >
                      <span>{isExpanded ? 'Hide Step-by-Step Solution' : 'View Step-by-Step Solution & Pitfalls'}</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Expanded Solution Box */}
                    {isExpanded && (
                      <div className="mt-3 p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 animate-fadeIn">
                        <div className="flex items-center justify-between">
                          <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-400">
                            Verified Correct Answer: {q.correctAnswer}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            Difficulty: <strong className="text-slate-200">{q.difficulty}</strong>
                          </span>
                        </div>

                        {/* Derivation Steps */}
                        <div className="space-y-1.5 text-xs text-slate-300">
                          {q.solutionSteps.map((st, i) => (
                            <div key={i} className="leading-relaxed">
                              • {st}
                            </div>
                          ))}
                        </div>

                        {/* Multilingual Explanation Note */}
                        <div className="p-2.5 rounded-lg bg-purple-950/30 border border-purple-500/30 text-xs text-purple-200 leading-relaxed">
                          <strong>Explanation ({selectedLang.toUpperCase()}): </strong>
                          {q.explanation[selectedLang] || q.explanation.en}
                        </div>

                        {/* Common Trap */}
                        <div className="flex items-center gap-1.5 text-xs text-rose-300/90 bg-rose-950/20 p-2 rounded-lg border border-rose-900/40">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          <span><strong>Exam Trap:</strong> {q.commonTrap}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
