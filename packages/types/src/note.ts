export interface Note {
  id: string;
  userId: string;
  questionId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteRequest {
  questionId: string;
  content: string;
}

export interface UpdateNoteRequest {
  content: string;
}
