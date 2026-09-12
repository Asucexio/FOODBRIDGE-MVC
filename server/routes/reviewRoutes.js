const express = require('express');
const reviewController = require('../controllers/reviewController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes for community hub and summary viewing
router.get('/community', reviewController.getCommunityReviews);
router.get('/global-summary', reviewController.getGlobalSummary);
router.get('/tags', reviewController.getTags);
router.get('/user/:userId', reviewController.getUserReviews);
router.get('/summary/:userId', reviewController.getUserSummary);

// Protected routes for posting feedback
router.post('/', authenticate, reviewController.createReview);

module.exports = router;
