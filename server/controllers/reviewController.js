const reviewService = require('../services/reviewService');

const parsePagination = (query) => ({
  page: parseInt(query.page, 10) || 1,
  limit: Math.min(parseInt(query.limit, 10) || 20, 50),
});

const createReview = async (req, res, next) => {
  try {
    const review = await reviewService.createReview(req.supabase, req.user, req.body);
    return res.status(201).json({
      success: true,
      data: review,
      message: 'Review posted successfully.',
    });
  } catch (error) {
    return next(error);
  }
};

const getUserReviews = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page, limit } = parsePagination(req.query);
    const result = await reviewService.getTargetUserReviews(req.supabase, userId, page, limit);

    return res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    return next(error);
  }
};

const getUserSummary = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const summary = await reviewService.getUserRatingSummary(req.supabase, userId);
    return res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    return next(error);
  }
};

const getCommunityReviews = async (req, res, next) => {
  try {
    const { page, limit } = parsePagination(req.query);
    const minRating = Number(req.query.minRating) || 0;
    const tag = req.query.tag || null;

    const result = await reviewService.getCommunityReviews(
      req.supabase,
      page,
      limit,
      minRating,
      tag
    );

    return res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    return next(error);
  }
};

const getGlobalSummary = async (req, res, next) => {
  try {
    const summary = await reviewService.getGlobalRatingSummary(req.supabase);
    return res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    return next(error);
  }
};

const getTags = (req, res) => {
  return res.json({
    success: true,
    data: reviewService.ALLOWED_TAGS,
  });
};

module.exports = {
  createReview,
  getUserReviews,
  getUserSummary,
  getCommunityReviews,
  getGlobalSummary,
  getTags,
};
