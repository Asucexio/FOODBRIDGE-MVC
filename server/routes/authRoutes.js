const express = require('express');
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');
const { validate, schemas } = require('../middleware/validate');

const router = express.Router();

router.post('/register', validate(schemas.register), authController.register);
router.post('/login', validate(schemas.login), authController.login);
router.get('/me', authenticate, authController.me);
router.patch('/profile', authenticate, validate(schemas.updateProfile), authController.updateProfile);
router.post('/change-password', authenticate, validate(schemas.changePassword), authController.changePassword);

module.exports = router;