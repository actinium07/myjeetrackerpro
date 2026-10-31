export const ARCHITECTURE_BLUEPRINT = {
  directoryStructure: `jee_2027_trackprep_mobile/
├── android/                        # Android native shell & NDK / Gradle config
├── ios/                            # iOS native workspace & Podfile
├── lib/ (or src/)                  # Clean Architecture Layered Core
│   ├── core/                       # Shared kernel & cross-cutting concerns
│   │   ├── constants/              # Exam dates, NTA markings, syllabus weightages
│   │   ├── network/                # Dio/Axios client, interceptors, retry policies
│   │   ├── theme/                  # High-contrast NTA CBT palette, typography, tokens
│   │   ├── utils/                  # Countdown tickers, math formatter, audio parser
│   │   └── error/                  # Domain exceptions & failure mappings
│   ├── features/                   # Feature-driven modular slices
│   │   ├── countdown_switcher/     # Dynamic target exam switcher & countdown
│   │   │   ├── data/               # CountdownRepository, local storage cache
│   │   │   ├── domain/             # TargetExam entity, countdown use-cases
│   │   │   └── presentation/       # CountdownHeroWidget, ExamSelectorDropdown
│   │   ├── cbt_mock_engine/        # Exact NTA simulation test runner
│   │   │   ├── data/               # QuestionBankDao, SessionSyncRepository
│   │   │   ├── domain/             # Question, PaletteStatus, ScoreCalculator, AIRModel
│   │   │   └── presentation/       # CBTPlayerScreen, QuestionPalette, TimerTicker, ResultAnalytics
│   │   ├── pyq_vault/              # 10-Year PYQ Explorer (2017-2026) & 2027 Predicted Papers
│   │   │   ├── data/               # ShiftQuestionsDataSource, LocalMistakeStore
│   │   │   ├── domain/             # FilterPYQByYearShiftUseCase
│   │   │   └── presentation/       # PYQYearShiftGrid, PracticeModeCard
│   │   ├── prep_ai_solver/         # Multilingual Multimodal AI Doubt Engine
│   │   │   ├── data/               # GeminiSolverService, VoiceTranscriptionApi
│   │   │   ├── domain/             # SolveProblemUseCase, TranslateConceptUseCase
│   │   │   └── presentation/       # CameraCropModal, FormulaInputPad, MultilingualSolutionView
│   │   └── mistake_book/           # Personal revision book & error diagnostics
│   │       ├── domain/             # MistakeClassifier, SpacedRepetitionScheduler
│   │       └── presentation/       # MistakeTimelineScreen, ErrorAnalysisTagList
│   ├── main.dart (or index.ts)     # Application bootstrap & dependency injection
│   └── app.dart                    # App routing, global providers & state tree`,

  databaseSchemaSql: `-- ============================================================================
-- JEE 2027 TRACKPREP & AI SOLVER - PRODUCTION POSTGRESQL / SUPABASE DDL SCHEMA
-- ============================================================================

-- 1. User Profiles & Active Target Exam
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    active_target_exam_id VARCHAR(50) NOT NULL DEFAULT 'jee-main-2027-s1',
    preferred_ai_language VARCHAR(10) NOT NULL DEFAULT 'en', -- 'en', 'hi', 'bn', 'gu', 'as'
    coaching_institute VARCHAR(100),
    target_dream_iit VARCHAR(100) DEFAULT 'IIT Bombay - Computer Science',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Target Exams & Dynamic Countdown Configs
CREATE TABLE IF NOT EXISTS exam_targets (
    id VARCHAR(50) PRIMARY KEY, -- e.g. 'jee-main-2027-s1'
    exam_name VARCHAR(100) NOT NULL,
    conducting_body VARCHAR(100) NOT NULL,
    exam_date TIMESTAMPTZ NOT NULL,
    total_marks INT NOT NULL DEFAULT 300,
    total_questions INT NOT NULL DEFAULT 75,
    duration_minutes INT NOT NULL DEFAULT 180,
    marking_scheme JSONB NOT NULL DEFAULT '{"correct": 4, "incorrect": -1, "unattempted": 0}'::jsonb,
    is_active BOOLEAN DEFAULT TRUE
);

-- 3. Comprehensive Question Bank (PYQs 2017-2026 & 2027 Predicted Sample Papers)
CREATE TABLE IF NOT EXISTS question_bank (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject VARCHAR(30) NOT NULL, -- 'Physics', 'Chemistry', 'Mathematics'
    section VARCHAR(30) NOT NULL, -- 'SECTION_A_MCQ', 'SECTION_B_NUMERICAL'
    chapter_name VARCHAR(100) NOT NULL,
    class_level VARCHAR(20) NOT NULL, -- 'Class 11', 'Class 12'
    exam_source VARCHAR(50) NOT NULL, -- 'JEE Main', 'JEE Advanced', 'Predicted 2027'
    pyq_year INT,                     -- 2017 through 2026
    pyq_shift VARCHAR(50),            -- 'Jan 29 Shift 1'
    question_text TEXT NOT NULL,
    latex_formulas TEXT,
    diagram_url TEXT,
    options JSONB,                    -- [{"key": "A", "text": "..."}, ...] for MCQs
    correct_answer TEXT NOT NULL,     -- 'B' or '50'
    numerical_tolerance NUMERIC(6,2), -- +/- tolerance
    solution_steps JSONB NOT NULL,    -- array of step explanations
    explanation_multilingual JSONB,   -- {"en": "...", "hi": "...", "bn": "...", "gu": "...", "as": "..."}
    common_pitfalls TEXT,
    difficulty VARCHAR(30) DEFAULT 'Moderate',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CBT Mock Test Sessions & Real-Time Auto-Save Recovery
CREATE TABLE IF NOT EXISTS cbt_test_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    exam_target_id VARCHAR(50) REFERENCES exam_targets(id),
    test_type VARCHAR(30) NOT NULL, -- 'FULL_SYLLABUS', 'CHAPTER_WISE', 'PYQ_TIMED'
    test_title VARCHAR(150) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'IN_PROGRESS', -- 'IN_PROGRESS', 'SUBMITTED', 'ABANDONED'
    time_remaining_seconds INT NOT NULL,
    total_score NUMERIC(6,2) DEFAULT 0,
    max_score INT NOT NULL DEFAULT 300,
    accuracy_percentage NUMERIC(5,2) DEFAULT 0,
    negative_marks_lost NUMERIC(6,2) DEFAULT 0,
    estimated_percentile NUMERIC(5,2),
    estimated_air INT,
    question_palette_state JSONB NOT NULL DEFAULT '{}'::jsonb, -- QuestionStatus map
    started_at TIMESTAMPTZ DEFAULT NOW(),
    submitted_at TIMESTAMPTZ
);

-- 5. Multilingual AI Doubt & Question Solver History
CREATE TABLE IF NOT EXISTS prep_ai_doubt_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    input_type VARCHAR(20) NOT NULL, -- 'CAMERA_IMAGE', 'MATH_TEXT', 'VOICE_QUERY'
    prompt_query TEXT,
    image_storage_url TEXT,
    target_language VARCHAR(10) NOT NULL DEFAULT 'en', -- en, hi, bn, gu, as
    parsed_subject VARCHAR(50),
    parsed_topic VARCHAR(100),
    ai_response_json JSONB NOT NULL, -- givenData, coreConcept, formulasUsed, derivation, finalAnswer
    is_saved_to_mistake_book BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Personal Student Mistake Book
CREATE TABLE IF NOT EXISTS personal_mistake_book (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    question_id UUID REFERENCES question_bank(id) ON DELETE SET NULL,
    ai_doubt_log_id UUID REFERENCES prep_ai_doubt_logs(id) ON DELETE SET NULL,
    subject VARCHAR(30) NOT NULL,
    chapter VARCHAR(100) NOT NULL,
    question_text TEXT NOT NULL,
    user_wrong_answer TEXT,
    correct_answer TEXT NOT NULL,
    mistake_category VARCHAR(50) NOT NULL, -- 'Conceptual Error', 'Calculation Slip', 'Question Misread', 'Time Pressure'
    personal_learning_notes TEXT,
    revision_count INT DEFAULT 0,
    next_spaced_revision_date DATE DEFAULT (CURRENT_DATE + INTERVAL '3 days'),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_cbt_sessions ON cbt_test_sessions(user_id, status);
CREATE INDEX idx_question_bank_filter ON question_bank(subject, class_level, pyq_year);`,

  systemPromptArchitecture: `================================================================================
PREPAI MULTILINGUAL ARCHITECTURE & SYSTEM PROMPT SPECIFICATION
================================================================================

1. ENGINE PIPELINE:
   Client (React/Flutter) 
      -> Multimodal Input (Base64 JPEG / Math Text / Web Speech Audio)
      -> Server Gateway (/api/gemini/solve)
      -> Gemini 3.8 Flash (Structured JSON Schema Enforcement)
      -> Dynamic Vernacular Script Synthesizer (Devanagari, Bengali, Gujarati, Assamese)
      -> Real-Time Render with LaTeX & Step Breakdown

2. MASTER SYSTEM PROMPT (EXACT REPRODUCIBLE PROMPT):
\`\`\`text
You are "PrepAI", an elite IIT-JEE Master Mentor and Physics, Chemistry & Mathematics problem-solving engine built for JEE 2027 aspirants.
Your role is to guide the student with absolute mathematical rigor, academic precision, and pedagogical clarity.

EXAM STANDARD:
- JEE Main / JEE Advanced 2027 updated syllabus and pattern.
- Adhere strictly to SI units, standard sign conventions, and exact algebraic formulations.

LANGUAGE LOCALIZATION PROTOCOL:
- When language = "en": Use academic English suited for JEE aspirants.
- When language = "hi": Explain in formal Hindi (हिंदी) using Devanagari script for conceptual reasoning and descriptions. Preserve standard mathematical symbols and Latin variables (e.g. x, y, \\Delta H, v = u + at, kg, m/s).
- When language = "bn": Explain in formal Bengali (বাংলা) using Bengali script for all explanations and logic, maintaining standard mathematical variables in Latin characters.
- When language = "gu": Explain in formal Gujarati (ગુજરાતી) using Gujarati script for reasoning and steps.
- When language = "as": Explain in formal Assamese (অসমীয়া) using Assamese script for all textual clarifications and deductions.

OUTPUT JSON SCHEMA REQUIREMENT:
{
  "subject": "Physics" | "Chemistry" | "Mathematics",
  "topic": "Chapter or sub-concept name",
  "givenData": ["Array of explicitly given parameters, initial conditions, constants"],
  "coreConcept": "The foundational physical law, chemical principle, or mathematical theorem",
  "formulasUsed": ["List of exact equations and identities utilized"],
  "stepByStepDerivation": [
    "Step 1: ...",
    "Step 2: ...",
    "Step 3: ...",
    "Step 4: ..."
  ],
  "finalAnswer": "Explicit final numerical answer with units or option letter",
  "commonPitfalls": [
    "High-yield trap 1 (e.g., negative sign omitted in potential energy)",
    "High-yield trap 2 (e.g., confusing molarity with molality)",
    "Negative marking advisory (-1 penalty warning)"
  ]
}
\`\`\``,
};
