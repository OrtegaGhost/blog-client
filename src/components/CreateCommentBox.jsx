import { useState } from 'react';
import { useAuth }  from '../context/AuthContext';
import { useI18n }  from '../context/I18nContext';
import UserAvatar   from './UserAvatar';
import { feedApi }  from '../services/api';

/**
 * "What's on your mind?" style comment creation box.
 * @param {{ onCommentCreated: (comment: object) => void }} props
 */
const CreateCommentBox = ({ onCommentCreated }) => {
  const { user }   = useAuth();
  const { t }      = useI18n();
  const [content, setContent]   = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [expanded, setExpanded] = useState(false);

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
      setError(err.response?.data?.message || t('create.error'));
    } finally {
      setLoading(false);
    }
  };

  const placeholder = t('create.placeholder', { name: user?.name?.split(' ')[0] || '' });

  return (
    <div className="card p-4">
      {/* ── Input row ── */}
      <div className="flex items-center gap-3">
        <UserAvatar user={user} size="md" />
        <button
          onClick={() => setExpanded(true)}
          className={`flex-1 text-left bg-gray-100 hover:bg-gray-200 transition-colors
                      rounded-full px-4 py-3 text-gray-500 text-[15px]
                      ${expanded ? 'hidden' : 'block'}`}
        >
          {placeholder}
        </button>

        {expanded && (
          <textarea
            autoFocus
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            rows={3}
            maxLength={1000}
            className="flex-1 bg-transparent text-gray-900 text-[15px] resize-none
                       focus:outline-none placeholder-gray-400 leading-relaxed"
          />
        )}
      </div>

      {/* ── Error ── */}
      {error && (
        <p className="text-red-500 text-sm mt-2 ml-13">{error}</p>
      )}

      {/* ── Divider + actions ── */}
      {expanded && (
        <>
          <div className="border-t border-gray-100 my-3" />
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-xs">{content.length}/1000</span>
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
};

export default CreateCommentBox;
