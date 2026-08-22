const express = require('express');
const claimController = require('../controllers/claimController');
const { authenticate } = require('../middleware/authMiddleware');
const { requireApprovedRecipient } = require('../middleware/approvedMiddleware');
const { validate, schemas } = require('../middleware/validate');

const router = express.Router();

router.post('/donations/:donationId/claim', authenticate, requireApprovedRecipient, validate(schemas.claimDonation), claimController.claimDonation);

module.exports = router;