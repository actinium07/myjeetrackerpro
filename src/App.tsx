import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { CountdownHero } from './components/CountdownHero';
import { CBTTestPlayer } from './components/CBTTestPlayer';
import { PrepAISolver } from './components/PrepAISolver';
import { PYQSampleVault } from './components/PYQSampleVault';
import { MistakeBookView } from './components/MistakeBookView';
import { ArchitectureModal } from './components/ArchitectureModal';
import { MobileAPKModal } from './components/MobileAPKModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { EXAM_TARGETS } from './data/mockExams';
import { QUESTION_BANK } from './data/pyqQuestions';
import { ExamTarget, ExamId, CBTQuestion, MistakeBookItem } from './types';

const INITIAL_MISTAKES: MistakeBookItem[] = [
  {
    id: 'm1',
    title: 'Potentiometer Wire Balance',
    subject: 'Physics',
    chapter: 'Current Electricity',
    questionText: 'A potentiometer wire of length 10 m and resistance 20 Ω is connected in series with a 10 V battery and a 30 Ω resistance box. Balancing length for cell E is 400 cm.',
    userWrongAnswer: '0.8 V (Option D)',
    correctAnswer: '1.6 V (Option B)',
    mistakeReason: 'Formula Recall',
    keyTakeaway: 'Always remember: Potential gradient k = (I_wire * R_wire) / L. Did not account for series resistance in calculating total current.',
    addedAt: '2026-10-28T14:30:00Z',
  },
  {
    id: 'm2',
    title: 'Cobalt Coordination Spin State',
    subject: 'Chemistry',
    chapter: 'Coordination Compounds',
    questionText: 'According to Crystal Field Theory, spin-only magnetic moment of [CoF6]3- in Bohr Magnetons is closest to:',
    userWrongAnswer: '0 BM (Option A)',
    correctAnswer: '4.90 BM (Option B)',
    mistakeReason: 'Conceptual Error',
    keyTakeaway: 'Fluoride is a WEAK field halide ligand! [CoF6]3- is high spin with 4 unpaired electrons, NOT low-spin diamagnetic.',
    addedAt: '2026-10-29T18:15:00Z',
  },
];

export default function App() {
  const [selectedExamId, setSelectedExamId] = useState<ExamId>('jee-main-2027-s1');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [activeAIQuestion, setActiveAIQuestion] = useState<CBTQuestion | null>(null);
  const [activeExamQuestions, setActiveExamQuestions] = useState<CBTQuestion[]>(QUESTION_BANK);
  const [isAPKModalOpen, setIsAPKModalOpen] = useState<boolean>(false);
  const [mistakes, setMistakes] = useState<MistakeBookItem[]>(() => {
    const saved = localStorage.getItem('jee_mistake_book');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_MISTAKES;
      }
    }
    return INITIAL_MISTAKES;
  });

  // Save mistakes to localStorage
  useEffect(() => {
    localStorage.setItem('jee_mistake_book', JSON.stringify(mistakes));
  }, [mistakes]);

  const currentExam = EXAM_TARGETS.find((e) => e.id === selectedExamId) || EXAM_TARGETS[0];

  const handleSelectExam = (id: ExamId) => {
    setSelectedExamId(id);
  };

  const handleOpenPrepAIWithQuestion = (q: CBTQuestion) => {
    setActiveAIQuestion(q);
    setActiveTab('prep-ai');
  };

  const handleLaunchExamMode = (customQuestions?: CBTQuestion[]) => {
    if (customQuestions && customQuestions.length > 0) {
      setActiveExamQuestions(customQuestions);
    } else {
      setActiveExamQuestions(QUESTION_BANK);
    }
    setActiveTab('cbt-test');
  };

  const handleAddMistake = (newItem: MistakeBookItem) => {
    setMistakes((prev) => [newItem, ...prev.filter((m) => m.id !== newItem.id)]);
  };

  const handleRemoveMistake = (id: string) => {
    setMistakes((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSolveMistakeWithAI = (text: string) => {
    setActiveAIQuestion({
      id: 'custom_mistake',
      subject: 'Physics',
      section: 'SECTION_A_MCQ',
      questionNumber: 1,
      chapter: 'Revision Doubt',
      classLevel: 'Class 12',
      questionText: text,
      correctAnswer: '',
      solutionSteps: [],
      explanation: { en: '' },
      commonTrap: '',
      difficulty: 'Moderate',
    });
    setActiveTab('prep-ai');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        examTargets={EXAM_TARGETS}
        currentExam={currentExam}
        onSelectExam={handleSelectExam}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mistakeCount={mistakes.length}
        onOpenAPKModal={() => setIsAPKModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6">
        {activeTab === 'dashboard' && (
          <CountdownHero
            exam={currentExam}
            allExams={EXAM_TARGETS}
            onSelectExam={handleSelectExam}
            onLaunchCBT={() => handleLaunchExamMode()}
            onOpenAI={() => setActiveTab('prep-ai')}
            onOpenPYQ={() => setActiveTab('pyq-vault')}
            onOpenAPK={() => setIsAPKModalOpen(true)}
          />
        )}

        {activeTab === 'cbt-test' && (
          <CBTTestPlayer
            exam={currentExam}
            questions={activeExamQuestions}
            onOpenPrepAIWithQuestion={handleOpenPrepAIWithQuestion}
            onExitTest={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'prep-ai' && (
          <PrepAISolver
            initialQuestion={activeAIQuestion}
            onAddToMistakeBook={handleAddMistake}
            targetExamName={currentExam.name}
          />
        )}

        {activeTab === 'pyq-vault' && (
          <PYQSampleVault
            questions={QUESTION_BANK}
            onLaunchExamMode={handleLaunchExamMode}
            onOpenPrepAIWithQuestion={handleOpenPrepAIWithQuestion}
          />
        )}

        {activeTab === 'mistake-book' && (
          <MistakeBookView
            mistakes={mistakes}
            onRemoveMistake={handleRemoveMistake}
            onSolveWithAI={handleSolveMistakeWithAI}
          />
        )}

        {activeTab === 'blueprint' && <ArchitectureModal />}
      </main>

      {/* Universal Mobile APK / iOS Installer Modal */}
      <MobileAPKModal
        isOpen={isAPKModalOpen}
        onClose={() => setIsAPKModalOpen(false)}
      />

      {/* Offline Connectivity Notification */}
      <OfflineIndicator />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            JEE 2027 TrackPrep & AI Solver • Official NTA CBT Simulation Standard
          </span>
          <span className="text-[11px] text-slate-600">
            Android APK (WebAPK) & iOS IPA Universal Ready • Multilingual (EN, HI, BN, GU, AS)
          </span>
        </div>
      </footer>
    </div>
  );
}
