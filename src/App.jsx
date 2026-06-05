import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage    from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FeedPage     from './pages/FeedPage';

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/feed"
          element={
            <ProtectedRoute>
              <FeedPage />
            </ProtectedRoute>
          }
        />
        {/* Redirect root and unknown routes to feed */}
        <Route path="*" element={<Navigate to="/feed" replace />} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
