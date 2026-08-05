const express = require('express');
const multer = require('multer');
const donationController = require('../controllers/donationController');
const { authenticate, requireRole } = require('../middleware/authMiddleware');
const { requireApprovedRecipient } = require('../middleware/approvedMiddleware');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.get('/browse', authenticate, requireApprovedRecipient, donationController.browseDonations);
router.get('/my-donations', authenticate, requireRole('donor'), donationController.getMyDonations);
router.get('/:id', authenticate, donationController.getDonationDetails);
router.post('/', authenticate, requireRole('donor'), upload.single('image'), donationController.createDonation);
router.patch('/:id', authenticate, requireRole('donor'), upload.single('image'), donationController.updateDonation);
router.delete('/:id', authenticate, requireRole('donor'), donationController.deleteDonation);

module.exports = router;