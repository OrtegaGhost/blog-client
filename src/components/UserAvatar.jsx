import { assetUrl } from '../services/api';

/**
 * Displays a user's profile photo or a fallback circle with their initials.
 * @param {{ user: object, size?: 'sm'|'md'|'lg'|'xl' }} props
 */
const UserAvatar = ({ user, size = 'md' }) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-20 h-20 text-2xl',
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  const photoUrl = assetUrl(user?.profilePhoto);

  return photoUrl ? (
    <img
      src={photoUrl}
      alt={user?.name || 'User'}
      className={`${sizes[size]} rounded-full object-cover flex-shrink-0 border-2 border-white`}
      onError={(e) => { e.target.style.display = 'none'; }}
    />
  ) : (
    <div
      className={`${sizes[size]} rounded-full bg-brand flex items-center justify-center
                  font-bold text-gray-900 flex-shrink-0 border-2 border-white select-none`}
    >
      {initials}
    </div>
  );
};

export default UserAvatar;
