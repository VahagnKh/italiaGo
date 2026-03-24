import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useListings } from '../contexts/ListingContext';

interface ReviewsSectionProps {
  itemId: string;
  type: string;
}

const ReviewsSection: React.FC<ReviewsSectionProps> = ({ itemId, type }) => {
  const { t } = useLanguage();
  const { user, userData, fetchWithAuth, token } = useAuth();
  const { addReview } = useListings();
  const [reviews, setReviews] = useState<any[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchWithAuth(`/api/reviews/${itemId}?type=${type}`)
      .then(res => res.json())
      .then(data => setReviews(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, [itemId, type, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || !user) return;

    setIsSubmitting(true);
    try {
      const newReview = await addReview({
        listing_id: itemId,
        rating,
        comment,
        username: userData?.name || user.displayName || 'Anonymous'
      });
      setReviews(prev => [newReview, ...prev]);
      setComment('');
      setRating(5);
    } catch (error) {
      console.error('Failed to submit review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pt-6 border-t border-border">
      <h3 className="text-xl font-display text-ink">{t.reviews}</h3>
      
      {user && (
        <form onSubmit={handleSubmit} className="space-y-4 bg-paper/30 p-4 rounded-2xl">
          <h4 className="text-xs font-bold uppercase tracking-widest text-ink/40">{t.leaveReview}</h4>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(num => (
              <button
                key={num}
                type="button"
                onClick={() => setRating(num)}
                className={`p-1 transition-colors ${rating >= num ? 'text-gold' : 'text-ink/20'}`}
              >
                <Star size={20} fill={rating >= num ? 'currentColor' : 'none'} />
              </button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t.comment}
            className="w-full bg-card border-none rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-gold text-ink min-h-[100px]"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-luxury w-full py-2 text-xs disabled:opacity-50"
          >
            {isSubmitting ? '...' : t.submit}
          </button>
        </form>
      )}

      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
        {reviews.length === 0 ? (
          <p className="text-sm text-ink/40 italic">{t.noReviews}</p>
        ) : (
          reviews.map(review => (
            <div key={review.id} className="space-y-2 pb-4 border-b border-border last:border-0">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-ink">{review.userName || review.user_name}</span>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={10}
                      fill={review.rating > i ? 'currentColor' : 'none'}
                      className={review.rating > i ? 'text-gold' : 'text-ink/20'}
                    />
                  ))}
                </div>
              </div>
              <p className="text-xs text-ink/70 italic leading-relaxed">{review.comment}</p>
              <p className="text-[9px] text-ink/30 uppercase tracking-widest">
                {review.created_at ? new Date(review.created_at).toLocaleDateString() : 'Just now'}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewsSection;
