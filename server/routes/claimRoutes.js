const express = require('express');
const claimController = require('../controllers/claimController');
const { authenticate } = require('../middleware/authMiddleware');
const { requireApprovedRecipient } = require('../middleware/approvedMiddleware');

const router = express.Router();

router.post('/donations/:donationId/claim', authenticate, requireApprovedRecipient, claimController.claimDonation);

module.exports = router;