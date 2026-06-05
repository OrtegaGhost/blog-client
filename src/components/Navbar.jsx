import { Link, useNavigate } from 'react-router-dom';
import { useAuth }  from '../context/AuthContext';
import { useI18n }  from '../context/I18nContext';
import UserAvatar   from './UserAvatar';

/**
 * Top navigation bar — Facebook-style with brand blue background.
 * Left: logo  |  Center: nav tabs  |  Right: user + language toggle + logout
 */
const Navbar = () => {
  const { user, logout }       = useAuth();
  const { lang, toggleLang, t } = useI18n();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-brand shadow-md fixed top-0 left-0 right-0 z-50 h-14">
      <div className="max-w-6xl mx-auto px-4 h-full flex items-center justify-between">

        {/* ── Left: Logo ── */}
        <Link to="/feed" className="flex items-center flex-shrink-0">
          <div className="bg-white rounded-lg px-2 py-1">
            <img src="/logo.png" alt="Blog's" className="h-9 w-auto" />
          </div>
        </Link>

        {/* ── Center: Nav tabs ── */}
        <div className="flex items-center gap-1">
          <Link
            to="/feed"
            className="flex flex-col items-center px-6 sm:px-8 py-2 rounded-lg
                       text-white hover:bg-white/10 transition-colors duration-150
                       border-b-4 border-white"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
          </Link>
        </div>

        {/* ── Right: User + language + logout ── */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {user && (
            <Link
              to={`/profile/${user.username}`}
              className="hidden sm:flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white/10 transition-colors"
              title={t('nav.profile')}
            >
              <UserAvatar user={user} size="sm" />
              <span className="font-semibold text-white text-sm max-w-[120px] truncate">
                {user.name}
              </span>
            </Link>
          )}

          {/* Language toggle */}
          <button
            onClick={toggleLang}
            className="flex items-center gap-1 bg-white/15 hover:bg-white/25
                       text-white font-semibold text-sm px-3 py-2 rounded-lg
                       transition-colors duration-150"
            title="Switch language"
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
            <span className="uppercase text-xs font-bold">{lang === 'en' ? 'EN' : 'ES'}</span>
          </button>

          {/* Change password */}
          <Link
            to="/change-password"
            className="flex items-center gap-1 bg-white/15 hover:bg-white/25
                       text-white font-semibold text-sm px-3 py-2 rounded-lg
                       transition-colors duration-150"
            title={t('nav.changePassword')}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="hidden sm:block">{t('nav.changePassword')}</span>
          </Link>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 bg-white/15 hover:bg-white/25
                       text-white font-semibold text-sm px-3 py-2 rounded-lg
                       transition-colors duration-150"
            title={t('nav.logout')}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="hidden sm:block">{t('nav.logout')}</span>
          </button>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
