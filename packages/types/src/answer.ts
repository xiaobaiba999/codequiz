import { QuestionType } from './enums';

export interface SubmitAnswerRequest {
  questionId: string;
  userAnswer: string;
  type: QuestionType;
  language?: string;
}

export interface SubmitAnswerResponse {
  isCorrect: boolean;
  correctAnswer: string;
  analysis: string;
  executionOutput?: string;
  executionError?: string;
}

export interface UserAnswer {
  id: string;
  userId: string;
  questionId: string;
  userAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
  createdAt: string;
}
