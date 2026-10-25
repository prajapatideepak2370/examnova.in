import { Router } from 'express';
import { body, param } from 'express-validator';
import { validate } from '../middleware/error.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { commentLimiter } from '../middleware/rateLimiters.js';
import { sanitizePlainText } from '../utils/sanitizeText.js';
import * as commentController from '../controllers/comment.controller.js';

const router = Router();

const adminOnly = [requireAuth, requireRole('admin', 'superadmin')];

// Sanitising before validating means markup is stripped first, so a comment
// made only of tags ("<b></b>") is correctly rejected as empty.
const commentRules = [
  body('name')
    .customSanitizer(sanitizePlainText)
    .isLength({ min: 2, max: 60 })
    .withMessage('Please enter a name between 2 and 60 characters'),
  body('message')
    .customSanitizer(sanitizePlainText)
    .isLength({ min: 3, max: 1000 })
    .withMessage('Please write a comment between 3 and 1000 characters'),
  // Honeypot – must stay empty. Never shown to real visitors.
  body('website').optional({ values: 'falsy' }).isLength({ max: 100 }),
];

router.get('/', commentController.listComments);
router.post('/', commentLimiter, commentRules, validate, commentController.createComment);
router.delete(
  '/:id',
  adminOnly,
  param('id').isMongoId().withMessage('Invalid comment id'),
  validate,
  commentController.deleteComment
);

export default router;
