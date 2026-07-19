/**
 * ReviewCard — Product review display component
 */
import { useState } from 'react';
import { Star, ThumbsUp, CheckCircle, Flag } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function ReviewCard({ review, onUpdate }) {
  const { isLoggedIn } = useAuth();
  const [helpful, setHelpful] = useState(review.helpfulCount || 0);
  const [voted, setVoted] = useState(false);

  const handleHelpful = async () => {
    if (!isLoggedIn) return;
    try {
      const { data } = await api.post(`/reviews/${review._id}/helpful`);
      setHelpful(data.helpfulCount);
      setVoted(data.voted);
    } catch { /* silent */ }
  };

  const stars = Array.from({ length: 5 }, (_, i) => (
    <Star key={i} className="w-4 h-4" fill={i < review.rating ? '#f59e0b' : 'none'} stroke={i < review.rating ? '#f59e0b' : 'var(--pb-border)'} />
  ));

  const timeAgo = (date) => {
    const days = Math.floor((Date.now() - new Date(date)) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 30) return `${days} days ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return `${Math.floor(days / 365)} years ago`;
  };

  return (
    <div className="rounded-xl border p-4" style={{ backgroundColor: 'var(--pb-surface)', borderColor: 'var(--pb-border)' }}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
            style={{ backgroundColor: 'var(--pb-accent)' }}>
            {review.user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <p className="text-sm font-semibold">{review.user?.name || 'Anonymous'}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="flex">{stars}</div>
              {review.verifiedPurchase && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-green-600">
                  <CheckCircle className="w-3 h-3" /> Verified Purchase
                </span>
              )}
            </div>
          </div>
        </div>
        <span className="text-xs" style={{ color: 'var(--pb-text-secondary)' }}>{timeAgo(review.createdAt)}</span>
      </div>

      {review.title && <p className="text-sm font-bold mt-3">{review.title}</p>}
      {review.comment && <p className="text-sm mt-1" style={{ color: 'var(--pb-text-secondary)' }}>{review.comment}</p>}

      {/* Seller Reply */}
      {review.reply?.comment && (
        <div className="mt-3 ml-4 pl-3 border-l-2 rounded" style={{ borderColor: 'var(--pb-accent)' }}>
          <p className="text-xs font-bold" style={{ color: 'var(--pb-accent)' }}>Seller Response</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--pb-text-secondary)' }}>{review.reply.comment}</p>
        </div>
      )}

      <div className="flex items-center gap-4 mt-3">
        <button onClick={handleHelpful} className={`flex items-center gap-1.5 text-xs font-medium transition-all ${voted ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
          style={{ color: voted ? 'var(--pb-accent)' : 'var(--pb-text-secondary)' }}>
          <ThumbsUp className="w-3.5 h-3.5" fill={voted ? 'currentColor' : 'none'} />
          Helpful ({helpful})
        </button>
      </div>
    </div>
  );
}
