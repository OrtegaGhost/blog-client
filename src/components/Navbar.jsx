import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserAvatar from './UserAvatar';

/**
 * Top navigation bar — Facebook-style layout with yellow brand color.
 * Left: logo / brand name
 * Center: navigation tabs
 * Right: user info + logout
 */
const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-brand shadow-md fixed top-0 left-0 right-0 z-50 h-14">
      <div className="max-w-6xl mx-auto px-4 h-full flex items-center justify-between">

        {/* ── Left: Logo ── */}
        <Link to="/feed" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center">
            <span className="text-brand font-extrabold text-lg leading-none">B</span>
          </div>
          <span className="text-gray-900 font-extrabold text-xl hidden sm:block">Blog</span>
        </Link>

        {/* ── Center: Nav tabs ── */}
        <div className="flex items-center gap-1">
          <Link
            to="/feed"
            className="flex flex-col items-center px-8 py-2 rounded-lg
                       text-gray-800 hover:bg-black/10 transition-colors duration-150
                       border-b-4 border-gray-900 group"
          >
            {/* Home icon */}
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
          </Link>
        </div>

        {/* ── Right: User + logout ── */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {user && (
            <div className="hidden sm:flex items-center gap-2">
              <UserAvatar user={user} size="sm" />
              <span className="font-semibold text-gray-900 text-sm max-w-[120px] truncate">
                {user.name}
              </span>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center gap-1 bg-black/10 hover:bg-black/20
                       text-gray-900 font-semibold text-sm px-3 py-2 rounded-lg
                       transition-colors duration-150"
            title="Log out"
          >
            {/* Logout icon */}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="hidden sm:block">Log out</span>
          </button>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
