import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { reviewsApi } from '../../api/reviewsApi.js';
import StarRating from '../common/StarRating.jsx';
import { Trash2, MessageSquareReply, CornerDownRight, Check, X } from 'lucide-react';

export default function ReviewCard({
  review,
  listingId,
  listingOwnerId,
  packageId,
  experienceId,
  creatorId,
  onReviewDeleted,
  onReplyUpdated,
}) {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const authorId = typeof review.author === 'object' ? review.author?._id : review.author;
  const authorName = typeof review.author === 'object' ? review.author?.username : 'Guest';

  const isReviewAuthor = user && authorId === user._id;
  const isHost = user && ((listingOwnerId && listingOwnerId === user._id) || (creatorId && creatorId === user._id) || user.role === 'admin');

  const handleDeleteReview = async () => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;

    try {
      setIsDeleting(true);
      if (experienceId) {
        await reviewsApi.deleteExperienceReview(experienceId, review._id);
      } else if (packageId) {
        await reviewsApi.deletePackageReview(packageId, review._id);
      } else {
        await reviewsApi.deleteReview(listingId, review._id);
      }
      showSuccess('Review deleted successfully.');
      if (onReviewDeleted) onReviewDeleted(review._id);
    } catch (err) {
      showError(err.response?.data?.error || err.message || 'Failed to delete review.');
      setIsDeleting(false);
    }
  };

  const handlePostReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    try {
      setIsSubmittingReply(true);
      let data;
      if (experienceId) {
        data = await reviewsApi.addExperienceReply(experienceId, review._id, {
          reply: { comment: replyText.trim() },
        });
      } else if (packageId) {
        data = await reviewsApi.addPackageReply(packageId, review._id, {
          reply: { comment: replyText.trim() },
        });
      } else {
        data = await reviewsApi.addReply(listingId, review._id, {
          reply: { comment: replyText.trim() },
        });
      }
      showSuccess(experienceId || packageId ? 'Host reply posted.' : 'Host reply posted.');
      setIsReplying(false);
      setReplyText('');
      if (onReplyUpdated) onReplyUpdated(review._id, data.ownerReply);
    } catch (err) {
      showError(err.response?.data?.error || err.message || 'Failed to post reply.');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleDeleteReply = async () => {
    if (!window.confirm('Remove your response?')) return;

    try {
      if (experienceId) {
        await reviewsApi.deleteExperienceReply(experienceId, review._id);
      } else if (packageId) {
        await reviewsApi.deletePackageReply(packageId, review._id);
      } else {
        await reviewsApi.deleteReply(listingId, review._id);
      }
      showSuccess('Response removed.');
      if (onReplyUpdated) onReplyUpdated(review._id, null);
    } catch (err) {
      showError(err.response?.data?.error || err.message || 'Failed to remove reply.');
    }
  };

  const formattedDate = review.createdAt
    ? new Date(review.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    : '';

  return (
    <div className="bg-white rounded-2xl p-5 border border-zinc-200/80 shadow-xs flex flex-col gap-3">
      {/* Reviewer Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#222222] text-white flex items-center justify-center font-bold text-sm">
            {authorName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h4 className="font-semibold text-sm text-[#222222]">{authorName}</h4>
            <p className="text-xs text-zinc-400">{formattedDate}</p>
          </div>
        </div>

        {/* Delete review button (Author only) */}
        {isReviewAuthor && (
          <button
            onClick={handleDeleteReview}
            disabled={isDeleting}
            className="p-1.5 text-zinc-400 hover:text-[#dc3545] rounded-full hover:bg-red-50 transition-colors cursor-pointer"
            title="Delete your review"
            aria-label="Delete review"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Star Rating */}
      <StarRating rating={review.rating || 5} size="xs" />

      {/* Comment Body */}
      <p className="text-sm text-zinc-700 leading-relaxed">{review.comment}</p>

      {/* Existing Host Response */}
      {review.ownerReply?.comment && (
        <div className="mt-2 pl-3 border-l-2 border-[#dc3545] bg-zinc-50 p-3 rounded-r-xl space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#dc3545] flex items-center gap-1">
              <CornerDownRight className="w-3.5 h-3.5" /> Response from Host
            </span>
            {isHost && (
              <button
                onClick={handleDeleteReply}
                className="text-zinc-400 hover:text-[#dc3545] text-[11px] underline"
              >
                Delete reply
              </button>
            )}
          </div>
          <p className="text-xs text-zinc-600 leading-normal">{review.ownerReply.comment}</p>
        </div>
      )}

      {/* Reply Action for Host */}
      {isHost && !review.ownerReply?.comment && !isReplying && (
        <div className="mt-1">
          <button
            onClick={() => setIsReplying(true)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#dc3545] hover:underline"
          >
            <MessageSquareReply className="w-3.5 h-3.5" /> Respond to review
          </button>
        </div>
      )}

      {/* Reply Input Form */}
      {isReplying && (
        <form onSubmit={handlePostReply} className="mt-2 space-y-2">
          <textarea
            rows={2}
            placeholder="Write a response as host..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className="w-full bg-zinc-50 border border-zinc-300 rounded-xl p-2.5 text-xs focus:outline-hidden focus:border-[#dc3545]"
            required
            autoFocus
          />
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setIsReplying(false);
                setReplyText('');
              }}
              className="text-xs text-zinc-500 hover:text-zinc-800 px-3 py-1.5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingReply}
              className="bg-[#222222] hover:bg-black text-white text-xs font-semibold px-4 py-1.5 rounded-full transition-colors cursor-pointer"
            >
              {isSubmittingReply ? 'Posting...' : 'Post Reply'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
