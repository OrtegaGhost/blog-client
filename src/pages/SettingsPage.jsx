import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import { useTheme } from '../context/ThemeContext';
import { authApi } from '../services/api';
import Navbar from '../components/Navbar';

const SettingsPage = () => {
  const { user, updateUser, logout } = useAuth();
  const { t }      = useI18n();
  const { darkMode, toggleDark } = useTheme();
  const navigate   = useNavigate();

  // --- Cambiar nombre ---
  const [name, setName]           = useState(user?.name || '');
  const [nameSaving, setNameSaving] = useState(false);
  const [nameMsg, setNameMsg]     = useState('');

  const handleNameSave = async (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || trimmed === user?.name) return;
    setNameSaving(true);
    setNameMsg('');
    try {
      const { data } = await authApi.updateName(trimmed);
      updateUser({ name: data.name });
      setNameMsg(t('settings.nameSaved'));
      setTimeout(() => setNameMsg(''), 3000);
    } catch {
      setNameMsg('Error al guardar. Intenta de nuevo.');
    } finally {
      setNameSaving(false);
    }
  };

  // --- Cambiar contrasena ---
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError]     = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);

  const handlePwChange = (e) => setPwForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handlePwSubmit = async (e) => {
    e.preventDefault();
    if (pwForm.new_password !== pwForm.confirm_password) { setPwError(t('chpw.mismatch')); return; }
    setPwLoading(true);
    setPwError('');
    try {
      await authApi.changePassword({ current_password: pwForm.current_password, new_password: pwForm.new_password });
      setPwSuccess(true);
      setPwForm({ current_password: '', new_password: '', confirm_password: '' });
      setTimeout(() => setPwSuccess(false), 4000);
    } catch (err) {
      const code = err.response?.data?.error;
      if (code === 'WRONG_CURRENT_PASSWORD') setPwError(t('chpw.wrongCurrent'));
      else if (code === 'SAME_PASSWORD') setPwError(t('chpw.samePassword'));
      else setPwError(t('chpw.failed'));
    } finally {
      setPwLoading(false);
    }
  };

  // --- Eliminar cuenta ---
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleteOpen, setDeleteOpen]       = useState(false);
  const [deleting, setDeleting]           = useState(false);

  const handleDelete = async () => {
    if (deleteConfirm !== 'DELETE') return;
    setDeleting(true);
    try {
      await authApi.deleteAccount();
      logout();
      navigate('/login');
    } catch {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Navbar />

      <main className="pt-16 pb-12">
        <div className="max-w-xl mx-auto px-4 pt-6 flex flex-col gap-4">

          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {t('settings.title')}
            </h1>
            <Link to="/feed" className="text-brand text-sm font-medium hover:underline">
              {t('settings.backToFeed')}
            </Link>
          </div>

          {/* ── Seccion Cuenta ── */}
          <section className="card p-5 flex flex-col gap-5">
            <h2 className="font-semibold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wide border-b border-gray-100 dark:border-gray-700 pb-3">
              {t('settings.account')}
            </h2>

            {/* Cambiar nombre */}
            <div>
              <p className="font-semibold text-gray-800 dark:text-gray-200 mb-2">{t('settings.changeName')}</p>
              <form onSubmit={handleNameSave} className="flex gap-2">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setNameMsg(''); }}
                  placeholder={t('settings.nameLabel')}
                  className="input-field flex-1"
                  required
                />
                <button
                  type="submit"
                  disabled={nameSaving || !name.trim() || name.trim() === user?.name}
                  className="btn-primary px-4 py-2 text-sm"
                >
                  {nameSaving ? t('settings.nameSaving') : t('comment.save')}
                </button>
              </form>
              {nameMsg && (
                <p className={`text-sm mt-1.5 ${nameMsg.startsWith('Error') ? 'text-red-500' : 'text-green-600 dark:text-green-400'}`}>
                  {nameMsg}
                </p>
              )}
            </div>

            {/* Cambiar contrasena */}
            <div>
              <p className="font-semibold text-gray-800 dark:text-gray-200 mb-2">{t('chpw.title')}</p>
              {pwSuccess ? (
                <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg px-4 py-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-green-700 dark:text-green-400 text-sm font-medium">{t('chpw.success')}</p>
                </div>
              ) : (
                <form onSubmit={handlePwSubmit} className="flex flex-col gap-2">
                  <input
                    type="password"
                    name="current_password"
                    value={pwForm.current_password}
                    onChange={handlePwChange}
                    placeholder={t('chpw.currentPassword')}
                    autoComplete="current-password"
                    className="input-field"
                    required
                  />
                  <input
                    type="password"
                    name="new_password"
                    value={pwForm.new_password}
                    onChange={handlePwChange}
                    placeholder={t('chpw.newPassword')}
                    autoComplete="new-password"
                    className="input-field"
                    required
                  />
                  <input
                    type="password"
                    name="confirm_password"
                    value={pwForm.confirm_password}
                    onChange={handlePwChange}
                    placeholder={t('chpw.confirmPassword')}
                    autoComplete="new-password"
                    className="input-field"
                    required
                  />
                  {pwError && (
                    <p className="text-red-500 text-sm">{pwError}</p>
                  )}
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={pwLoading}
                      className="btn-primary text-sm py-2 px-5"
                    >
                      {pwLoading ? t('chpw.submitting') : t('chpw.submit')}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </section>

          {/* ── Seccion Apariencia ── */}
          <section className="card p-5">
            <h2 className="font-semibold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wide border-b border-gray-100 dark:border-gray-700 pb-3 mb-4">
              {t('settings.appearance')}
            </h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-800 dark:text-gray-200">{t('settings.darkMode')}</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">{t('settings.darkModeHint')}</p>
              </div>
              {/* Toggle switch */}
              <button
                onClick={toggleDark}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 dark:focus:ring-offset-gray-800
                            ${darkMode ? 'bg-brand' : 'bg-gray-300 dark:bg-gray-600'}`}
                role="switch"
                aria-checked={darkMode}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200
                              ${darkMode ? 'translate-x-6' : 'translate-x-1'}`}
                />
              </button>
            </div>
          </section>

          {/* ── Zona de peligro ── */}
          <section className="card p-5 border border-red-200 dark:border-red-800">
            <h2 className="font-semibold text-red-600 dark:text-red-400 text-sm uppercase tracking-wide border-b border-red-100 dark:border-red-900 pb-3 mb-4">
              {t('settings.danger')}
            </h2>

            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-gray-800 dark:text-gray-200">{t('settings.deleteAccount')}</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">{t('settings.deleteHint')}</p>
              </div>
              {!deleteOpen && (
                <button
                  onClick={() => setDeleteOpen(true)}
                  className="flex-shrink-0 px-4 py-2 rounded-lg border border-red-300 dark:border-red-700
                             text-red-600 dark:text-red-400 text-sm font-semibold
                             hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                >
                  {t('settings.deleteBtn')}
                </button>
              )}
            </div>

            {deleteOpen && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg flex flex-col gap-3">
                <p className="text-red-700 dark:text-red-300 text-sm font-medium">{t('settings.deleteConfirm')}</p>
                <input
                  type="text"
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  placeholder="DELETE"
                  className="input-field text-sm"
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => { setDeleteOpen(false); setDeleteConfirm(''); }}
                    className="px-4 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    {t('comment.no')}
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleteConfirm !== 'DELETE' || deleting}
                    className="px-4 py-2 rounded-lg text-sm bg-red-600 text-white font-semibold
                               hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    {deleting ? t('settings.deleting') : t('comment.yes')}
                  </button>
                </div>
              </div>
            )}
          </section>

        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
