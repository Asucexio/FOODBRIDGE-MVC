const express = require('express');
const rescueController = require('../controllers/rescueController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes for browsing rescue dispatch missions and stats
router.get('/', rescueController.getMissions);
router.get('/stats', rescueController.getStats);
router.get('/leaderboard', rescueController.getLeaderboard);
router.get('/:id', rescueController.getMissionById);

// Public / Semi-public actions for demo resilience
router.post('/', rescueController.createMission);
router.post('/:id/claim', rescueController.claimMission);
router.patch('/:id/status', rescueController.updateMissionStatus);

module.exports = router;
