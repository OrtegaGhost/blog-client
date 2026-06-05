import { useState, useEffect, useCallback, useRef } from 'react';
import { Link }         from 'react-router-dom';
import { useAuth }      from '../context/AuthContext';
import { useI18n }      from '../context/I18nContext';
import { feedApi }      from '../services/api';
import useSocket        from '../hooks/useSocket';
import Navbar           from '../components/Navbar';
import CommentCard      from '../components/CommentCard';
import CreateCommentBox from '../components/CreateCommentBox';
import UserAvatar       from '../components/UserAvatar';

/**
 * Pagina principal del feed — diseno de dos columnas estilo Facebook.
 * Columna izquierda: tarjeta de perfil del usuario (solo escritorio).
 * Columna central: lista de comentarios con actualizaciones en tiempo real via Socket.io.
 */
const FeedPage = () => {
  const { user }  = useAuth();
  const { t }     = useI18n();
  const [comments, setComments] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [errorKey, setErrorKey] = useState('');

  // Referencia al cuadro de creacion global de la seccion principal
  const createBoxRef = useRef(null);

  // Agrega un comentario nuevo — raiz o respuesta anidada
  const addComment = useCallback((comment) => {
    if (!comment.parentId) {
      setComments((prev) => {
        if (prev.some((c) => c.id === comment.id)) return prev;
        return [comment, ...prev];
      });
    } else {
      setComments((prev) => prev.map((c) => {
        if (c.id !== comment.parentId) return c;
        if (c.replies?.some((r) => r.id === comment.id)) return c;
        return { ...c, replies: [...(c.replies || []), comment] };
      }));
    }
  }, []);

  // Actualiza el contenido de un comentario (raiz o respuesta)
  const editComment = useCallback((id, content) => {
    setComments((prev) => prev.map((c) => {
      if (c.id === id) return { ...c, content };
      if (c.replies?.some((r) => r.id === id)) {
        return { ...c, replies: c.replies.map((r) => r.id === id ? { ...r, content } : r) };
      }
      return c;
    }));
  }, []);

  // Elimina un comentario del estado (raiz o respuesta)
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

  // Escucha eventos en tiempo real del servidor
  useSocket({ onNew: addComment, onUpdated: (c) => editComment(c.id, c.content), onDeleted: ({ id, parentId }) => removeComment(id, parentId) }, true);

  // Carga inicial de comentarios al montar el componente
  useEffect(() => {
    feedApi.getComments()
      .then(({ data }) => setComments(data.comments))
      .catch(() => setErrorKey('feed.errorLoad'))
      .finally(() => setLoading(false));
  }, []);

  const myCount = comments.filter((c) => c.user?.id === user?.id).length;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      {/* Empuja el contenido por debajo de la barra fija */}
      <main className="pt-16 pb-8">
        <div className="max-w-5xl mx-auto px-4 flex gap-4 items-start">

          {/* Barra lateral izquierda — solo visible en escritorio */}
          <aside className="hidden md:flex flex-col gap-2 w-72 flex-shrink-0 sticky top-20">

            {/* Tarjeta de perfil del usuario autenticado */}
            <div className="card p-4 flex flex-col items-center text-center gap-3">
              <UserAvatar user={user} size="xl" />
              <div>
                <p className="font-bold text-gray-900 text-lg leading-tight">{user?.name}</p>
                <p className="text-gray-500 text-sm">@{user?.username}</p>
              </div>
              <div className="w-full border-t border-gray-100 pt-3">
                <div className="flex justify-around text-center">
                  <div>
                    <p className="font-bold text-gray-900 text-lg">{myCount}</p>
                    <p className="text-gray-500 text-xs">{t('feed.myComments')}</p>
                  </div>
                  <div className="border-l border-gray-100" />
                  <div>
                    <p className="font-bold text-gray-900 text-lg">{comments.length}</p>
                    <p className="text-gray-500 text-xs">{t('feed.totalPosts')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Enlace de navegacion al feed principal */}
            <div className="card p-3">
              <Link
                to="/feed"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg
                           hover:bg-gray-100 transition-colors duration-150"
              >
                <span className="w-9 h-9 bg-brand/10 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-brand" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                  </svg>
                </span>
                <span className="font-medium text-gray-800">{t('feed.homeFeed')}</span>
              </Link>
            </div>

          </aside>

          {/* Seccion principal del feed */}
          <section className="flex-1 flex flex-col gap-3 min-w-0">

            {/* Cuadro de creacion — ref expone el metodo focus() */}
            <CreateCommentBox ref={createBoxRef} onCommentCreated={addComment} />

            {/* Etiqueta separadora */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-300" />
              <span className="text-gray-500 text-xs font-medium uppercase tracking-wide">
                {t('feed.latest')}
              </span>
              <div className="flex-1 h-px bg-gray-300" />
            </div>

            {/* Estado de carga */}
            {loading && (
              <div className="flex justify-center py-12">
                <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {/* Estado de error con boton de reintento */}
            {errorKey && !loading && (
              <div className="card p-6 text-center">
                <p className="text-red-500">{t(errorKey)}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="btn-primary mt-3 text-sm"
                >
                  {t('feed.retry')}
                </button>
              </div>
            )}

            {/* Estado vacio */}
            {!loading && !errorKey && comments.length === 0 && (
              <div className="card p-10 text-center">
                <p className="text-4xl mb-3">💬</p>
                <p className="text-gray-700 font-semibold text-lg">{t('feed.noComments')}</p>
                <p className="text-gray-400 text-sm mt-1">{t('feed.noCommentsHint')}</p>
              </div>
            )}

            {/* Lista de comentarios */}
            {!loading && comments.map((comment) => (
              <CommentCard
                key={comment.id}
                comment={comment}
                onCommentCreated={addComment}
                onCommentUpdated={editComment}
                onCommentDeleted={removeComment}
              />
            ))}

          </section>

        </div>
      </main>
    </div>
  );
};

export default FeedPage;
