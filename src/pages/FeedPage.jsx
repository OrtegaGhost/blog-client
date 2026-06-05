import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { feedApi } from '../services/api';
import useSocket from '../hooks/useSocket';
import Navbar from '../components/Navbar';
import CommentCard from '../components/CommentCard';
import CreateCommentBox from '../components/CreateCommentBox';
import UserAvatar from '../components/UserAvatar';

/**
 * Main feed page — Facebook timeline layout.
 * Left sidebar: user profile card
 * Center: comment list with real-time updates via Socket.io
 */
const FeedPage = () => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading]  = useState(true);
  const [error, setError]      = useState('');

  // Add incoming real-time comments to the top of the feed
  const handleNewComment = useCallback((comment) => {
    setComments((prev) => {
      // Avoid duplicates in case the POST response already added it
      if (prev.some((c) => c.id === comment.id)) return prev;
      return [comment, ...prev];
    });
  }, []);

  useSocket(handleNewComment, true);

  useEffect(() => {
    feedApi.getComments()
      .then(({ data }) => setComments(data.comments))
      .catch(() => setError('Could not load the feed. Please refresh.'))
      .finally(() => setLoading(false));
  }, []);

  const handleCommentCreated = (comment) => {
    setComments((prev) => {
      if (prev.some((c) => c.id === comment.id)) return prev;
      return [comment, ...prev];
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      {/* Push content below fixed navbar */}
      <main className="pt-16 pb-8">
        <div className="max-w-5xl mx-auto px-4 flex gap-4 items-start">

          {/* ── Left sidebar ── */}
          <aside className="hidden md:flex flex-col gap-2 w-72 flex-shrink-0 sticky top-20">

            {/* User profile card */}
            <div className="card p-4 flex flex-col items-center text-center gap-3">
              <UserAvatar user={user} size="xl" />
              <div>
                <p className="font-bold text-gray-900 text-lg leading-tight">{user?.name}</p>
                <p className="text-gray-500 text-sm">@{user?.username}</p>
              </div>
              <div className="w-full border-t border-gray-100 pt-3">
                <div className="flex justify-around text-center">
                  <div>
                    <p className="font-bold text-gray-900 text-lg">{comments.filter(c => c.user?.id === user?.id).length}</p>
                    <p className="text-gray-500 text-xs">Comments</p>
                  </div>
                  <div className="border-l border-gray-100" />
                  <div>
                    <p className="font-bold text-gray-900 text-lg">{comments.length}</p>
                    <p className="text-gray-500 text-xs">Total posts</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation links */}
            <div className="card p-3">
              <Link
                to="/feed"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg
                           hover:bg-gray-100 transition-colors duration-150"
              >
                <span className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                  </svg>
                </span>
                <span className="font-medium text-gray-800">Home Feed</span>
              </Link>
            </div>

          </aside>

          {/* ── Main feed ── */}
          <section className="flex-1 flex flex-col gap-3 min-w-0">

            {/* Create comment box */}
            <CreateCommentBox onCommentCreated={handleCommentCreated} />

            {/* Feed label */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-300" />
              <span className="text-gray-500 text-xs font-medium uppercase tracking-wide">Latest</span>
              <div className="flex-1 h-px bg-gray-300" />
            </div>

            {/* Loading state */}
            {loading && (
              <div className="flex justify-center py-12">
                <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {/* Error state */}
            {error && !loading && (
              <div className="card p-6 text-center">
                <p className="text-red-500">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="btn-primary mt-3 text-sm"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Empty state */}
            {!loading && !error && comments.length === 0 && (
              <div className="card p-10 text-center">
                <p className="text-4xl mb-3">💬</p>
                <p className="text-gray-700 font-semibold text-lg">No comments yet</p>
                <p className="text-gray-400 text-sm mt-1">Be the first to share something!</p>
              </div>
            )}

            {/* Comment list */}
            {!loading && comments.map((comment) => (
              <CommentCard key={comment.id} comment={comment} />
            ))}

          </section>

        </div>
      </main>
    </div>
  );
};

export default FeedPage;
