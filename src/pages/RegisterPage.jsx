import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import { useI18n }  from '../context/I18nContext';

/**
 * Registration page — Facebook "Create account" card style.
 */
const RegisterPage = () => {
  const navigate                = useNavigate();
  const { t, lang, toggleLang } = useI18n();

  const SECURITY_QUESTIONS = ['q0', 'q1', 'q2', 'q3', 'q4'];

  const [form, setForm] = useState({
    name: '', email: '', username: '', password: '',
    securityQuestion: 'q0', securityAnswer: '',
  });
  const [photo, setPhoto]     = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!photo) { setError(t('register.photoRequired')); return; }
    if (!form.securityAnswer.trim()) { setError(t('register.securityHint')); return; }
    setLoading(true);
    setError('');
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    fd.append('profilePhoto', photo);
    try {
      await authApi.register(fd);
      navigate('/login', { state: { registered: true } });
    } catch (err) {
      const code = err.response?.data?.error;
      if (code && t(`err.${code}`) !== `err.${code}`) setError(t(`err.${code}`));
      else setError(t('register.failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 relative flex items-center justify-center px-4 py-8">

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

      <div className="w-full max-w-md">

        {/* ── Brand header ── */}
        <div className="text-center mb-6">
          <Link to="/login" className="inline-block">
            <img src="/logo.png" alt="Blog's" className="h-24 w-auto mx-auto" />
          </Link>
        </div>

        {/* ── Form card ── */}
        <div className="card p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 text-center">{t('register.title')}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-center mt-1 mb-5">{t('register.subtitle')}</p>

          <div className="border-t border-gray-200 dark:border-gray-600 mb-5" />

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">

            {/* Name + Email — stacked on mobile, side-by-side on sm+ */}
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text" name="name" value={form.name}
                onChange={handleChange}
                placeholder={t('register.fullName')} autoComplete="name"
                className="input-field"
                required
              />
              <input
                type="email" name="email" value={form.email}
                onChange={handleChange}
                placeholder={t('register.email')} autoComplete="email"
                className="input-field"
                required
              />
            </div>

            <input
              type="text" name="username" value={form.username}
              onChange={handleChange}
              placeholder={t('register.username')}
              autoComplete="username"
              className="input-field"
              required
            />

            <input
              type="password" name="password" value={form.password}
              onChange={handleChange}
              placeholder={t('register.password')}
              autoComplete="new-password"
              className="input-field"
              required
            />

            {/* Security question */}
            <div className="flex flex-col gap-2">
              <select
                name="securityQuestion"
                value={form.securityQuestion}
                onChange={handleChange}
                className="input-field bg-white dark:bg-gray-700"
                required
              >
                {SECURITY_QUESTIONS.map((key) => (
                  <option key={key} value={key}>{t(`sq.${key}`)}</option>
                ))}
              </select>
              <input
                type="text" name="securityAnswer" value={form.securityAnswer}
                onChange={handleChange}
                placeholder={t('register.securityAnswer')}
                autoComplete="off"
                className="input-field"
                required
              />
              <p className="text-xs text-gray-400 dark:text-gray-500 px-1">{t('register.securityHint')}</p>
            </div>

            {/* Profile photo */}
            <label className="cursor-pointer">
              <div className={`flex items-center gap-4 p-3 border-2 border-dashed rounded-xl
                               transition-colors duration-150
                               ${preview ? 'border-brand bg-brand/5 dark:bg-brand/10' : 'border-gray-300 dark:border-gray-600 hover:border-brand'}`}>
                {preview ? (
                  <img src={preview} alt="Preview" className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {preview ? t('register.photoSelected') : t('register.uploadPhoto')}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{t('register.photoHint')}</p>
                </div>
              </div>
              <input
                type="file" accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFile} className="sr-only"
              />
            </label>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-2">
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base mt-2">
              {loading ? t('register.submitting') : t('register.submit')}
            </button>

          </form>

          <div className="text-center mt-4">
            <Link to="/login" className="text-brand text-sm font-medium hover:underline">
              {t('register.alreadyHave')}
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RegisterPage;
