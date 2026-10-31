export type ExamId = 
  | 'jee-main-2027-s1' 
  | 'jee-main-2027-s2' 
  | 'jee-adv-2027' 
  | 'wbjee-2027' 
  | 'bitsat-2027';

export type IndianLanguage = 'en' | 'hi' | 'bn' | 'gu' | 'as';

export interface ExamTarget {
  id: ExamId;
  name: string;
  fullName: string;
  targetDate: string; // ISO date
  conductingBody: string;
  totalMarks: number;
  totalQuestions: number;
  durationMinutes: number;
  markingScheme: {
    correct: number;
    incorrect: number;
    unattempted: number;
  };
  syllabusProgress: {
    physics: number; // percentage 0-100
    chemistry: number;
    math: number;
    overall: number;
  };
  weightageFocus: {
    subject: string;
    highYieldTopics: string[];
    class11Weightage: number;
    class12Weightage: number;
  }[];
  urgencyLevel: 'Critical' | 'Intense' | 'Steady';
}

export type Subject = 'Physics' | 'Chemistry' | 'Mathematics';
export type SectionType = 'SECTION_A_MCQ' | 'SECTION_B_NUMERICAL';

export type QuestionStatus = 
  | 'NOT_VISITED' 
  | 'NOT_ANSWERED' 
  | 'ANSWERED' 
  | 'MARKED_FOR_REVIEW' 
  | 'ANSWERED_AND_MARKED';

export interface CBTQuestion {
  id: string;
  subject: Subject;
  section: SectionType;
  questionNumber: number;
  chapter: string;
  classLevel: 'Class 11' | 'Class 12';
  year?: number;
  shift?: string;
  questionText: string;
  latexFormula?: string;
  diagramUrl?: string;
  options?: {
    key: 'A' | 'B' | 'C' | 'D';
    text: string;
  }[];
  correctAnswer: string; // "A" | "B" | "C" | "D" or numerical string like "4.5" or "12"
  tolerance?: number; // for numerical
  solutionSteps: string[];
  explanation: {
    en: string;
    hi?: string;
    bn?: string;
    gu?: string;
    as?: string;
  };
  commonTrap: string;
  difficulty: 'Easy' | 'Moderate' | 'JEE Advanced Level';
}

export interface UserQuestionState {
  status: QuestionStatus;
  selectedOption?: string;
  numericalAnswer?: string;
  timeSpentSeconds: number;
  isMarkedForReview: boolean;
  visited: boolean;
}

export interface MockTestConfig {
  id: string;
  title: string;
  type: 'CHAPTER_WISE' | 'FULL_SYLLABUS' | 'PYQ_SHIFT' | 'PREDICTED_2027';
  targetExam: ExamId;
  durationMinutes: number;
  totalQuestions: number;
  subjectFilter?: Subject;
  chapterFilter?: string;
  year?: number;
  shift?: string;
}

export interface TestSessionResult {
  testId: string;
  testTitle: string;
  timestamp: string;
  durationSpentMinutes: number;
  totalScore: number;
  maxScore: number;
  attempted: number;
  correct: number;
  incorrect: number;
  unattempted: number;
  accuracy: number;
  negativeMarksLost: number;
  estimatedPercentile: number;
  estimatedAIR: number;
  subjectBreakdown: {
    [key in Subject]: {
      score: number;
      maxScore: number;
      correct: number;
      incorrect: number;
      timeSpentSeconds: number;
      accuracy: number;
    };
  };
  questionStates: Record<string, UserQuestionState>;
}

export interface PrepAISolution {
  subject: string;
  topic: string;
  givenData: string[];
  coreConcept: string;
  formulasUsed: string[];
  stepByStepDerivation: string[];
  finalAnswer: string;
  commonPitfalls: string[];
  language?: IndianLanguage;
  isSimulated?: boolean;
}

export interface MistakeBookItem {
  id: string;
  questionId?: string;
  title: string;
  subject: Subject;
  chapter: string;
  questionText: string;
  userWrongAnswer: string;
  correctAnswer: string;
  mistakeReason: 'Conceptual Error' | 'Calculation Slip' | 'Formula Recall' | 'Question Misread' | 'Time Pressure';
  keyTakeaway: string;
  addedAt: string;
}
