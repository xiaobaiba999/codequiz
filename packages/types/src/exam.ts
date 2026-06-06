import { ExamStatus, QuestionType, Difficulty } from './enums';

export interface Exam {
  id: string;
  userId: string;
  title: string;
  questionCount: number;
  timeLimit: number;
  status: ExamStatus;
  startedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
}

export interface CreateExamRequest {
  title?: string;
  questionCount: number;
  timeLimit: number;
  type?: QuestionType;
  difficulty?: Difficulty;
  tags?: string[];
}

export interface ExamQuestion {
  examId: string;
  questionId: string;
  order: number;
  userAnswer: string | null;
  isCorrect: boolean | null;
}

export interface SubmitExamRequest {
  examId: string;
  answers: {
    questionId: string;
    userAnswer: string;
  }[];
}

export interface ExamResult {
  exam: Exam;
  totalQuestions: number;
  correctCount: number;
  accuracy: number;
  timeSpent: number;
  details: ExamQuestion[];
}
