import apiClient from './client';

export const authApi = {
  register: (data: any) => apiClient.post('/auth/register', data),
  login: (data: any) => apiClient.post('/auth/login', data),
  logout: () => apiClient.post('/auth/logout'),
};

export const questionApi = {
  list: (params: any) => apiClient.get('/questions', { params }),
  get: (id: string) => apiClient.get(`/questions/${id}`),
};

export const answerApi = {
  submit: (data: any) => apiClient.post('/answers', data),
  getWrong: (params?: any) => apiClient.get('/answers/wrong', { params }),
  removeWrong: (questionId: string) => apiClient.delete(`/answers/wrong/${questionId}`),
  clearWrong: () => apiClient.delete('/answers/wrong'),
};

export const examApi = {
  create: (data: any) => apiClient.post('/exams', data),
  start: (id: string) => apiClient.post(`/exams/${id}/start`),
  submit: (id: string, data: any) => apiClient.post(`/exams/${id}/submit`, data),
  list: () => apiClient.get('/exams'),
  get: (id: string) => apiClient.get(`/exams/${id}`),
};

export const favoriteApi = {
  list: (params?: any) => apiClient.get('/favorites', { params }),
  add: (questionId: string) => apiClient.post('/favorites', { questionId }),
  remove: (questionId: string) => apiClient.delete(`/favorites/${questionId}`),
};

export const noteApi = {
  get: (questionId: string) => apiClient.get(`/notes/${questionId}`),
  create: (data: any) => apiClient.post('/notes', data),
  update: (questionId: string, content: string) => apiClient.put(`/notes/${questionId}`, { content }),
};

export const statsApi = {
  get: (params?: any) => apiClient.get('/stats', { params }),
};

export const commentApi = {
  list: (questionId: string) => apiClient.get(`/comments/${questionId}`),
};

export const userApi = {
  getProfile: () => apiClient.get('/user/profile'),
  updateProfile: (data: any) => apiClient.put('/user/profile', data),
  changePassword: (data: any) => apiClient.put('/user/password', data),
};
