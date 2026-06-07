import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import QuestionList from './pages/QuestionList';
import QuestionDetail from './pages/QuestionDetail';
import Practice from './pages/Practice';
import Exam from './pages/Exam';
import WrongBook from './pages/WrongBook';
import Favorites from './pages/Favorites';
import ImportQuestions from './pages/ImportQuestions';
import Stats from './pages/Stats';
import Profile from './pages/Profile';
import { useAuthStore } from './store/auth';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useAuthStore();
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="/questions" replace />} />
        <Route path="questions" element={<QuestionList />} />
        <Route path="questions/:id" element={<QuestionDetail />} />
        <Route path="practice" element={<Practice />} />
        <Route path="exam" element={<Exam />} />
        <Route path="wrong" element={<WrongBook />} />
        <Route path="favorites" element={<Favorites />} />
        <Route path="stats" element={<Stats />} />
        <Route path="profile" element={<Profile />} />
        <Route path="import" element={<ImportQuestions />} />
      </Route>
    </Routes>
  );
};

export default App;
