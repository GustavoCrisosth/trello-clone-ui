import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { BoardsDashboardPage } from './pages/BoardsDashboardPage';
import { BoardDetailPage } from './pages/BoardDetailPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <Routes>
      { }
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      { }
      <Route
        path="/boards"
        element={
          <ProtectedRoute>
            <BoardsDashboardPage />
          </ProtectedRoute>
        }
      />

      { }
      <Route
        path="/boards/:id"
        element={
          <ProtectedRoute>
            <BoardDetailPage />
          </ProtectedRoute>
        }
      />

      { }
      <Route
        path="/"
        element={<Navigate to="/boards" />}
      />
    </Routes>
  )
}

export default App