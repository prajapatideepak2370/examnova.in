import { Router } from 'express';
import { body, param } from 'express-validator';
import { validate } from '../middleware/error.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import * as categoryController from '../controllers/category.controller.js';

const router = Router();

const adminOnly = [requireAuth, requireRole('admin', 'superadmin')];

const categoryRules = [
  body('name').trim().isLength({ min: 2, max: 120 }).withMessage('Category name must be 2 to 120 characters'),
  body('description').optional({ values: 'falsy' }).isLength({ max: 600 }).withMessage('Description is too long'),
  body('icon').optional({ values: 'falsy' }).isLength({ max: 40 }).withMessage('Icon key is too long'),
  body('order').optional().isInt({ min: 0 }).withMessage('Order must be a positive number'),
];

router.get('/', categoryController.listCategories);
router.get('/:id', param('id').isMongoId().withMessage('Invalid category id'), validate, categoryController.getCategory);

router.post('/', adminOnly, categoryRules, validate, categoryController.createCategory);
router.put(
  '/:id',
  adminOnly,
  [param('id').isMongoId().withMessage('Invalid category id'), ...categoryRules.map((rule) => rule.optional())],
  validate,
  categoryController.updateCategory
);
router.delete(
  '/:id',
  adminOnly,
  param('id').isMongoId().withMessage('Invalid category id'),
  validate,
  categoryController.deleteCategory
);

export default router;
