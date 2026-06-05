import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import { useAuth }  from '../context/AuthContext';
import { useI18n }  from '../context/I18nContext';
import { storage }  from '../utils/storage';

/**
 * Login page — Facebook-style two-panel layout.
 * Left: brand tagline  |  Right: login form card
 */
const LoginPage = () => {
  const { login }               = useAuth();
  const { t, lang, toggleLang } = useI18n();
  const navigate = useNavigate();

  const [form, setForm]       = useState({ username: '', password: '' });
  const [error, setError]     = useState('');
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
      storage.setToken(tokenData.access_token); // set before /me so the interceptor picks it up
      const { data: userData }  = await authApi.me();
      login(tokenData, userData);
      navigate('/feed');
    } catch (err) {
      storage.clear(); // discard any partially stored token on failure
      const code = err.response?.data?.error;
      if (code === 'INVALID_CREDENTIALS') setError(t('login.invalidCredentials'));
      else if (code && t(`err.${code}`) !== `err.${code}`) setError(t(`err.${code}`));
      else setError(t('login.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 relative flex items-center justify-center px-4">

      {/* Language toggle — top right */}
      <div className="absolute top-4 right-4">
        <button
          onClick={toggleLang}
          className="flex items-center gap-1.5 bg-white hover:bg-gray-50 border border-gray-200
                     text-gray-600 font-semibold text-sm px-3 py-2 rounded-lg shadow-sm
                     transition-colors duration-150"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
          </svg>
          <span className="uppercase text-xs font-bold">{lang === 'en' ? 'ES' : 'EN'}</span>
        </button>
      </div>

      <div className="w-full max-w-4xl flex flex-col md:flex-row items-center gap-8 md:gap-16">

        {/* ── Left panel — brand ── */}
        <div className="flex-1 text-center md:text-left">
          <img
            src="/logo.png"
            alt="Blog's"
            className="h-40 w-auto mx-auto md:mx-0 mb-4"
          />
          <p className="text-gray-700 text-xl md:text-2xl font-normal leading-snug max-w-sm mx-auto md:mx-0">
            {t('login.tagline')}
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
              placeholder={t('login.username')}
              autoComplete="username"
              className="input-field"
              required
            />

            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder={t('login.password')}
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
              {loading ? t('login.submitting') : t('login.submit')}
            </button>

            <Link
              to="#"
              className="text-brand text-sm text-center hover:underline"
            >
              {t('login.forgotPassword')}
            </Link>

            <div className="flex items-center gap-3 my-1">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-gray-400 text-sm">{t('login.or')}</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <Link
              to="/register"
              className="w-full py-3 text-center text-base
                         bg-green-500 hover:bg-green-600 active:bg-green-700
                         text-white font-bold rounded-lg
                         flex items-center justify-center transition-colors duration-150"
            >
              {t('login.createAccount')}
            </Link>

          </form>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
