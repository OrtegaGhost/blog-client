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
          <div className="w-10 h-10 rounded-full overflow-hidden bg-white shadow-sm flex-shrink-0">
            <img src="/logo.png" alt="Blog's" className="w-full h-full object-cover" />
          </div>
        </Link>

        {/* ── Center: Nav tabs ── */}
        <div className="flex self-stretch items-stretch gap-1">
          <Link
            to="/feed"
            className="flex items-center justify-center px-8 sm:px-12 self-stretch
                       text-white hover:bg-white/10 transition-colors duration-150
                       border-b-4 border-white
                       [filter:drop-shadow(0_0_6px_rgba(255,255,255,0.5))]"
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

          {/* Settings */}
          <Link
            to="/settings"
            className="flex items-center gap-1 bg-white/15 hover:bg-white/25
                       text-white font-semibold text-sm px-3 py-2 rounded-lg
                       transition-colors duration-150"
            title={t('nav.settings')}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="hidden sm:block">{t('nav.settings')}</span>
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
