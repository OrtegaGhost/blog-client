import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

/**
 * Login page — Facebook-style two-panel layout.
 * Left: brand tagline  |  Right: login form card
 */
const LoginPage = () => {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [form, setForm]     = useState({ username: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) return;

    setLoading(true);
    setError('');
    try {
      const { data: tokenData } = await authApi.login(form);
      const { data: userData }  = await authApi.me();
      login(tokenData, userData);
      navigate('/feed');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-4xl flex flex-col md:flex-row items-center gap-8 md:gap-16">

        {/* ── Left panel — brand ── */}
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
            <div className="w-16 h-16 bg-brand rounded-full flex items-center justify-center shadow-lg">
              <span className="text-gray-900 font-extrabold text-3xl leading-none">B</span>
            </div>
            <span className="text-brand font-extrabold text-5xl drop-shadow">Blog</span>
          </div>
          <p className="text-gray-700 text-xl md:text-2xl font-normal leading-snug max-w-sm">
            Connect with friends and share your thoughts with the world.
          </p>
        </div>

        {/* ── Right panel — form ── */}
        <div className="w-full md:w-[396px] flex-shrink-0">
          <form onSubmit={handleSubmit} className="card p-4 flex flex-col gap-3">

            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Username"
              autoComplete="username"
              className="input-field"
              required
            />

            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Password"
              autoComplete="current-password"
              className="input-field"
              required
            />

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                <p className="text-red-600 text-sm text-center">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-lg"
            >
              {loading ? 'Logging in…' : 'Log In'}
            </button>

            <Link
              to="#"
              className="text-brand text-sm text-center hover:underline"
            >
              Forgot password?
            </Link>

            <div className="flex items-center gap-3 my-1">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-gray-400 text-sm">or</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <Link
              to="/register"
              className="btn-primary w-full py-3 text-center text-base
                         bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg
                         flex items-center justify-center transition-colors duration-150"
            >
              Create new account
            </Link>

          </form>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
