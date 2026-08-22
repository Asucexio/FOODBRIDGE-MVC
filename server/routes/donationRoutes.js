const express = require('express');
const { body, query } = require('express-validator');
const donationController = require('../controllers/donationController');
const { authenticate, requireRole } = require('../middleware/authMiddleware');
const { requireApprovedRecipient } = require('../middleware/approvedMiddleware');
const { upload, handleMulterError } = require('../middleware/uploadMiddleware');
const { uploadLimiter } = require('../middleware/rateLimiter');
const { validateRequest } = require('../middleware/validateRequest');
const { validate, schemas } = require('../middleware/validate');

const router = express.Router();

const donationValidation = [
  body('food_name').trim().notEmpty().withMessage('Food name is required.')
    .isLength({ max: 100 }).withMessage('Food name must be less than 100 characters.'),
  body('description').optional().trim().isLength({ max: 500 }),
  body('category').optional().trim().isLength({ max: 50 }),
  body('quantity').trim().notEmpty().withMessage('Quantity is required.')
    .isLength({ max: 50 }),
  body('pickup_location').trim().notEmpty().withMessage('Pickup location is required.')
    .isLength({ max: 200 }),
  body('pickup_deadline').optional().isISO8601().withMessage('Invalid date format.'),
  validateRequest,
];

const paginationValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer.'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50.'),
  query('category').optional().trim().isLength({ max: 50 }),
  query('search').optional().trim().isLength({ max: 100 }),
  validateRequest,
];

router.get('/browse', authenticate, requireApprovedRecipient, paginationValidation, donationController.browseDonations);
router.get('/my-donations', authenticate, requireRole('donor'), paginationValidation, donationController.getMyDonations);
router.get('/:id', authenticate, validate(schemas.donationId), donationController.getDonationDetails);
router.post('/', authenticate, requireRole('donor'), uploadLimiter, upload.single('image'), handleMulterError, donationValidation, donationController.createDonation);
router.patch('/:id', authenticate, requireRole('donor'), uploadLimiter, upload.single('image'), handleMulterError, validate(schemas.donationId), donationValidation, donationController.updateDonation);
router.delete('/:id', authenticate, requireRole('donor'), validate(schemas.donationId), donationController.deleteDonation);

module.exports = router;