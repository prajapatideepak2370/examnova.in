import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/error.js';
import { requireAuth } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiters.js';
import * as authController from '../controllers/auth.controller.js';

const router = Router();

const loginRules = [
  body('email').isEmail().withMessage('Enter a valid email address').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

router.post('/login', authLimiter, loginRules, validate, authController.login);
router.post('/logout', authController.logout);
router.get('/me', requireAuth, authController.getCurrentAdmin);

export default router;
