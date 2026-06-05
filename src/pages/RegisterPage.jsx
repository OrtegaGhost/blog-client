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

  const [form, setForm] = useState({
    name: '', email: '', username: '', password: '',
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
    setLoading(true);
    setError('');
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    fd.append('profilePhoto', photo);
    try {
      await authApi.register(fd);
      navigate('/login', { state: { registered: true } });
    } catch (err) {
      const msg = err.response?.data?.message
        || err.response?.data?.details?.[0]?.message
        || t('register.failed');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 relative flex items-center justify-center px-4 py-8">

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

      <div className="w-full max-w-md">

        {/* ── Brand header ── */}
        <div className="text-center mb-6">
          <Link to="/login" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-brand rounded-full flex items-center justify-center">
              <span className="text-white font-extrabold text-xl leading-none">B</span>
            </div>
            <span className="text-gray-900 font-extrabold text-3xl">Blog</span>
          </Link>
        </div>

        {/* ── Form card ── */}
        <div className="card p-6">
          <h1 className="text-2xl font-bold text-gray-900 text-center">{t('register.title')}</h1>
          <p className="text-gray-500 text-center mt-1 mb-5">{t('register.subtitle')}</p>

          <div className="border-t border-gray-200 mb-5" />

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

            {/* Profile photo */}
            <label className="cursor-pointer">
              <div className={`flex items-center gap-4 p-3 border-2 border-dashed rounded-xl
                               transition-colors duration-150
                               ${preview ? 'border-brand bg-brand/5' : 'border-gray-300 hover:border-brand'}`}>
                {preview ? (
                  <img src={preview} alt="Preview" className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-700">
                    {preview ? t('register.photoSelected') : t('register.uploadPhoto')}
                  </p>
                  <p className="text-xs text-gray-400">{t('register.photoHint')}</p>
                </div>
              </div>
              <input
                type="file" accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFile} className="sr-only"
              />
            </label>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                <p className="text-red-600 text-sm">{error}</p>
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
