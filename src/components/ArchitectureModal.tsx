import React, { useState } from 'react';
import { ARCHITECTURE_BLUEPRINT } from '../data/architectureDocs';
import { Cpu, Database, FolderTree, Terminal, Copy, Check, Sparkles } from 'lucide-react';

export const ArchitectureModal: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'DIR' | 'SQL' | 'PROMPT'>('DIR');
  const [copied, setCopied] = useState<string | null>(null);

  const copyCode = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-fadeIn">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
                <Cpu className="w-5 h-5" />
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Technical Blueprint & Production Specs
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Full enterprise architectural design, PostgreSQL DDL schemas, and multilingual AI system prompt engine.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveSection('DIR')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeSection === 'DIR'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FolderTree className="w-3.5 h-3.5" />
              <span>1. Clean Architecture</span>
            </button>
            <button
              onClick={() => setActiveSection('SQL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeSection === 'SQL'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>2. Database Schema</span>
            </button>
            <button
              onClick={() => setActiveSection('PROMPT')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeSection === 'PROMPT'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>3. AI System Prompts</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        {/* Section 1: Clean Architecture Tree */}
        {activeSection === 'DIR' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FolderTree className="w-4 h-4 text-blue-400" />
                  Recommended Directory Structure (Clean Architecture / Flutter & React Native)
                </h3>
                <p className="text-xs text-slate-400">
                  Separates domain logic, data models, repositories, and UI presentation layer with feature-first modularity.
                </p>
              </div>
              <button
                onClick={() => copyCode(ARCHITECTURE_BLUEPRINT.directoryStructure, 'dir')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-all"
              >
                {copied === 'dir' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied === 'dir' ? 'Copied!' : 'Copy Structure'}</span>
              </button>
            </div>

            <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 font-mono text-xs text-cyan-300 overflow-x-auto leading-relaxed scrollbar-thin">
              {ARCHITECTURE_BLUEPRINT.directoryStructure}
            </pre>
          </div>
        )}

        {/* Section 2: PostgreSQL / Supabase Schema */}
        {activeSection === 'SQL' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" />
                  Production PostgreSQL / Supabase DDL Schemas
                </h3>
                <p className="text-xs text-slate-400">
                  Includes User Profiles, Countdown Targets, Question Bank with JSONB Multilingual explanations, CBT Sessions, and Mistake Book.
                </p>
              </div>
              <button
                onClick={() => copyCode(ARCHITECTURE_BLUEPRINT.databaseSchemaSql, 'sql')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-all"
              >
                {copied === 'sql' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied === 'sql' ? 'Copied!' : 'Copy SQL DDL'}</span>
              </button>
            </div>

            <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 font-mono text-xs text-emerald-300 overflow-x-auto leading-relaxed scrollbar-thin max-h-[600px]">
              {ARCHITECTURE_BLUEPRINT.databaseSchemaSql}
            </pre>
          </div>
        )}

        {/* Section 3: AI System Prompts */}
        {activeSection === 'PROMPT' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  System Prompts & Translation Handling Architecture
                </h3>
                <p className="text-xs text-slate-400">
                  Exact pipeline instructions for English, Hindi (हिंदी), Bengali (বাংলা), Gujarati (ગુજરાતી), and Assamese (অসমীয়া).
                </p>
              </div>
              <button
                onClick={() => copyCode(ARCHITECTURE_BLUEPRINT.systemPromptArchitecture, 'prompt')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-all"
              >
                {copied === 'prompt' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied === 'prompt' ? 'Copied!' : 'Copy System Prompt'}</span>
              </button>
            </div>

            <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 font-mono text-xs text-purple-300 overflow-x-auto leading-relaxed scrollbar-thin max-h-[600px]">
              {ARCHITECTURE_BLUEPRINT.systemPromptArchitecture}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
