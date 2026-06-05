import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import { useI18n } from '../context/I18nContext';

const ChangePasswordPage = () => {
  const { t, lang, toggleLang } = useI18n();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.new_password !== form.confirm_password) {
      setError(t('chpw.mismatch'));
      return;
    }
    setLoading(true);
    setError('');
    try {
      await authApi.changePassword({
        current_password: form.current_password,
        new_password: form.new_password,
      });
      setSuccess(true);
      setTimeout(() => navigate('/feed'), 2000);
    } catch (err) {
      const code = err.response?.data?.error;
      if (code === 'WRONG_CURRENT_PASSWORD') setError(t('chpw.wrongCurrent'));
      else if (code === 'SAME_PASSWORD') setError(t('chpw.samePassword'));
      else setError(t('chpw.failed'));
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

      <div className="w-full max-w-sm">

        {/* Brand header */}
        <div className="text-center mb-6">
          <Link to="/feed" className="inline-block">
            <img src="/logo.png" alt="Blog's" className="h-20 w-auto mx-auto" />
          </Link>
        </div>

        <div className="card p-6">
          {/* Lock icon */}
          <div className="flex justify-center mb-3">
            <div className="bg-brand/10 rounded-full p-3">
              <svg className="w-8 h-8 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 text-center">{t('chpw.title')}</h1>
          <p className="text-gray-500 text-center text-sm mt-1 mb-5">{t('chpw.subtitle')}</p>

          {success ? (
            <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-4 text-center">
              <svg className="w-8 h-8 text-green-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-green-700 font-semibold">{t('chpw.success')}</p>
              <p className="text-green-600 text-sm mt-1">{t('chpw.redirecting')}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="password"
                name="current_password"
                value={form.current_password}
                onChange={handleChange}
                placeholder={t('chpw.currentPassword')}
                autoComplete="current-password"
                className="input-field"
                required
              />
              <input
                type="password"
                name="new_password"
                value={form.new_password}
                onChange={handleChange}
                placeholder={t('chpw.newPassword')}
                autoComplete="new-password"
                className="input-field"
                required
              />
              <input
                type="password"
                name="confirm_password"
                value={form.confirm_password}
                onChange={handleChange}
                placeholder={t('chpw.confirmPassword')}
                autoComplete="new-password"
                className="input-field"
                required
              />

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 text-base mt-1"
              >
                {loading ? t('chpw.submitting') : t('chpw.submit')}
              </button>
            </form>
          )}

          <div className="text-center mt-4">
            <Link to="/feed" className="text-brand text-sm font-medium hover:underline">
              {t('chpw.backToFeed')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
