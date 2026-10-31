import React, { useState, useRef } from 'react';
import { IndianLanguage, PrepAISolution, MistakeBookItem, Subject, CBTQuestion } from '../types';
import { Sparkles, Camera, Mic, Send, BookOpen, BookmarkPlus, Copy, Check, RotateCw, Globe2, AlertTriangle, Lightbulb, Calculator, HelpCircle } from 'lucide-react';

interface PrepAISolverProps {
  initialQuestion?: CBTQuestion | null;
  onAddToMistakeBook: (item: MistakeBookItem) => void;
  targetExamName: string;
}

const LANGUAGES: { code: IndianLanguage; label: string; scriptName: string }[] = [
  { code: 'en', label: 'English', scriptName: 'Academic EN' },
  { code: 'hi', label: 'Hindi', scriptName: 'हिंदी' },
  { code: 'bn', label: 'Bengali', scriptName: 'বাংলা' },
  { code: 'gu', label: 'Gujarati', scriptName: 'ગુજરાતી' },
  { code: 'as', label: 'Assamese', scriptName: 'অসমীয়া' },
];

export const PrepAISolver: React.FC<PrepAISolverProps> = ({
  initialQuestion,
  onAddToMistakeBook,
  targetExamName,
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState<IndianLanguage>('en');
  const [promptText, setPromptText] = useState<string>(
    initialQuestion
      ? `${initialQuestion.questionText}\n[Subject: ${initialQuestion.subject}, Chapter: ${initialQuestion.chapter}]`
      : ''
  );
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isRecordingVoice, setIsRecordingVoice] = useState<boolean>(false);
  const [voiceQueryStatus, setVoiceQueryStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [solution, setSolution] = useState<PrepAISolution | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [addedToMistake, setAddedToMistake] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Quick preset sample questions for immediate 1-click test
  const PRESET_DOUBTS = [
    {
      title: 'Rotational Dynamics (Pure Rolling)',
      prompt: 'A solid sphere of mass M and radius R rolls without slipping down an inclined plane of inclination θ. Find the minimum static friction coefficient μ_s required to prevent slipping.',
    },
    {
      title: 'Coordination Chemistry (Crystal Field Theory)',
      prompt: 'Why is [CoF6]3- paramagnetic with 4 unpaired electrons while [Co(NH3)6]3+ is diamagnetic? Show crystal field orbital splitting and calculate spin-only magnetic moment in BM.',
    },
    {
      title: 'Definite Integration (King\'s Property)',
      prompt: 'Evaluate definite integral I = ∫[0 to π] (x sin x)/(1 + cos² x) dx. Explain step-by-step using King’s property.',
    },
  ];

  // Insert math symbols easily
  const insertSymbol = (sym: string) => {
    setPromptText((prev) => prev + sym);
  };

  // Image Upload handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Voice Query Simulator (uses Web Speech API if supported, or simulated voice transcription)
  const toggleVoiceRecording = () => {
    if (isRecordingVoice) {
      setIsRecordingVoice(false);
      setVoiceQueryStatus('');
      return;
    }

    setIsRecordingVoice(true);
    setVoiceQueryStatus('Listening... Speak your physics, chemistry, or math doubt.');

    // Check for web speech recognition
    const windowWithSpeech = window as any;
    const SpeechRecognition = windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = selectedLanguage === 'hi' ? 'hi-IN' : selectedLanguage === 'bn' ? 'bn-IN' : 'en-IN';
      recognition.interimResults = false;
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setPromptText((prev) => (prev ? prev + ' ' + transcript : transcript));
        setIsRecordingVoice(false);
        setVoiceQueryStatus('');
      };
      recognition.onerror = () => {
        setIsRecordingVoice(false);
        setVoiceQueryStatus('');
      };
      recognition.start();
    } else {
      // Gentle simulation fallback for browsers without speech API
      setTimeout(() => {
        setPromptText(
          'Find the torque about the center of mass for a disc of mass 2 kg and radius 0.5 m subjected to a tangential force of 10 N.'
        );
        setIsRecordingVoice(false);
        setVoiceQueryStatus('Transcribed: Disc torque doubt.');
      }, 2000);
    }
  };

  // Call Server-Side Gemini API
  const handleSolve = async (langOverride?: IndianLanguage) => {
    const langToUse = langOverride || selectedLanguage;
    if (!promptText && !imagePreview) {
      setErrorMessage('Please type a question or snap/upload an image.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setAddedToMistake(false);

    try {
      const response = await fetch('/api/gemini/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          imageBase64: imagePreview,
          language: langToUse,
          examContext: targetExamName,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to solve question');
      }

      setSolution(data.data);
    } catch (err: any) {
      console.error('Solve error:', err);
      setErrorMessage(err.message || 'Error communicating with PrepAI Solver.');
    } finally {
      setIsLoading(false);
    }
  };

  // Single Tap Language Switcher: instantly requests re-explanation in the new language!
  const handleLanguageSwitch = (lang: IndianLanguage) => {
    setSelectedLanguage(lang);
    if (solution || promptText || imagePreview) {
      handleSolve(lang);
    }
  };

  // Save to Personal Mistake Book
  const handleSaveMistake = () => {
    if (!solution) return;

    const item: MistakeBookItem = {
      id: `mistake_${Date.now()}`,
      title: solution.topic || 'AI Solved Doubt',
      subject: (solution.subject as Subject) || 'Physics',
      chapter: solution.topic || 'General Problem Solving',
      questionText: promptText || 'Image based question solved by PrepAI',
      userWrongAnswer: 'Misapplied principle / Exam trap',
      correctAnswer: solution.finalAnswer,
      mistakeReason: 'Conceptual Error',
      keyTakeaway: solution.commonPitfalls?.[0] || 'Focus on fundamental boundary conditions and units.',
      addedAt: new Date().toISOString(),
    };

    onAddToMistakeBook(item);
    setAddedToMistake(true);
    setTimeout(() => setAddedToMistake(false), 3000);
  };

  const copyToClipboard = () => {
    if (!solution) return;
    const text = `[PrepAI Solution - ${solution.subject} (${solution.topic})]\n\nCore Concept:\n${solution.coreConcept}\n\nDerivation:\n${solution.stepByStepDerivation.join('\n')}\n\nFinal Answer:\n${solution.finalAnswer}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                PrepAI Multilingual Doubt Solver
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Multi-modal math reasoning engine powered by Gemini. Instant step-by-step breakdown & vernacular translation.
            </p>
          </div>

          {/* Single-Tap Language Pill Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 shrink-0 overflow-x-auto scrollbar-none">
            <Globe2 className="w-4 h-4 text-purple-400 shrink-0 ml-1.5" />
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => handleLanguageSwitch(l.code)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shrink-0 ${
                  selectedLanguage === l.code
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <span>{l.scriptName}</span>
                <span className="text-[10px] font-normal opacity-80">({l.label})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input Composer: Multi-Modal (Text, Camera/Upload, Voice, Math Bar) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        {/* Quick Math Symbols Bar */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto scrollbar-none pb-1">
          <div className="flex items-center gap-1 text-[11px] text-slate-400 font-semibold shrink-0">
            <Calculator className="w-3.5 h-3.5 text-amber-400" />
            <span>Math Quick-Bar:</span>
          </div>
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
            {['∫', 'd/dx', '∑', '√', 'θ', 'α', 'β', 'λ', 'Δ', 'π', '±', '²', '³', '₁', '₂', '→', '∞', 'Ω', 'μ'].map((sym) => (
              <button
                key={sym}
                onClick={() => insertSymbol(sym)}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold transition-all border border-slate-700/60 shrink-0"
              >
                {sym}
              </button>
            ))}
          </div>
        </div>

        {/* Text Area Input */}
        <div className="relative">
          <textarea
            rows={4}
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder="Type your JEE question or doubt here... Or snap/upload a diagram or handwritten problem below."
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm sm:text-base text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-all font-sans"
          />

          {imagePreview && (
            <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-slate-900/90 border border-slate-700 rounded-xl p-1.5 shadow-lg">
              <img
                src={imagePreview}
                alt="Uploaded doubt"
                className="w-12 h-12 object-cover rounded-lg"
              />
              <button
                onClick={() => setImagePreview(null)}
                className="text-[11px] text-rose-400 hover:text-rose-300 font-bold px-1"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        {/* Media Controls & Solve Button */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
          <div className="flex items-center gap-2">
            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-all"
            >
              <Camera className="w-4 h-4 text-cyan-400" />
              <span>Snap / Upload Crop</span>
            </button>

            <button
              onClick={toggleVoiceRecording}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                isRecordingVoice
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
            >
              <Mic className="w-4 h-4 text-amber-400" />
              <span>{isRecordingVoice ? 'Listening...' : 'Voice Query'}</span>
            </button>

            {voiceQueryStatus && (
              <span className="text-xs text-amber-300 italic hidden sm:inline">
                {voiceQueryStatus}
              </span>
            )}
          </div>

          <button
            disabled={isLoading || (!promptText && !imagePreview)}
            onClick={() => handleSolve()}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-500 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-extrabold text-sm shadow-lg shadow-purple-600/30 transition-all"
          >
            {isLoading ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin" />
                <span>Solving in {LANGUAGES.find((l) => l.code === selectedLanguage)?.scriptName}...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Solve Question</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Sample Presets */}
        <div className="pt-2">
          <div className="text-[11px] text-slate-400 mb-1.5 flex items-center gap-1">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            <span>Try High-Yield Sample Doubts:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESET_DOUBTS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => setPromptText(p.prompt)}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 transition-all text-left truncate max-w-xs"
              >
                {p.title}
              </button>
            ))}
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Step-by-Step Structured Solution Display */}
      {solution && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-fadeIn">
          {/* Solution Header & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {solution.subject || 'JEE Main'}
                </span>
                <span className="text-xs font-semibold text-slate-300">
                  {solution.topic || 'Core Theory'}
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Language: {LANGUAGES.find((l) => l.code === selectedLanguage)?.scriptName}
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-white mt-1.5">
                Comprehensive Step-by-Step Solution
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveMistake}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  addedToMistake
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
              >
                <BookmarkPlus className="w-4 h-4 text-rose-400" />
                <span>{addedToMistake ? 'Added to Mistake Book!' : 'Add to Mistake Book'}</span>
              </button>

              <button
                onClick={copyToClipboard}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                title="Copy Solution"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* 1. Given Data & Boundary Conditions */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2">
            <span className="text-xs uppercase font-extrabold tracking-wider text-cyan-400 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              1. Given Data & Initial Parameters
            </span>
            <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-slate-300">
              {solution.givenData.map((item, idx) => (
                <li key={idx} className="leading-relaxed">{item}</li>
              ))}
            </ul>
          </div>

          {/* 2. Core Concept & Formula Used */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
            <span className="text-xs uppercase font-extrabold tracking-wider text-amber-400 flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5" />
              2. Core Concept & Fundamental Law
            </span>
            <p className="text-sm font-semibold text-white">{solution.coreConcept}</p>

            <div className="flex flex-wrap gap-2 pt-1">
              {solution.formulasUsed.map((form, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900 border border-amber-500/30 rounded-lg px-3 py-1 font-mono text-xs sm:text-sm text-amber-300 font-bold"
                >
                  {form}
                </div>
              ))}
            </div>
          </div>

          {/* 3. Step-by-Step Mathematical Derivation */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
            <span className="text-xs uppercase font-extrabold tracking-wider text-purple-400 flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5" />
              3. Step-by-Step Mathematical Derivation
            </span>
            <div className="space-y-3">
              {solution.stepByStepDerivation.map((step, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs sm:text-sm text-slate-200 leading-relaxed font-sans"
                >
                  {step}
                </div>
              ))}
            </div>
          </div>

          {/* 4. Final Answer & Common Pitfalls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Final Answer Box */}
            <div className="bg-gradient-to-br from-emerald-950/30 to-slate-950 border border-emerald-500/40 rounded-2xl p-4 space-y-2">
              <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Check className="w-4 h-4" />
                4a. Final Answer & Option
              </span>
              <p className="text-base sm:text-lg font-black text-white font-mono">
                {solution.finalAnswer}
              </p>
            </div>

            {/* Common Pitfalls & Traps */}
            <div className="bg-gradient-to-br from-rose-950/30 to-slate-950 border border-rose-500/40 rounded-2xl p-4 space-y-2">
              <span className="text-xs uppercase font-extrabold tracking-wider text-rose-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                4b. Exam Pitfalls & Negative Marking Traps
              </span>
              <ul className="space-y-1 text-xs text-rose-200/90 list-disc list-inside">
                {solution.commonPitfalls.map((pit, idx) => (
                  <li key={idx}>{pit}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
