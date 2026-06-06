import { QuestionType, Difficulty } from './enums';

export interface QuestionOption {
  label: string;
  value: string;
}

export interface TestCase {
  input: string;
  expectedOutput: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  content: string;
  options: QuestionOption[] | null;
  answer: string;
  analysis: string;
  difficulty: Difficulty;
  tags: string[];
  testCases: TestCase[] | null;
  language?: string;
  starterCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuestionRequest {
  type: QuestionType;
  title: string;
  content: string;
  options?: QuestionOption[];
  answer: string;
  analysis: string;
  difficulty: Difficulty;
  tags: string[];
  testCases?: TestCase[];
  language?: string;
  starterCode?: string;
}

export interface UpdateQuestionRequest extends Partial<CreateQuestionRequest> {}

export interface QuestionListQuery {
  page?: number;
  pageSize?: number;
  keyword?: string;
  type?: QuestionType;
  difficulty?: Difficulty;
  tags?: string[];
}

export interface QuestionListResponse {
  items: Question[];
  total: number;
  page: number;
  pageSize: number;
}

export interface BatchImportRequest {
  questions: CreateQuestionRequest[];
}
