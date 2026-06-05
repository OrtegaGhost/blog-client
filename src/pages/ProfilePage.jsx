import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth }    from '../context/AuthContext';
import { useI18n }   from '../context/I18nContext';
import { usersApi }  from '../services/api';
import { assetUrl }  from '../services/api';
import Navbar        from '../components/Navbar';
import CommentCard   from '../components/CommentCard';
import UserAvatar    from '../components/UserAvatar';

/**
 * Pagina de perfil de usuario — muestra foto, nombre, estadisticas y publicaciones.
 * Accesible en /profile/:username para cualquier usuario autenticado.
 */
const ProfilePage = () => {
  const { username }  = useParams();
  const { user: me }  = useAuth();
  const { t }         = useI18n();
  const navigate      = useNavigate();

  const [profile, setProfile]   = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

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

  // Actualiza el contenido de un comentario editado (raiz o respuesta)
  const editComment = useCallback((id, content) => {
    setComments((prev) => prev.map((c) => {
      if (c.id === id) return { ...c, content };
      if (c.replies?.some((r) => r.id === id)) {
        return { ...c, replies: c.replies.map((r) => r.id === id ? { ...r, content } : r) };
      }
      return c;
    }));
  }, []);

  // Elimina un comentario del estado local (raiz o respuesta)
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

  const isOwnProfile = me?.username === username;

  return (
    <div className="min-h-screen bg-gray-100">
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

              {/* Banner de color de marca */}
              <div className="h-32 bg-gradient-to-r from-brand to-blue-400" />

              {/* Foto de perfil superpuesta al banner */}
              <div className="relative px-6 pb-4">
                <div className="-mt-12 mb-3">
                  {profile.profilePhoto ? (
                    <img
                      src={assetUrl(profile.profilePhoto)}
                      alt={profile.name}
                      loading="lazy"
                      decoding="async"
                      className="w-24 h-24 rounded-full border-4 border-white object-cover shadow"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full border-4 border-white bg-brand/20
                                    flex items-center justify-center text-3xl font-bold text-brand shadow">
                      {profile.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 leading-tight">{profile.name}</h1>
                    <p className="text-gray-500 text-sm">@{profile.username}</p>
                  </div>
                  {isOwnProfile && (
                    <button
                      onClick={() => navigate('/change-password')}
                      className="btn-primary text-sm py-2 px-4"
                    >
                      {t('nav.changePassword')}
                    </button>
                  )}
                </div>

                {/* Estadisticas */}
                <div className="mt-4 flex gap-6 border-t border-gray-100 pt-4">
                  <div>
                    <p className="font-bold text-gray-900 text-lg leading-tight">{comments.length}</p>
                    <p className="text-gray-500 text-xs">{t('profile.posts')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Lista de publicaciones */}
            <h2 className="text-gray-700 font-semibold text-sm uppercase tracking-wide mb-3 px-1">
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
