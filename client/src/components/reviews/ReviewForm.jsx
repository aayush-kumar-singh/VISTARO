import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { reviewsApi } from '../../api/reviewsApi.js';
import StarRating from '../common/StarRating.jsx';

export default function ReviewForm({ listingId, packageId, experienceId, onReviewAdded }) {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isPackage = Boolean(packageId);
  const isExperience = Boolean(experienceId);

  if (!user) {
    return (
      <div className="bg-vistaro-secondary border border-vistaro-border rounded-2xl p-5 text-center transition-colors duration-200">
        <h4 className="text-sm font-semibold text-vistaro-primary mb-1">Leave a Review</h4>
        <p className="text-xs text-vistaro-secondary mb-3">
          {isExperience
            ? 'Please sign in with your account to review this host-led experience.'
            : isPackage
              ? 'Please sign in with your explorer account to review this tour package.'
              : 'Please sign in to share your stay experience with future guests.'}
        </p>
        <a
          href="/login"
          className="inline-block bg-vistaro-accent hover:bg-vistaro-accent-hover text-white text-xs font-bold py-2 px-5 rounded-full transition-colors cursor-pointer"
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
      let data;
      if (experienceId) {
        data = await reviewsApi.createExperienceReview(experienceId, {
          review: { rating, comment: comment.trim() },
        });
      } else if (packageId) {
        data = await reviewsApi.createPackageReview(packageId, {
          review: { rating, comment: comment.trim() },
        });
      } else {
        data = await reviewsApi.createReview(listingId, {
          review: { rating, comment: comment.trim() },
        });
      }

      showSuccess(data.message || 'Thank you! Your review has been submitted.');
      setComment('');
      setRating(5);
      if (onReviewAdded) onReviewAdded(data.review);
    } catch (err) {
      showError(err.response?.data?.error || err.message || 'Failed to submit review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-vistaro-surface rounded-3xl p-6 border border-vistaro-border shadow-sm space-y-4 transition-colors duration-200">
      <h3 className="font-bold text-base text-vistaro-primary">Leave a Review</h3>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-vistaro-muted mb-1.5">
          Rating ({rating} of 5 stars)
        </label>
        <StarRating rating={rating} size="md" interactive onChange={setRating} />
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-vistaro-muted mb-1.5">
          Your Experience
        </label>
        <textarea
          rows={3}
          placeholder="What did you love about this place? How was the location and host communication?"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full bg-vistaro-secondary border border-vistaro-border text-vistaro-primary rounded-2xl p-3.5 text-sm focus:outline-hidden focus:border-vistaro-accent transition-colors placeholder:text-vistaro-muted"
          required
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-vistaro-accent hover:bg-vistaro-accent-hover text-white text-xs font-bold py-3 px-6 rounded-full transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
      >
        {isSubmitting ? 'Submitting Review...' : 'Submit Review'}
      </button>
    </form>
  );
}
