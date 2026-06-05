import { useState } from 'react';
import UserAvatar from './UserAvatar';
import { timeAgo } from '../utils/timeAgo';

/**
 * Displays a single blog comment — Facebook post card style.
 * @param {{ comment: object }} props
 */
const CommentCard = ({ comment }) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 12));

  const toggleLike = () => {
    setLiked((prev) => !prev);
    setLikeCount((prev) => liked ? prev - 1 : prev + 1);
  };

  return (
    <article className="card overflow-hidden">
      {/* ── Header ── */}
      <div className="flex items-center gap-3 p-4 pb-3">
        <UserAvatar user={comment.user} size="md" />
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 text-sm leading-tight truncate">
            {comment.user?.name}
          </p>
          <p className="text-gray-500 text-xs">
            @{comment.user?.username} · {timeAgo(comment.createdAt)}
          </p>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="px-4 pb-4">
        <p className="text-gray-800 text-[15px] leading-relaxed whitespace-pre-wrap break-words">
          {comment.content}
        </p>
      </div>

      {/* ── Reaction count ── */}
      {likeCount > 0 && (
        <div className="px-4 pb-2 flex items-center gap-1">
          <span className="inline-flex items-center justify-center w-5 h-5 bg-brand rounded-full text-xs">
            👍
          </span>
          <span className="text-gray-500 text-xs">{likeCount}</span>
        </div>
      )}

      {/* ── Divider ── */}
      <div className="border-t border-gray-100 mx-4" />

      {/* ── Action buttons ── */}
      <div className="flex px-2 py-1">
        <button
          onClick={toggleLike}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg
                      font-semibold text-sm transition-colors duration-150
                      ${liked
                        ? 'text-brand hover:bg-brand/10'
                        : 'text-gray-600 hover:bg-gray-100'
                      }`}
        >
          <svg className="w-5 h-5" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
          </svg>
          Like
        </button>

        <button
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg
                     text-gray-600 font-semibold text-sm hover:bg-gray-100 transition-colors duration-150"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Comment
        </button>
      </div>
    </article>
  );
};

export default CommentCard;
