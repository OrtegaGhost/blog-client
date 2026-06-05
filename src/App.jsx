import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider }  from './context/AuthContext';
import { I18nProvider }  from './context/I18nContext';
import ProtectedRoute    from './components/ProtectedRoute';
import LoginPage         from './pages/LoginPage';
import RegisterPage      from './pages/RegisterPage';
import FeedPage          from './pages/FeedPage';

const App = () => (
  <BrowserRouter>
    <I18nProvider>
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
          <Route path="*" element={<Navigate to="/feed" replace />} />
        </Routes>
      </AuthProvider>
    </I18nProvider>
  </BrowserRouter>
);

export default App;
