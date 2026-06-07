import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import { useAuth }  from '../context/AuthContext';
import { useI18n }  from '../context/I18nContext';

/**
 * Login page — Facebook-style two-panel layout.
 * Left: brand tagline  |  Right: login form card or forgot-password flow.
 */
const LoginPage = () => {
  const { login }               = useAuth();
  const { t, lang, toggleLang } = useI18n();
  const navigate = useNavigate();

  // ── Login state ──
  const [form, setForm]       = useState({ username: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  // ── Forgot-password state ──
  const [forgot, setForgot]     = useState(false);           // show recovery panel
  const [fpStep, setFpStep]     = useState(1);               // 1 | 2 | 3
  const [fpUsername, setFpUsername]     = useState('');
  const [fpQuestionKey, setFpQuestionKey] = useState('');
  const [fpAnswer, setFpAnswer]         = useState('');
  const [fpNewPw, setFpNewPw]           = useState('');
  const [fpConfirm, setFpConfirm]       = useState('');
  const [fpError, setFpError]           = useState('');
  const [fpLoading, setFpLoading]       = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // ── Login submit ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await authApi.login(form); // server sets HttpOnly cookie + returns user
      if (!data?.user) throw new Error('LOGIN_ERROR');
      login(data.user);
      navigate('/feed');
    } catch (err) {
      const code = err.response?.data?.error;
      if (code === 'INVALID_CREDENTIALS') setError(t('login.invalidCredentials'));
      else if (code && t(`err.${code}`) !== `err.${code}`) setError(t(`err.${code}`));
      else setError(t('login.error'));
    } finally {
      setLoading(false);
    }
  };

  // ── Forgot step 1: look up the security question ──
  const handleFpStep1 = async (e) => {
    e.preventDefault();
    setFpError('');
    setFpLoading(true);
    try {
      const { data } = await authApi.getSecurityQuestion(fpUsername.trim());
      setFpQuestionKey(data.questionKey);
      setFpStep(2);
    } catch (err) {
      const code = err.response?.data?.error;
      setFpError(code && t(`err.${code}`) !== `err.${code}` ? t(`err.${code}`) : t('login.error'));
    } finally {
      setFpLoading(false);
    }
  };

  // ── Forgot step 2: verify answer and reset password ──
  const handleFpStep2 = async (e) => {
    e.preventDefault();
    if (fpNewPw !== fpConfirm) { setFpError(t('forgot.mismatch')); return; }
    setFpError('');
    setFpLoading(true);
    try {
      await authApi.resetPassword({
        username:       fpUsername.trim(),
        securityAnswer: fpAnswer,
        newPassword:    fpNewPw,
      });
      setFpStep(3);
    } catch (err) {
      const code = err.response?.data?.error;
      setFpError(code && t(`err.${code}`) !== `err.${code}` ? t(`err.${code}`) : t('login.error'));
    } finally {
      setFpLoading(false);
    }
  };

  const resetForgot = () => {
    setForgot(false);
    setFpStep(1);
    setFpUsername(''); setFpQuestionKey('');
    setFpAnswer(''); setFpNewPw(''); setFpConfirm('');
    setFpError('');
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 relative flex items-center justify-center px-4">

      {/* Language toggle — top right */}
      <div className="absolute top-4 right-4">
        <button
          onClick={toggleLang}
          className="flex items-center gap-1.5 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700
                     border border-gray-200 dark:border-gray-600
                     text-gray-600 dark:text-gray-300 font-semibold text-sm px-3 py-2 rounded-lg shadow-sm
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
          <img src="/logo.png" alt="Blog's" className="h-40 w-auto mx-auto md:mx-0 mb-4" />
          <p className="text-gray-700 dark:text-gray-300 text-xl md:text-2xl font-normal leading-snug max-w-sm mx-auto md:mx-0">
            {t('login.tagline')}
          </p>
        </div>

        {/* ── Right panel ── */}
        <div className="w-full md:w-[396px] flex-shrink-0">

          {/* ── Normal login form ── */}
          {!forgot && (
            <form onSubmit={handleSubmit} className="card p-4 flex flex-col gap-3">
              <input
                type="text" name="username" value={form.username}
                onChange={handleChange}
                placeholder={t('login.username')} autoComplete="username"
                className="input-field" required
              />
              <input
                type="password" name="password" value={form.password}
                onChange={handleChange}
                placeholder={t('login.password')} autoComplete="current-password"
                className="input-field" required
              />

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-2">
                  <p className="text-red-600 dark:text-red-400 text-sm text-center">{error}</p>
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-lg">
                {loading ? t('login.submitting') : t('login.submit')}
              </button>

              <button
                type="button"
                onClick={() => setForgot(true)}
                className="text-brand text-sm text-center hover:underline"
              >
                {t('forgot.btn')}
              </button>

              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-600" />
                <span className="text-gray-400 dark:text-gray-500 text-sm">{t('login.or')}</span>
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-600" />
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
          )}

          {/* ── Forgot-password panel ── */}
          {forgot && (
            <div className="card p-5 flex flex-col gap-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 text-center">
                {t('forgot.title')}
              </h2>

              {/* Step 1 — enter username */}
              {fpStep === 1 && (
                <form onSubmit={handleFpStep1} className="flex flex-col gap-3">
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                    {t('forgot.step1Title')}
                  </p>
                  <input
                    type="text" value={fpUsername}
                    onChange={(e) => setFpUsername(e.target.value)}
                    placeholder={t('forgot.usernamePlaceholder')}
                    autoComplete="username" className="input-field" required
                  />
                  {fpError && (
                    <p className="text-red-600 dark:text-red-400 text-sm text-center">{fpError}</p>
                  )}
                  <button type="submit" disabled={fpLoading} className="btn-primary w-full py-2.5">
                    {fpLoading ? t('forgot.searching') : t('forgot.next')}
                  </button>
                  <button type="button" onClick={resetForgot}
                    className="text-sm text-gray-500 dark:text-gray-400 hover:underline text-center">
                    {t('forgot.backToLogin')}
                  </button>
                </form>
              )}

              {/* Step 2 — answer question + new password */}
              {fpStep === 2 && (
                <form onSubmit={handleFpStep2} className="flex flex-col gap-3">
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                    {t('forgot.step2Title')}
                  </p>
                  <div className="bg-brand/10 dark:bg-brand/20 rounded-lg px-4 py-2 text-center">
                    <p className="text-sm font-medium text-brand">{t(`sq.${fpQuestionKey}`)}</p>
                  </div>
                  <input
                    type="text" value={fpAnswer}
                    onChange={(e) => setFpAnswer(e.target.value)}
                    placeholder={t('forgot.answerPlaceholder')}
                    autoComplete="off" className="input-field" required
                  />
                  <input
                    type="password" value={fpNewPw}
                    onChange={(e) => setFpNewPw(e.target.value)}
                    placeholder={t('forgot.newPassword')}
                    autoComplete="new-password" className="input-field" required
                  />
                  <input
                    type="password" value={fpConfirm}
                    onChange={(e) => setFpConfirm(e.target.value)}
                    placeholder={t('forgot.confirmPassword')}
                    autoComplete="new-password" className="input-field" required
                  />
                  {fpError && (
                    <p className="text-red-600 dark:text-red-400 text-sm text-center">{fpError}</p>
                  )}
                  <button type="submit" disabled={fpLoading} className="btn-primary w-full py-2.5">
                    {fpLoading ? t('forgot.submitting') : t('forgot.submit')}
                  </button>
                  <button type="button" onClick={resetForgot}
                    className="text-sm text-gray-500 dark:text-gray-400 hover:underline text-center">
                    {t('forgot.backToLogin')}
                  </button>
                </form>
              )}

              {/* Step 3 — success */}
              {fpStep === 3 && (
                <div className="flex flex-col gap-4 items-center text-center">
                  <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <svg className="w-7 h-7 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-green-700 dark:text-green-400 font-semibold">{t('forgot.success')}</p>
                  <button
                    type="button" onClick={resetForgot}
                    className="btn-primary w-full py-2.5"
                  >
                    {t('forgot.backToLogin')}
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default LoginPage;
