import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { reviewsApi } from '../../api/reviewsApi.js';
import StarRating from '../common/StarRating.jsx';

export default function ReviewForm({ listingId, onReviewAdded }) {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) {
    return (
      <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5 text-center">
        <h4 className="text-sm font-semibold text-zinc-800 mb-1">Leave a Review</h4>
        <p className="text-xs text-zinc-500 mb-3">Please sign in to share your stay experience with future guests.</p>
        <a
          href="/login"
          className="inline-block bg-[#222222] hover:bg-black text-white text-xs font-bold py-2 px-5 rounded-full transition-colors"
        >
          Log In to Review
        </a>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      showError('Please write a comment for your review.');
      return;
    }

    try {
      setIsSubmitting(true);
      const data = await reviewsApi.createReview(listingId, {
        review: {
          rating,
          comment: comment.trim(),
        },
      });

      showSuccess('Thank you! Your review has been submitted.');
      setComment('');
      setRating(5);
      if (onReviewAdded) onReviewAdded(data.review);
    } catch (err) {
      showError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm space-y-4">
      <h3 className="font-bold text-base text-zinc-900">Leave a Review</h3>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
          Rating ({rating} of 5 stars)
        </label>
        <StarRating rating={rating} size="md" interactive onChange={setRating} />
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
          Your Experience
        </label>
        <textarea
          rows={3}
          placeholder="What did you love about this place? How was the location and host communication?"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl p-3.5 text-sm focus:outline-hidden focus:border-[#dc3545] transition-colors placeholder:text-zinc-400"
          required
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-[#dc3545] hover:bg-[#b02a37] text-white text-xs font-bold py-3 px-6 rounded-full transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
      >
        {isSubmitting ? 'Submitting Review...' : 'Submit Review'}
      </button>
    </form>
  );
}
