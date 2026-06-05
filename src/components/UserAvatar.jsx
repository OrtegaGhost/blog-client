import { assetUrl } from '../services/api';

// Mapa de clases Tailwind segun el tamano del avatar
const SIZES = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
  xl: 'w-20 h-20 text-2xl',
};

/**
 * Muestra la foto de perfil del usuario o un circulo con sus iniciales como respaldo.
 * Las imagenes se cargan de forma diferida (lazy) para mejorar el rendimiento.
 *
 * @param {{ user: object, size?: 'sm'|'md'|'lg'|'xl' }} props
 */
const UserAvatar = ({ user, size = 'md' }) => {
  const clases    = SIZES[size] ?? SIZES.md;
  const photoUrl  = assetUrl(user?.profilePhoto);

  // Genera iniciales a partir del nombre completo (maximo 2 caracteres)
  const iniciales = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={user?.name || 'Usuario'}
        loading="lazy"
        decoding="async"
        className={`${clases} rounded-full object-cover flex-shrink-0 border-2 border-white`}
        onError={(e) => {
          // Si la imagen falla, oculta el elemento y deja que el componente padre maneje el fallback
          e.currentTarget.style.display = 'none';
        }}
      />
    );
  }

  return (
    <div
      className={`${clases} rounded-full bg-brand flex items-center justify-center
                  font-bold text-white flex-shrink-0 border-2 border-white select-none`}
    >
      {iniciales}
    </div>
  );
};

export default UserAvatar;
