import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth }   from '../context/AuthContext';
import { useI18n }   from '../context/I18nContext';
import { usersApi, authApi, assetUrl } from '../services/api';
import Navbar        from '../components/Navbar';
import CommentCard   from '../components/CommentCard';

/**
 * Pagina de perfil de usuario — muestra foto, portada, nombre, estadisticas y publicaciones.
 * En el perfil propio permite cambiar foto de perfil y foto de portada.
 * Accesible en /profile/:username para cualquier usuario autenticado.
 */
const ProfilePage = () => {
  const { username }           = useParams();
  const { user: me, updateUser } = useAuth();
  const { t, lang }            = useI18n();
  const navigate               = useNavigate();

  const [profile, setProfile]   = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  const [photoUploading, setPhotoUploading]   = useState(false);
  const [coverUploading, setCoverUploading]   = useState(false);

  const photoInputRef = useRef(null);
  const coverInputRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    setError('');
    usersApi.getProfile(username)
      .then(({ data }) => {
        setProfile(data.user);
        setComments(data.comments);
      })
      .catch(() => setError('No se pudo cargar el perfil.'))
      .finally(() => setLoading(false));
  }, [username]);

  const editComment = useCallback((id, content) => {
    setComments((prev) => prev.map((c) => {
      if (c.id === id) return { ...c, content };
      if (c.replies?.some((r) => r.id === id)) {
        return { ...c, replies: c.replies.map((r) => r.id === id ? { ...r, content } : r) };
      }
      return c;
    }));
  }, []);

  const removeComment = useCallback((id, parentId) => {
    if (!parentId) {
      setComments((prev) => prev.filter((c) => c.id !== id));
    } else {
      setComments((prev) => prev.map((c) => {
        if (c.id !== parentId) return c;
        return { ...c, replies: (c.replies || []).filter((r) => r.id !== id) };
      }));
    }
  }, []);

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append('photo', file);
    setPhotoUploading(true);
    try {
      const { data } = await authApi.updateProfilePhoto(form);
      setProfile((prev) => ({ ...prev, profilePhoto: data.profilePhoto }));
      updateUser({ profilePhoto: data.profilePhoto });
    } catch { /* silenciar — el usuario puede reintentar */ }
    finally {
      setPhotoUploading(false);
      e.target.value = '';
    }
  };

  const handleCoverChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append('cover', file);
    setCoverUploading(true);
    try {
      const { data } = await authApi.updateCoverPhoto(form);
      setProfile((prev) => ({ ...prev, coverPhoto: data.coverPhoto }));
      updateUser({ coverPhoto: data.coverPhoto });
    } catch { /* silenciar */ }
    finally {
      setCoverUploading(false);
      e.target.value = '';
    }
  };

  const isOwnProfile = me?.username === username;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Navbar />

      <main className="pt-16 pb-8">

        {loading && (
          <div className="flex justify-center py-24">
            <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && !loading && (
          <div className="max-w-2xl mx-auto px-4 mt-8">
            <div className="card p-8 text-center">
              <p className="text-red-500">{error}</p>
              <button onClick={() => navigate(-1)} className="btn-primary mt-4 text-sm">
                Volver
              </button>
            </div>
          </div>
        )}

        {profile && !loading && (
          <div className="max-w-2xl mx-auto px-4">

            {/* Cabecera de perfil */}
            <div className="card overflow-hidden mb-4">

              {/* Portada — imagen o gradiente; boton de camara si es perfil propio */}
              <div className="relative h-36 group">
                {profile.coverPhoto ? (
                  <img
                    src={assetUrl(profile.coverPhoto)}
                    alt="cover"
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-brand to-blue-400" />
                )}
                {isOwnProfile && (
                  <>
                    <input
                      ref={coverInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handleCoverChange}
                    />
                    <button
                      onClick={() => coverInputRef.current?.click()}
                      disabled={coverUploading}
                      title={t('profile.changeCover')}
                      className="absolute bottom-2 right-2 flex items-center gap-1.5 bg-black/50
                                 hover:bg-black/70 text-white text-xs px-2.5 py-1.5 rounded-lg
                                 backdrop-blur-sm transition-colors disabled:opacity-50"
                    >
                      {coverUploading ? (
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                      {t('profile.changeCover')}
                    </button>
                  </>
                )}
              </div>

              {/* Foto de perfil superpuesta con boton de camara */}
              <div className="relative px-6 pb-4">
                <div className="-mt-12 mb-3 relative inline-block">
                  {profile.profilePhoto ? (
                    <img
                      src={assetUrl(profile.profilePhoto)}
                      alt={profile.name}
                      loading="lazy"
                      decoding="async"
                      className="w-24 h-24 rounded-full border-4 border-white object-cover shadow"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 bg-brand/20
                                    flex items-center justify-center text-3xl font-bold text-brand shadow">
                      {profile.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {isOwnProfile && (
                    <>
                      <input
                        ref={photoInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={handlePhotoChange}
                      />
                      <button
                        onClick={() => photoInputRef.current?.click()}
                        disabled={photoUploading}
                        title={t('profile.changePhoto')}
                        className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-gray-100
                                   border-2 border-white flex items-center justify-center
                                   hover:bg-gray-200 transition-colors shadow disabled:opacity-50"
                      >
                        {photoUploading ? (
                          <div className="w-3.5 h-3.5 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        )}
                      </button>
                    </>
                  )}
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 leading-tight">{profile.name}</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">@{profile.username}</p>
                  </div>
                  {isOwnProfile && (
                    <button
                      onClick={() => navigate('/settings')}
                      className="flex items-center gap-1.5 btn-secondary text-sm py-2 px-4"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {t('nav.settings')}
                    </button>
                  )}
                </div>

                {/* Estadisticas */}
                <div className="mt-4 flex gap-6 border-t border-gray-100 dark:border-gray-700 pt-4">
                  <div>
                    <p className="font-bold text-gray-900 dark:text-gray-100 text-lg leading-tight">{comments.length}</p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">{t('profile.posts')}</p>
                  </div>
                  {profile.createdAt && (
                    <div>
                      <p className="font-bold text-gray-900 dark:text-gray-100 text-lg leading-tight">
                        {new Date(profile.createdAt).toLocaleDateString(lang, { month: 'short', year: 'numeric' })}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400 text-xs">{t('feed.since')}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Lista de publicaciones */}
            <h2 className="text-gray-700 dark:text-gray-300 font-semibold text-sm uppercase tracking-wide mb-3 px-1">
              {t('profile.posts')}
            </h2>

            {comments.length === 0 && (
              <div className="card p-10 text-center">
                <p className="text-gray-400">{t('profile.noPosts')}</p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              {comments.map((comment) => (
                <CommentCard
                  key={comment.id}
                  comment={comment}
                  onCommentCreated={(reply) => {
                    setComments((prev) => prev.map((c) => {
                      if (c.id !== reply.parentId) return c;
                      if (c.replies?.some((r) => r.id === reply.id)) return c;
                      return { ...c, replies: [...(c.replies || []), reply] };
                    }));
                  }}
                  onCommentUpdated={editComment}
                  onCommentDeleted={removeComment}
                />
              ))}
            </div>

          </div>
        )}

      </main>
    </div>
  );
};

export default ProfilePage;
