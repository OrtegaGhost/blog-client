import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useAuth }  from '../context/AuthContext';
import { useI18n }  from '../context/I18nContext';
import UserAvatar   from './UserAvatar';
import { feedApi }  from '../services/api';

/**
 * Cuadro de creacion de comentarios estilo "En que estas pensando?".
 * Expone el metodo focus() mediante forwardRef para que componentes externos
 * (como CommentCard al hacer clic en "Comentar") puedan activarlo.
 *
 * @param {{ onCommentCreated: (comment: object) => void }} props
 */
const CreateCommentBox = forwardRef(({ onCommentCreated }, ref) => {
  const { user }   = useAuth();
  const { t }      = useI18n();
  const [content, setContent]   = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [expanded, setExpanded] = useState(false);

  const textareaRef  = useRef(null);
  const pendingFocus = useRef(false);  // indica si se debe enfocar tras expandir

  // Expone el metodo focus() al componente padre via ref
  useImperativeHandle(ref, () => ({
    focus: () => {
      pendingFocus.current = true;
      setExpanded(true);
    },
  }));

  // Cuando el cuadro se expande por solicitud externa, enfoca el textarea y hace scroll
  useEffect(() => {
    if (expanded && pendingFocus.current && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      pendingFocus.current = false;
    }
  }, [expanded]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await feedApi.createComment({ content: content.trim() });
      onCommentCreated(data.comment);
      setContent('');
      setExpanded(false);
    } catch (err) {
      const code = err.response?.data?.error;
      // Usa clave traducida si existe; si no, cae al mensaje generico
      setError(code && t(`err.${code}`) !== `err.${code}` ? t(`err.${code}`) : t('create.error'));
    } finally {
      setLoading(false);
    }
  };

  const placeholder = t('create.placeholder', { name: user?.name?.split(' ')[0] || '' });

  return (
    <div className="card p-4">

      {/* Fila principal: avatar + campo de texto */}
      <div className="flex items-center gap-3">
        <UserAvatar user={user} size="md" />

        {/* Boton colapsado — abre el textarea al hacer clic */}
        {!expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="flex-1 text-left bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors
                       rounded-full px-4 py-3 text-gray-500 dark:text-gray-400 text-[15px]"
          >
            {placeholder}
          </button>
        )}

        {/* Textarea expandido */}
        {expanded && (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            rows={3}
            maxLength={1000}
            className="flex-1 bg-transparent text-gray-900 dark:text-gray-100 text-[15px] resize-none
                       focus:outline-none placeholder-gray-400 dark:placeholder-gray-500 leading-relaxed"
          />
        )}
      </div>

      {/* Mensaje de error */}
      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}

      {/* Controles de envio — visibles solo cuando esta expandido */}
      {expanded && (
        <>
          <div className="border-t border-gray-100 dark:border-gray-700 my-3" />
          <div className="flex items-center justify-between">
            <span className="text-gray-400 dark:text-gray-500 text-xs">{content.length}/1000</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setExpanded(false); setContent(''); setError(''); }}
                className="btn-ghost text-sm py-1.5 px-4"
              >
                {t('create.cancel')}
              </button>
              <button
                onClick={handleSubmit}
                disabled={!content.trim() || loading}
                className="btn-primary text-sm py-1.5 px-5"
              >
                {loading ? t('create.posting') : t('create.post')}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
});

CreateCommentBox.displayName = 'CreateCommentBox';

export default CreateCommentBox;
