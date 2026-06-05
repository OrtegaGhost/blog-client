import { createContext, useContext, useState, useCallback } from 'react';

const LANG_KEY = 'blog_lang';

const translations = {
  en: {
    'nav.logout': 'Log out',
    'nav.home': 'Home Feed',
    'login.tagline': 'Connect with friends and share your thoughts with the world.',
    'login.username': 'Username',
    'login.password': 'Password',
    'login.forgotPassword': 'Forgot password?',
    'login.submit': 'Log In',
    'login.submitting': 'Logging in…',
    'login.createAccount': 'Create new account',
    'login.or': 'or',
    'login.error': 'Something went wrong. Try again.',
    'register.title': 'Create a new account',
    'register.subtitle': "It's quick and easy.",
    'register.fullName': 'Full name',
    'register.email': 'Email address',
    'register.username': 'Username (letters, numbers, _)',
    'register.password': 'Password (min 8 chars, 1 upper, 1 number)',
    'register.uploadPhoto': 'Upload profile photo',
    'register.photoSelected': 'Photo selected ✓',
    'register.photoHint': 'JPEG, PNG or WebP · max 5 MB',
    'register.photoRequired': 'Profile photo is required.',
    'register.submit': 'Sign Up',
    'register.submitting': 'Creating account…',
    'register.alreadyHave': 'Already have an account? Log in',
    'register.failed': 'Registration failed. Please check your data.',
    'feed.latest': 'Latest',
    'feed.noComments': 'No comments yet',
    'feed.noCommentsHint': 'Be the first to share something!',
    'feed.retry': 'Retry',
    'feed.errorLoad': 'Could not load the feed. Please refresh.',
    'feed.myComments': 'Comments',
    'feed.totalPosts': 'Total posts',
    'feed.homeFeed': 'Home Feed',
    'comment.like': 'Like',
    'comment.comment': 'Comment',
    'create.placeholder': "What's on your mind, {name}?",
    'create.cancel': 'Cancel',
    'create.post': 'Post',
    'create.posting': 'Posting…',
    'create.error': 'Could not post comment. Try again.',
    'chpw.title': 'Change Password',
    'chpw.subtitle': 'Enter your current password and choose a new one.',
    'chpw.currentPassword': 'Current password',
    'chpw.newPassword': 'New password (min 8 chars, 1 upper, 1 number)',
    'chpw.confirmPassword': 'Confirm new password',
    'chpw.submit': 'Change Password',
    'chpw.submitting': 'Saving…',
    'chpw.mismatch': 'New passwords do not match.',
    'chpw.failed': 'Password change failed. Please try again.',
    'chpw.success': 'Password changed successfully!',
    'chpw.redirecting': 'Redirecting to feed…',
    'chpw.backToFeed': '← Back to feed',
    'nav.changePassword': 'Change password',
  },
  es: {
    'nav.logout': 'Salir',
    'nav.home': 'Feed principal',
    'login.tagline': 'Conecta con amigos y comparte tus pensamientos con el mundo.',
    'login.username': 'Usuario',
    'login.password': 'Contraseña',
    'login.forgotPassword': '¿Olvidaste tu contraseña?',
    'login.submit': 'Iniciar sesión',
    'login.submitting': 'Iniciando sesión…',
    'login.createAccount': 'Crear cuenta nueva',
    'login.or': 'o',
    'login.error': 'Algo salió mal. Intenta de nuevo.',
    'register.title': 'Crea una cuenta nueva',
    'register.subtitle': 'Es rápido y fácil.',
    'register.fullName': 'Nombre completo',
    'register.email': 'Correo electrónico',
    'register.username': 'Usuario (letras, números, _)',
    'register.password': 'Contraseña (mín. 8 chars, 1 mayúscula, 1 número)',
    'register.uploadPhoto': 'Subir foto de perfil',
    'register.photoSelected': 'Foto seleccionada ✓',
    'register.photoHint': 'JPEG, PNG o WebP · máx. 5 MB',
    'register.photoRequired': 'La foto de perfil es obligatoria.',
    'register.submit': 'Registrarse',
    'register.submitting': 'Creando cuenta…',
    'register.alreadyHave': '¿Ya tienes cuenta? Inicia sesión',
    'register.failed': 'Registro fallido. Verifica tus datos.',
    'feed.latest': 'Más recientes',
    'feed.noComments': 'Sin comentarios aún',
    'feed.noCommentsHint': '¡Sé el primero en compartir algo!',
    'feed.retry': 'Reintentar',
    'feed.errorLoad': 'No se pudo cargar el feed. Recarga la página.',
    'feed.myComments': 'Comentarios',
    'feed.totalPosts': 'Total de posts',
    'feed.homeFeed': 'Feed principal',
    'comment.like': 'Me gusta',
    'comment.comment': 'Comentar',
    'create.placeholder': '¿Qué piensas, {name}?',
    'create.cancel': 'Cancelar',
    'create.post': 'Publicar',
    'create.posting': 'Publicando…',
    'create.error': 'No se pudo publicar. Intenta de nuevo.',
    'chpw.title': 'Cambiar contraseña',
    'chpw.subtitle': 'Ingresa tu contraseña actual y elige una nueva.',
    'chpw.currentPassword': 'Contraseña actual',
    'chpw.newPassword': 'Nueva contraseña (mín. 8 chars, 1 mayúscula, 1 número)',
    'chpw.confirmPassword': 'Confirmar nueva contraseña',
    'chpw.submit': 'Cambiar contraseña',
    'chpw.submitting': 'Guardando…',
    'chpw.mismatch': 'Las contraseñas nuevas no coinciden.',
    'chpw.failed': 'No se pudo cambiar la contraseña. Intenta de nuevo.',
    'chpw.success': '¡Contraseña cambiada correctamente!',
    'chpw.redirecting': 'Redirigiendo al feed…',
    'chpw.backToFeed': '← Volver al feed',
    'nav.changePassword': 'Cambiar contraseña',
  },
};

const I18nContext = createContext(null);

export const I18nProvider = ({ children }) => {
  const [lang, setLangState] = useState(
    () => localStorage.getItem(LANG_KEY) || 'es'
  );

  const setLang = (l) => {
    localStorage.setItem(LANG_KEY, l);
    setLangState(l);
  };

  const toggleLang = useCallback(() => {
    setLang(lang === 'en' ? 'es' : 'en');
  }, [lang]);

  const t = useCallback((key, vars = {}) => {
    let str = translations[lang]?.[key] ?? translations.en[key] ?? key;
    Object.entries(vars).forEach(([k, v]) => {
      str = str.replace(`{${k}}`, v);
    });
    return str;
  }, [lang]);

  return (
    <I18nContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
};
