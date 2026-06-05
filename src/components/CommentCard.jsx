import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import UserAvatar  from './UserAvatar';
import { timeAgo } from '../utils/timeAgo';
import { useI18n } from '../context/I18nContext';
import { useAuth } from '../context/AuthContext';
import { feedApi } from '../services/api';

// Clave de localStorage para persistir likes entre recargas
const LS_LIKES_KEY = 'blog_liked_comments';

const getLikedMap = () => {
  try { return JSON.parse(localStorage.getItem(LS_LIKES_KEY) || '{}'); }
  catch { return {}; }
};

const saveLikedMap = (map) => {
  localStorage.setItem(LS_LIKES_KEY, JSON.stringify(map));
};

/**
 * Tarjeta de una publicacion individual — estilo Facebook.
 * - Likes persistidos en localStorage.
 * - Boton "Comentar" abre respuesta inline.
 * - Edicion y borrado disponibles solo para el autor.
 *
 * @param {{
 *   comment: object,
 *   onCommentCreated: (c: object) => void,
 *   onCommentUpdated: (id: string, content: string) => void,
 *   onCommentDeleted: (id: string, parentId: string|null) => void
 * }} props
 */
const CommentCard = ({ comment, onCommentCreated, onCommentUpdated, onCommentDeleted }) => {
  const { t, lang }   = useI18n();
  const { user: me }  = useAuth();
  const isOwner       = me?.id === comment.user?.id;

  // Likes — persistidos en localStorage
  const [liked, setLiked] = useState(() => !!getLikedMap()[comment.id]);
  const [likes, setLikes] = useState(() => getLikedMap()[comment.id] ? 1 : 0);

  // Respuesta inline
  const [showReply, setShowReply]       = useState(false);
  const [replyText, setReplyText]       = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  const [replyError, setReplyError]     = useState('');

  // Edicion inline
  const [editing, setEditing]         = useState(false);
  const [editText, setEditText]       = useState(comment.content);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError]     = useState('');

  // Confirmacion de borrado
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const replyRef    = useRef(null);
  const editRef     = useRef(null);
  const replyFocus  = useRef(false);
  const editFocus   = useRef(false);

  useEffect(() => {
    if (showReply && replyFocus.current && replyRef.current) {
      replyRef.current.focus();
      replyFocus.current = false;
    }
  }, [showReply]);

  useEffect(() => {
    if (editing && editFocus.current && editRef.current) {
      editRef.current.focus();
      editFocus.current = false;
    }
  }, [editing]);

  // Sincroniza el texto de edicion si el comentario fue editado externamente (via socket)
  useEffect(() => {
    if (!editing) setEditText(comment.content);
  }, [comment.content, editing]);

  const toggleLike = () => {
    const newLiked = !liked;
    setLiked(newLiked);
    setLikes((prev) => prev + (newLiked ? 1 : -1));
    const map = getLikedMap();
    if (newLiked) { map[comment.id] = true; } else { delete map[comment.id]; }
    saveLikedMap(map);
  };

  const handleCommentBtn = () => {
    setShowReply((prev) => {
      if (!prev) replyFocus.current = true;
      return !prev;
    });
    setReplyError('');
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    const content = replyText.trim();
    if (!content) return;
    setReplyLoading(true);
    setReplyError('');
    try {
      const { data } = await feedApi.createComment({ content, parentId: comment.id });
      onCommentCreated?.(data.comment);
      setReplyText('');
      setShowReply(false);
    } catch (err) {
      const code = err.response?.data?.error;
      setReplyError(code && t(`err.${code}`) !== `err.${code}` ? t(`err.${code}`) : t('create.error'));
    } finally {
      setReplyLoading(false);
    }
  };

  const handleEditOpen = () => {
    setEditText(comment.content);
    setEditError('');
    setConfirmDelete(false);
    editFocus.current = true;
    setEditing(true);
  };

  const handleEditCancel = () => {
    setEditing(false);
    setEditError('');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const content = editText.trim();
    if (!content || content === comment.content) { setEditing(false); return; }
    setEditLoading(true);
    setEditError('');
    try {
      await feedApi.updateComment(comment.id, content);
      onCommentUpdated?.(comment.id, content);
      setEditing(false);
    } catch (err) {
      const code = err.response?.data?.error;
      setEditError(code && t(`err.${code}`) !== `err.${code}` ? t(`err.${code}`) : t('create.error'));
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await feedApi.deleteComment(comment.id);
      onCommentDeleted?.(comment.id, comment.parentId ?? null);
    } catch {
      setConfirmDelete(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleReplyKeyDown  = (e) => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handleReplySubmit(e); };
  const handleEditKeyDown   = (e) => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handleEditSubmit(e); };

  return (
    <article className="card overflow-hidden">

      {/* Cabecera: avatar, nombre, tiempo y menu de opciones */}
      <div className="flex items-center gap-3 p-4 pb-3">
        <Link to={`/profile/${comment.user?.username}`}>
          <UserAvatar user={comment.user} size="md" />
        </Link>
        <div className="min-w-0 flex-1">
          <Link
            to={`/profile/${comment.user?.username}`}
            className="font-semibold text-gray-900 text-sm leading-tight truncate hover:underline"
          >
            {comment.user?.name}
          </Link>
          <p className="text-gray-500 text-xs">
            @{comment.user?.username} · {timeAgo(comment.createdAt, lang)}
          </p>
        </div>

        {/* Menu de edicion/borrado — solo visible para el autor */}
        {isOwner && !editing && (
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={handleEditOpen}
              className="p-1.5 rounded-lg text-gray-400 hover:text-brand hover:bg-brand/10 transition-colors"
              title={t('comment.edit')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => { setConfirmDelete(true); setEditing(false); }}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              title={t('comment.delete')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Confirmacion de borrado */}
      {confirmDelete && (
        <div className="mx-4 mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between gap-3">
          <p className="text-red-600 text-sm font-medium">{t('comment.deleteConfirm')}</p>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => setConfirmDelete(false)}
              className="px-3 py-1 text-sm rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            >
              {t('comment.no')}
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteLoading}
              className="px-3 py-1 text-sm rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
            >
              {deleteLoading ? '…' : t('comment.yes')}
            </button>
          </div>
        </div>
      )}

      {/* Contenido — modo lectura o edicion */}
      {editing ? (
        <form onSubmit={handleEditSubmit} className="px-4 pb-3 flex flex-col gap-2">
          <textarea
            ref={editRef}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={handleEditKeyDown}
            rows={3}
            placeholder={t('comment.editPlaceholder')}
            disabled={editLoading}
            className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2
                       text-sm text-gray-800 placeholder-gray-400 outline-none
                       focus:border-brand focus:ring-2 focus:ring-brand/20
                       disabled:opacity-50 transition"
          />
          {editError && <p className="text-red-500 text-xs">{editError}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={handleEditCancel}
              className="px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors">
              {t('create.cancel')}
            </button>
            <button type="submit" disabled={editLoading || !editText.trim()}
              className="btn-primary py-1.5 px-4 text-sm disabled:opacity-50">
              {editLoading ? '…' : t('comment.save')}
            </button>
          </div>
        </form>
      ) : (
        <div className="px-4 pb-4">
          <p className="text-gray-800 text-[15px] leading-relaxed whitespace-pre-wrap break-words">
            {comment.content}
          </p>
        </div>
      )}

      {/* Contador de likes */}
      {likes > 0 && (
        <div className="px-4 pb-2 flex items-center gap-1">
          <span className="inline-flex items-center justify-center w-5 h-5 bg-brand rounded-full text-xs">👍</span>
          <span className="text-gray-500 text-xs">{likes}</span>
        </div>
      )}

      {/* Separador */}
      <div className="border-t border-gray-100 mx-4" />

      {/* Botones de accion */}
      <div className="flex px-2 py-1">
        <button
          onClick={toggleLike}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg
                      font-semibold text-sm transition-colors duration-150
                      ${liked ? 'text-brand hover:bg-brand/10' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          <svg className="w-5 h-5" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
          </svg>
          {t('comment.like')}
        </button>

        <button
          onClick={handleCommentBtn}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg
                      font-semibold text-sm transition-colors duration-150
                      ${showReply ? 'text-brand hover:bg-brand/10' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          {t('comment.comment')}
        </button>
      </div>

      {/* Respuestas anidadas */}
      {comment.replies?.length > 0 && (
        <div className="border-t border-gray-100 divide-y divide-gray-50">
          {comment.replies.map((reply) => (
            <div key={reply.id} className="flex gap-2 px-4 py-2.5">
              <Link to={`/profile/${reply.user?.username}`} className="flex-shrink-0">
                <UserAvatar user={reply.user} size="sm" />
              </Link>
              <div className="flex-1 min-w-0 bg-gray-100 rounded-2xl px-3 py-2">
                <p className="font-semibold text-gray-900 text-xs leading-tight">
                  <Link to={`/profile/${reply.user?.username}`} className="hover:underline">
                    {reply.user?.name}
                  </Link>
                  <span className="font-normal text-gray-400 ml-2">{timeAgo(reply.createdAt, lang)}</span>
                </p>
                <p className="text-gray-800 text-sm leading-snug mt-0.5 whitespace-pre-wrap break-words">
                  {reply.content}
                </p>
              </div>
              {/* Borrado de respuesta propia */}
              {me?.id === reply.user?.id && (
                <button
                  onClick={() => { feedApi.deleteComment(reply.id).then(() => onCommentDeleted?.(reply.id, reply.parentId)); }}
                  className="flex-shrink-0 self-start p-1 text-gray-300 hover:text-red-400 transition-colors"
                  title={t('comment.delete')}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Panel de respuesta inline */}
      {showReply && (
        <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
          <form onSubmit={handleReplySubmit} className="flex flex-col gap-2">
            <textarea
              ref={replyRef}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={handleReplyKeyDown}
              rows={2}
              placeholder={t('comment.replyPlaceholder')}
              disabled={replyLoading}
              className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2
                         text-sm text-gray-800 placeholder-gray-400 outline-none
                         focus:border-brand focus:ring-2 focus:ring-brand/20
                         disabled:opacity-50 transition"
            />
            {replyError && <p className="text-red-500 text-xs">{replyError}</p>}
            <div className="flex justify-end gap-2">
              <button type="button"
                onClick={() => { setShowReply(false); setReplyText(''); setReplyError(''); }}
                className="px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-200 transition-colors">
                {t('create.cancel')}
              </button>
              <button type="submit" disabled={replyLoading || !replyText.trim()}
                className="btn-primary py-1.5 px-4 text-sm disabled:opacity-50">
                {replyLoading ? t('create.posting') : t('create.post')}
              </button>
            </div>
          </form>
        </div>
      )}

    </article>
  );
};

export default CommentCard;
