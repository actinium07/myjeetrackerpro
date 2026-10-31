import React, { useState, useEffect, useMemo, useRef } from 'react';
import { CBTQuestion, Subject, SectionType, QuestionStatus, UserQuestionState, TestSessionResult, ExamTarget } from '../types';
import { Clock, CheckCircle2, Bookmark, RotateCcw, AlertCircle, ChevronLeft, ChevronRight, BarChart3, User, Send, Check, X, ShieldAlert, Sparkles, BookOpen } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CBTTestPlayerProps {
  exam: ExamTarget;
  questions: CBTQuestion[];
  onOpenPrepAIWithQuestion: (q: CBTQuestion) => void;
  onExitTest: () => void;
}

export const CBTTestPlayer: React.FC<CBTTestPlayerProps> = ({
  exam,
  questions,
  onOpenPrepAIWithQuestion,
  onExitTest,
}) => {
  const [activeSubject, setActiveSubject] = useState<Subject>('Physics');
  const [activeSection, setActiveSection] = useState<SectionType>('SECTION_A_MCQ');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(exam.durationMinutes * 60);
  const [userStates, setUserStates] = useState<Record<string, UserQuestionState>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<TestSessionResult | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [showPaletteMobile, setShowPaletteMobile] = useState<boolean>(false);

  const STORAGE_KEY = `jee_cbt_session_${exam.id}`;

  // Filter questions for active subject and section
  const currentSubjectQuestions = useMemo(() => {
    return questions.filter((q) => q.subject === activeSubject && q.section === activeSection);
  }, [questions, activeSubject, activeSection]);

  const activeQuestion: CBTQuestion | undefined = currentSubjectQuestions[currentIndex];

  // Initialize or restore session from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.userStates && parsed.timeRemainingSeconds > 0) {
          setUserStates(parsed.userStates);
          setTimeRemainingSeconds(parsed.timeRemainingSeconds);
          return;
        }
      } catch (e) {
        console.error('Failed to parse saved CBT state:', e);
      }
    }

    // Default initialization
    const initialStates: Record<string, UserQuestionState> = {};
    questions.forEach((q, idx) => {
      initialStates[q.id] = {
        status: idx === 0 ? 'NOT_ANSWERED' : 'NOT_VISITED',
        selectedOption: undefined,
        numericalAnswer: '',
        timeSpentSeconds: 0,
        isMarkedForReview: false,
        visited: idx === 0,
      };
    });
    setUserStates(initialStates);
    setTimeRemainingSeconds(exam.durationMinutes * 60);
  }, [exam.id, questions]);

  // Auto-save timer and state
  useEffect(() => {
    if (isSubmitted) return;

    const timer = setInterval(() => {
      setTimeRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });

      // Increment time spent on current question
      if (activeQuestion) {
        setUserStates((prev) => {
          const current = prev[activeQuestion.id];
          if (!current) return prev;
          return {
            ...prev,
            [activeQuestion.id]: {
              ...current,
              timeSpentSeconds: (current.timeSpentSeconds || 0) + 1,
            },
          };
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isSubmitted, activeQuestion]);

  // Persist to localStorage periodically
  useEffect(() => {
    if (isSubmitted || Object.keys(userStates).length === 0) return;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        userStates,
        timeRemainingSeconds,
      })
    );
  }, [userStates, timeRemainingSeconds, isSubmitted]);

  // Mark visited when navigating
  const visitQuestion = (qId: string) => {
    setUserStates((prev) => {
      const existing = prev[qId];
      if (!existing) return prev;
      if (existing.status === 'NOT_VISITED') {
        return {
          ...prev,
          [qId]: { ...existing, status: 'NOT_ANSWERED', visited: true },
        };
      }
      return { ...prev, [qId]: { ...existing, visited: true } };
    });
  };

  const handleSelectQuestion = (index: number) => {
    setCurrentIndex(index);
    const targetQ = currentSubjectQuestions[index];
    if (targetQ) {
      visitQuestion(targetQ.id);
    }
  };

  // Option selection
  const handleSelectOption = (key: string) => {
    if (!activeQuestion) return;
    setUserStates((prev) => ({
      ...prev,
      [activeQuestion.id]: {
        ...prev[activeQuestion.id],
        selectedOption: key,
      },
    }));
  };

  // Virtual Keypad / Numerical input
  const handleNumericalInput = (char: string) => {
    if (!activeQuestion) return;
    setUserStates((prev) => {
      const current = prev[activeQuestion.id]?.numericalAnswer || '';
      let next = current;
      if (char === 'CLEAR') {
        next = '';
      } else if (char === 'BACKSPACE') {
        next = current.slice(0, -1);
      } else if (char === '.') {
        if (!current.includes('.')) next = current + '.';
      } else if (char === '-') {
        if (current === '') next = '-';
      } else {
        if (current.length < 8) next = current + char;
      }
      return {
        ...prev,
        [activeQuestion.id]: {
          ...prev[activeQuestion.id],
          numericalAnswer: next,
        },
      };
    });
  };

  // Actions
  const handleSaveAndNext = () => {
    if (!activeQuestion) return;
    const current = userStates[activeQuestion.id];
    const hasAnswer =
      activeQuestion.section === 'SECTION_A_MCQ'
        ? !!current?.selectedOption
        : !!current?.numericalAnswer && current.numericalAnswer.trim() !== '';

    const newStatus: QuestionStatus = hasAnswer ? 'ANSWERED' : 'NOT_ANSWERED';

    setUserStates((prev) => ({
      ...prev,
      [activeQuestion.id]: {
        ...prev[activeQuestion.id],
        status: newStatus,
        isMarkedForReview: false,
      },
    }));

    // Move to next question
    if (currentIndex < currentSubjectQuestions.length - 1) {
      handleSelectQuestion(currentIndex + 1);
    }
  };

  const handleMarkForReviewAndNext = () => {
    if (!activeQuestion) return;
    const current = userStates[activeQuestion.id];
    const hasAnswer =
      activeQuestion.section === 'SECTION_A_MCQ'
        ? !!current?.selectedOption
        : !!current?.numericalAnswer && current.numericalAnswer.trim() !== '';

    const newStatus: QuestionStatus = hasAnswer
      ? 'ANSWERED_AND_MARKED'
      : 'MARKED_FOR_REVIEW';

    setUserStates((prev) => ({
      ...prev,
      [activeQuestion.id]: {
        ...prev[activeQuestion.id],
        status: newStatus,
        isMarkedForReview: true,
      },
    }));

    if (currentIndex < currentSubjectQuestions.length - 1) {
      handleSelectQuestion(currentIndex + 1);
    }
  };

  const handleClearResponse = () => {
    if (!activeQuestion) return;
    setUserStates((prev) => ({
      ...prev,
      [activeQuestion.id]: {
        ...prev[activeQuestion.id],
        selectedOption: undefined,
        numericalAnswer: '',
        status: 'NOT_ANSWERED',
        isMarkedForReview: false,
      },
    }));
  };

  // Submit test and compute NTA score, accuracy, negative marks, and estimated AIR
  const handleSubmitTest = () => {
    setShowSubmitModal(false);
    setIsSubmitted(true);
    localStorage.removeItem(STORAGE_KEY);

    let totalScore = 0;
    let attempted = 0;
    let correct = 0;
    let incorrect = 0;
    let negativeMarksLost = 0;

    const subjects: Subject[] = ['Physics', 'Chemistry', 'Mathematics'];
    const subjectBreakdown = {
      Physics: { score: 0, maxScore: 0, correct: 0, incorrect: 0, timeSpentSeconds: 0, accuracy: 0 },
      Chemistry: { score: 0, maxScore: 0, correct: 0, incorrect: 0, timeSpentSeconds: 0, accuracy: 0 },
      Mathematics: { score: 0, maxScore: 0, correct: 0, incorrect: 0, timeSpentSeconds: 0, accuracy: 0 },
    };

    questions.forEach((q) => {
      const state = userStates[q.id];
      const hasAnswer =
        q.section === 'SECTION_A_MCQ'
          ? !!state?.selectedOption
          : !!state?.numericalAnswer && state.numericalAnswer.trim() !== '';

      const timeSpent = state?.timeSpentSeconds || 0;
      subjectBreakdown[q.subject].maxScore += exam.markingScheme.correct;
      subjectBreakdown[q.subject].timeSpentSeconds += timeSpent;

      if (hasAnswer) {
        attempted++;
        let isCorrect = false;

        if (q.section === 'SECTION_A_MCQ') {
          isCorrect = state.selectedOption === q.correctAnswer;
        } else {
          const userVal = parseFloat(state.numericalAnswer || 'NaN');
          const correctVal = parseFloat(q.correctAnswer);
          const tolerance = q.tolerance || 0.1;
          isCorrect = Math.abs(userVal - correctVal) <= tolerance;
        }

        if (isCorrect) {
          correct++;
          totalScore += exam.markingScheme.correct;
          subjectBreakdown[q.subject].correct++;
          subjectBreakdown[q.subject].score += exam.markingScheme.correct;
        } else {
          incorrect++;
          const penalty = Math.abs(exam.markingScheme.incorrect);
          totalScore -= penalty;
          negativeMarksLost += penalty;
          subjectBreakdown[q.subject].incorrect++;
          subjectBreakdown[q.subject].score -= penalty;
        }
      }
    });

    subjects.forEach((s) => {
      const att = subjectBreakdown[s].correct + subjectBreakdown[s].incorrect;
      subjectBreakdown[s].accuracy = att > 0 ? Math.round((subjectBreakdown[s].correct / att) * 100) : 0;
    });

    const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;

    // Approximate NTA Percentile & AIR curve for JEE Main 300 marks
    // 250+ -> 99.8% (~2500 AIR), 200+ -> 99.2% (~9000 AIR), 160+ -> 98% (~22000 AIR), 120+ -> 95% (~60000 AIR)
    let estimatedPercentile = 70.0;
    let estimatedAIR = 350000;

    if (totalScore >= 250) {
      estimatedPercentile = 99.85;
      estimatedAIR = Math.max(150, Math.round(1500 - (totalScore - 250) * 20));
    } else if (totalScore >= 200) {
      estimatedPercentile = 99.1;
      estimatedAIR = Math.round(11000 - (totalScore - 200) * 180);
    } else if (totalScore >= 160) {
      estimatedPercentile = 97.8;
      estimatedAIR = Math.round(28000 - (totalScore - 160) * 400);
    } else if (totalScore >= 120) {
      estimatedPercentile = 94.5;
      estimatedAIR = Math.round(72000 - (totalScore - 120) * 1100);
    } else if (totalScore >= 80) {
      estimatedPercentile = 88.0;
      estimatedAIR = Math.round(150000 - (totalScore - 80) * 1950);
    } else {
      estimatedPercentile = Math.max(50, Math.round(50 + (totalScore / 80) * 35));
      estimatedAIR = 400000;
    }

    const durationSpentMinutes = Math.max(1, Math.round((exam.durationMinutes * 60 - timeRemainingSeconds) / 60));

    const result: TestSessionResult = {
      testId: `session_${Date.now()}`,
      testTitle: `${exam.name} Full NTA Mock 01`,
      timestamp: new Date().toISOString(),
      durationSpentMinutes,
      totalScore,
      maxScore: questions.length * exam.markingScheme.correct,
      attempted,
      correct,
      incorrect,
      unattempted: questions.length - attempted,
      accuracy,
      negativeMarksLost,
      estimatedPercentile,
      estimatedAIR,
      subjectBreakdown,
      questionStates: userStates,
    };

    setTestResult(result);

    // Trigger celebratory confetti if score is solid!
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {
      // safe fallback
    }
  };

  // Format seconds to HH:MM:SS
  const formatTimer = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Helper for question status styling
  const getStatusBadge = (status: QuestionStatus) => {
    switch (status) {
      case 'ANSWERED':
        return 'bg-emerald-600 text-white';
      case 'NOT_ANSWERED':
        return 'bg-rose-600 text-white';
      case 'MARKED_FOR_REVIEW':
        return 'bg-purple-600 text-white';
      case 'ANSWERED_AND_MARKED':
        return 'bg-purple-600 text-white ring-2 ring-emerald-400';
      case 'NOT_VISITED':
      default:
        return 'bg-slate-700 text-slate-300';
    }
  };

  // Summary counts for palette
  const summaryCounts = useMemo(() => {
    let answered = 0;
    let notAnswered = 0;
    let notVisited = 0;
    let marked = 0;
    let markedAnswered = 0;

    questions.forEach((q) => {
      const st = userStates[q.id]?.status || 'NOT_VISITED';
      if (st === 'ANSWERED') answered++;
      else if (st === 'NOT_ANSWERED') notAnswered++;
      else if (st === 'MARKED_FOR_REVIEW') marked++;
      else if (st === 'ANSWERED_AND_MARKED') markedAnswered++;
      else notVisited++;
    });

    return { answered, notAnswered, notVisited, marked, markedAnswered };
  }, [questions, userStates]);

  // If submitted, show Analytics & Post-Submission Scorecard
  if (isSubmitted && testResult) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-fadeIn">
        {/* Scorecard Hero */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
                Official NTA CBT Mock Analytics
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
                {testResult.testTitle}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Completed in {testResult.durationSpentMinutes} mins • Calculated with updated NTA negative marking rules
              </p>
            </div>

            <button
              onClick={onExitTest}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold"
            >
              Back to Dashboard
            </button>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            {/* Score */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-center">
              <span className="text-xs text-slate-400 font-semibold block">Total Score</span>
              <span className="text-3xl sm:text-4xl font-black text-amber-400 font-mono mt-1 block">
                {testResult.totalScore}
                <span className="text-sm font-normal text-slate-500">/{testResult.maxScore}</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-bold block mt-1">
                Net Marks Obtained
              </span>
            </div>

            {/* Estimated AIR */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-center">
              <span className="text-xs text-slate-400 font-semibold block">Predicted AIR</span>
              <span className="text-3xl sm:text-4xl font-black text-purple-400 font-mono mt-1 block">
                #{testResult.estimatedAIR}
              </span>
              <span className="text-[10px] text-purple-300 font-bold block mt-1">
                {testResult.estimatedPercentile} %ile
              </span>
            </div>

            {/* Accuracy */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-center">
              <span className="text-xs text-slate-400 font-semibold block">Accuracy Rate</span>
              <span className="text-3xl sm:text-4xl font-black text-cyan-400 font-mono mt-1 block">
                {testResult.accuracy}%
              </span>
              <span className="text-[10px] text-slate-400 block mt-1">
                {testResult.correct} Correct / {testResult.attempted} Attempted
              </span>
            </div>

            {/* Negative Marks Lost */}
            <div className="bg-slate-950/80 border border-rose-900/40 rounded-2xl p-4 text-center">
              <span className="text-xs text-rose-300 font-semibold block flex items-center justify-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                Negative Penalty
              </span>
              <span className="text-3xl sm:text-4xl font-black text-rose-400 font-mono mt-1 block">
                -{testResult.negativeMarksLost}
              </span>
              <span className="text-[10px] text-rose-300/80 block mt-1">
                Marks lost to wrong guesses
              </span>
            </div>
          </div>
        </div>

        {/* Subject Breakdown Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(['Physics', 'Chemistry', 'Mathematics'] as Subject[]).map((subj) => {
            const data = testResult.subjectBreakdown[subj];
            return (
              <div key={subj} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <h3 className="font-bold text-white text-base">{subj}</h3>
                  <span className="text-sm font-mono font-bold text-cyan-400">
                    {data.score} / {data.maxScore}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                    <span className="text-emerald-400 font-bold block">{data.correct}</span>
                    <span className="text-[10px] text-slate-400">Correct</span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                    <span className="text-rose-400 font-bold block">{data.incorrect}</span>
                    <span className="text-[10px] text-slate-400">Wrong</span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                    <span className="text-cyan-400 font-bold block">{data.accuracy}%</span>
                    <span className="text-[10px] text-slate-400">Accuracy</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 flex justify-between">
                  <span>Speed:</span>
                  <span className="text-slate-200 font-medium">
                    {Math.round(data.timeSpentSeconds / (questions.filter((q) => q.subject === subj).length || 1))}s / Q
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Question-by-Question Review with PrepAI Solver */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white">Post-Exam Solution Audit</h3>
              <p className="text-xs text-slate-400">
                Review mistakes, explore step-by-step math derivations, or ask PrepAI in Hindi/Bengali/Gujarati/Assamese.
              </p>
            </div>
            <span className="text-xs font-semibold px-2 py-1 bg-purple-500/20 text-purple-300 rounded-lg flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> PrepAI Powered
            </span>
          </div>

          <div className="space-y-3">
            {questions.map((q, idx) => {
              const state = userStates[q.id];
              const isMCQ = q.section === 'SECTION_A_MCQ';
              const userAns = isMCQ ? state?.selectedOption : state?.numericalAnswer;
              const hasAttempted = !!userAns && userAns.trim() !== '';

              let isCorrect = false;
              if (hasAttempted) {
                if (isMCQ) {
                  isCorrect = userAns === q.correctAnswer;
                } else {
                  const u = parseFloat(userAns || 'NaN');
                  const c = parseFloat(q.correctAnswer);
                  isCorrect = Math.abs(u - c) <= (q.tolerance || 0.1);
                }
              }

              return (
                <div
                  key={q.id}
                  className={`p-4 rounded-xl border transition-all ${
                    !hasAttempted
                      ? 'bg-slate-950/60 border-slate-800'
                      : isCorrect
                      ? 'bg-emerald-950/20 border-emerald-800/40'
                      : 'bg-rose-950/20 border-rose-800/40'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-200">
                        Q{idx + 1}. [{q.subject} • {q.chapter}]
                      </span>
                      {hasAttempted ? (
                        isCorrect ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            +4 Marks (Correct)
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                            -1 Mark (Incorrect)
                          </span>
                        )
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                          0 Marks (Unattempted)
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => onOpenPrepAIWithQuestion(q)}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-bold transition-all w-fit"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Solve with PrepAI
                    </button>
                  </div>

                  <p className="text-xs text-slate-300 mt-2 line-clamp-2">{q.questionText}</p>

                  <div className="flex flex-wrap items-center gap-4 text-xs mt-3 pt-2 border-t border-slate-800/60">
                    <div>
                      <span className="text-slate-400">Your Answer: </span>
                      <strong className={isCorrect ? 'text-emerald-400' : hasAttempted ? 'text-rose-400' : 'text-slate-500'}>
                        {userAns || 'None'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Correct Answer: </span>
                      <strong className="text-emerald-400">{q.correctAnswer}</strong>
                    </div>
                    <div className="text-slate-400 italic text-[11px]">
                      Pitfall Trap: {q.commonTrap}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Active Test Player Interface (Authentic NTA Layout)
  return (
    <div className="max-w-7xl mx-auto space-y-4 pb-12 select-none">
      {/* Top NTA System Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-lg flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Candidate & Exam Info */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div className="text-xs">
            <div className="font-bold text-white flex items-center gap-2">
              <span>Candidate: Snehasis (2027JEE-88912)</span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-mono">
                Terminal: C-042
              </span>
            </div>
            <div className="text-slate-400 flex items-center gap-2 mt-0.5">
              <span className="text-amber-400 font-semibold">{exam.name}</span>
              <span>•</span>
              <span>Marking: +{exam.markingScheme.correct} / {exam.markingScheme.incorrect}</span>
            </div>
          </div>
        </div>

        {/* Live Timer Clock & Submit Button */}
        <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto border-t md:border-t-0 pt-2 md:pt-0 border-slate-800">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono font-bold text-sm sm:text-base ${
            timeRemainingSeconds < 600
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
              : 'bg-slate-950 text-emerald-400 border-slate-800'
          }`}>
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>Time Left: {formatTimer(timeRemainingSeconds)}</span>
          </div>

          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-md shadow-rose-600/30 transition-all flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            Submit Test
          </button>
        </div>
      </div>

      {/* Subject & Section Selector Tabs */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {(['Physics', 'Chemistry', 'Mathematics'] as Subject[]).map((subj) => {
            const count = questions.filter((q) => q.subject === subj).length;
            const answeredInSubj = questions.filter(
              (q) => q.subject === subj && userStates[q.id]?.status === 'ANSWERED'
            ).length;

            return (
              <button
                key={subj}
                onClick={() => {
                  setActiveSubject(subj);
                  setCurrentIndex(0);
                  const first = questions.find((q) => q.subject === subj && q.section === activeSection);
                  if (first) visitQuestion(first.id);
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeSubject === subj
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                }`}
              >
                <span>{subj}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeSubject === subj ? 'bg-slate-950/20 text-slate-950 font-black' : 'bg-slate-900 text-slate-400'
                }`}>
                  {answeredInSubj}/{count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Section Tabs (Section A vs Section B) */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => {
              setActiveSection('SECTION_A_MCQ');
              setCurrentIndex(0);
              const first = questions.find((q) => q.subject === activeSubject && q.section === 'SECTION_A_MCQ');
              if (first) visitQuestion(first.id);
            }}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              activeSection === 'SECTION_A_MCQ'
                ? 'bg-slate-800 text-amber-300 shadow-inner'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Section A (MCQs)
          </button>
          <button
            onClick={() => {
              setActiveSection('SECTION_B_NUMERICAL');
              setCurrentIndex(0);
              const first = questions.find((q) => q.subject === activeSubject && q.section === 'SECTION_B_NUMERICAL');
              if (first) visitQuestion(first.id);
            }}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              activeSection === 'SECTION_B_NUMERICAL'
                ? 'bg-slate-800 text-amber-300 shadow-inner'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Section B (Numerical)
          </button>
        </div>
      </div>

      {/* Main CBT Workspace: Left Question Area, Right NTA Palette */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
        {/* Left Question Box (3 Cols) */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl flex flex-col justify-between min-h-[520px]">
          {activeQuestion ? (
            <div className="p-4 sm:p-6 space-y-5">
              {/* Question Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-base sm:text-lg font-black text-white">
                    Question No. {activeQuestion.questionNumber}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {activeQuestion.chapter} ({activeQuestion.classLevel})
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold">
                  <span className="text-emerald-400">+{exam.markingScheme.correct}</span>
                  <span className="text-slate-600">/</span>
                  <span className="text-rose-400">{exam.markingScheme.incorrect}</span>
                </div>
              </div>

              {/* Question Text */}
              <div className="text-sm sm:text-base text-slate-100 leading-relaxed font-medium">
                {activeQuestion.questionText}
              </div>

              {/* SECTION A: MCQs Radio Options */}
              {activeQuestion.section === 'SECTION_A_MCQ' && activeQuestion.options && (
                <div className="space-y-2.5 pt-2">
                  {activeQuestion.options.map((opt) => {
                    const isSelected = userStates[activeQuestion.id]?.selectedOption === opt.key;
                    return (
                      <button
                        key={opt.key}
                        onClick={() => handleSelectOption(opt.key)}
                        className={`w-full text-left p-3.5 rounded-xl border flex items-center gap-3 transition-all ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-500 text-white shadow-md'
                            : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/50 hover:border-slate-700'
                        }`}
                      >
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                            isSelected
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {opt.key}
                        </span>
                        <span className="text-sm font-medium">{opt.text}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* SECTION B: Numerical Integer / Float Input with On-Screen Keypad */}
              {activeQuestion.section === 'SECTION_B_NUMERICAL' && (
                <div className="space-y-4 pt-2">
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 max-w-md">
                    <label className="text-xs text-slate-400 font-semibold block mb-1">
                      Enter Numerical Value (Integer or Decimal):
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        readOnly
                        value={userStates[activeQuestion.id]?.numericalAnswer || ''}
                        placeholder="Click keypad below"
                        className="w-full bg-slate-900 border border-cyan-500/50 rounded-lg px-3 py-2 text-xl font-mono font-bold text-white focus:outline-none"
                      />
                      <button
                        onClick={() => handleNumericalInput('CLEAR')}
                        className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  {/* Virtual NTA Calculator Keypad */}
                  <div className="max-w-xs grid grid-cols-3 gap-2">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9', '-', '0', '.'].map((key) => (
                      <button
                        key={key}
                        onClick={() => handleNumericalInput(key)}
                        className="py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-white font-mono font-bold text-base border border-slate-700 shadow-sm"
                      >
                        {key}
                      </button>
                    ))}
                    <button
                      onClick={() => handleNumericalInput('BACKSPACE')}
                      className="col-span-3 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs font-bold text-rose-300 border border-slate-700"
                    >
                      ⌫ Backspace
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400">
              No questions found for this section.
            </div>
          )}

          {/* Bottom Action Footer Bar */}
          <div className="p-4 bg-slate-950/80 border-t border-slate-800/80 rounded-b-2xl flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveAndNext}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                Save & Next
              </button>

              <button
                onClick={handleClearResponse}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition-all flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Clear Response
              </button>

              <button
                onClick={handleMarkForReviewAndNext}
                className="px-3.5 py-2 rounded-xl bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
              >
                <Bookmark className="w-3.5 h-3.5" />
                Mark for Review & Next
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={currentIndex === 0}
                onClick={() => handleSelectQuestion(currentIndex - 1)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-300 border border-slate-700"
                title="Previous"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={currentIndex >= currentSubjectQuestions.length - 1}
                onClick={() => handleSelectQuestion(currentIndex + 1)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-300 border border-slate-700"
                title="Next"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Exact NTA Question Palette & Color Legend */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="font-bold text-sm text-white">Question Palette</h3>
            <span className="text-xs text-slate-400 font-medium">{activeSubject}</span>
          </div>

          {/* NTA Color Legend */}
          <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-300">
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded bg-emerald-600 flex items-center justify-center font-bold text-white text-[9px]">
                {summaryCounts.answered}
              </span>
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded bg-rose-600 flex items-center justify-center font-bold text-white text-[9px]">
                {summaryCounts.notAnswered}
              </span>
              <span>Not Answered</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded bg-purple-600 flex items-center justify-center font-bold text-white text-[9px]">
                {summaryCounts.marked}
              </span>
              <span>Marked Review</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded bg-purple-600 ring-2 ring-emerald-400 flex items-center justify-center font-bold text-white text-[9px]">
                {summaryCounts.markedAnswered}
              </span>
              <span>Ans & Review</span>
            </div>
            <div className="flex items-center gap-1.5 col-span-2">
              <span className="w-4 h-4 rounded bg-slate-700 flex items-center justify-center font-bold text-slate-300 text-[9px]">
                {summaryCounts.notVisited}
              </span>
              <span>Not Visited</span>
            </div>
          </div>

          {/* Question Grid Buttons */}
          <div className="border-t border-slate-800 pt-3">
            <div className="text-[11px] font-semibold text-slate-400 mb-2">
              Choose a Question:
            </div>
            <div className="grid grid-cols-5 gap-2 max-h-56 overflow-y-auto pr-1">
              {currentSubjectQuestions.map((q, idx) => {
                const state = userStates[q.id];
                const status = state?.status || 'NOT_VISITED';
                const isCurrent = idx === currentIndex;

                return (
                  <button
                    key={q.id}
                    onClick={() => handleSelectQuestion(idx)}
                    className={`h-9 rounded-lg font-bold text-xs flex items-center justify-center transition-all ${getStatusBadge(
                      status
                    )} ${isCurrent ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-900 scale-105' : ''}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={() => setShowSubmitModal(true)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white font-extrabold text-xs shadow-lg transition-all"
            >
              Submit Test Paper
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Submission Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-white">Confirm Paper Submission?</h3>
              <p className="text-xs text-slate-400">
                Are you sure you want to conclude the mock examination? You still have{' '}
                <strong className="text-amber-400">{formatTimer(timeRemainingSeconds)}</strong> remaining.
              </p>
            </div>

            {/* Quick summary before submit */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Questions:</span>
                <span className="text-white font-bold">{questions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-400">Answered:</span>
                <span className="text-emerald-400 font-bold">{summaryCounts.answered + summaryCounts.markedAnswered}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-rose-400">Unanswered / Review:</span>
                <span className="text-rose-400 font-bold">{summaryCounts.notAnswered + summaryCounts.marked + summaryCounts.notVisited}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
              >
                Return to Test
              </button>
              <button
                onClick={handleSubmitTest}
                className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-lg shadow-rose-600/30"
              >
                Yes, Submit Paper
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
