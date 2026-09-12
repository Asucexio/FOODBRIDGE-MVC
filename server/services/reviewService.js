const reviewModel = require('../models/reviewModel');
const notificationModel = require('../models/notificationModel');

const ALLOWED_TAGS = [
  'Fresh Food',
  'Punctual Pickup',
  'Well Packaged',
  'Friendly Communication',
  'Generous Portion',
  'Respectful Handling',
  'Clear Instructions',
  'Easy Handover',
];

const createReview = async (supabase, reviewerUser, payload) => {
  const rating = Number(payload.rating);
  if (isNaN(rating) || rating < 1 || rating > 5) {
    const error = new Error('Rating must be an integer between 1 and 5.');
    error.status = 400;
    throw error;
  }

  const tags = Array.isArray(payload.tags)
    ? payload.tags.filter((t) => typeof t === 'string' && t.trim().length > 0)
    : [];

  const reviewData = {
    author_id: reviewerUser.id,
    author_name: reviewerUser.user_metadata?.full_name || reviewerUser.email?.split('@')[0] || 'Community Hero',
    author_role: payload.author_role || (reviewerUser.user_metadata?.role === 'donor' ? 'donor' : 'recipient'),
    target_user_id: payload.target_user_id || 'community',
    target_name: payload.target_name || 'Community Partner',
    donation_id: payload.donation_id || null,
    donation_title: payload.donation_title || 'Food Donation',
    rating: Math.round(rating),
    tags,
    comment: (payload.comment || '').trim(),
  };

  const createdReview = await reviewModel.createReview(supabase, reviewData);

  // Send a congratulatory / feedback notification to the target user if target_user_id is specific
  if (payload.target_user_id && payload.target_user_id !== 'community' && payload.target_user_id !== reviewerUser.id) {
    try {
      await notificationModel.createNotification(supabase, {
        user_id: payload.target_user_id,
        title: `⭐ New ${createdReview.rating}-Star Review Received!`,
        message: `${reviewData.author_name} left you a ${createdReview.rating}-star review: "${createdReview.comment || createdReview.tags.join(', ') || 'Great handover!'}"`,
        type: 'info',
        link: '/reviews',
        metadata: { reviewId: createdReview.id, rating: createdReview.rating },
      });
    } catch (notifErr) {
      // Non-blocking notification failure
      console.warn('[ReviewService] Could not dispatch review notification:', notifErr.message);
    }
  }

  return createdReview;
};

const getTargetUserReviews = async (supabase, targetUserId, page = 1, limit = 20) => {
  return await reviewModel.getReviewsByTargetUser(supabase, targetUserId, page, limit);
};

const getCommunityReviews = async (supabase, page = 1, limit = 20, minRating = 0, tag = null) => {
  return await reviewModel.getCommunityReviews(supabase, page, limit, minRating, tag);
};

const getUserRatingSummary = async (supabase, targetUserId) => {
  return await reviewModel.getUserRatingSummary(supabase, targetUserId);
};

const getGlobalRatingSummary = async (supabase) => {
  return await reviewModel.getGlobalRatingSummary(supabase);
};

module.exports = {
  ALLOWED_TAGS,
  createReview,
  getTargetUserReviews,
  getCommunityReviews,
  getUserRatingSummary,
  getGlobalRatingSummary,
};
