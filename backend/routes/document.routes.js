import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { validate } from '../middleware/error.js';
import { requireAuth, requireRole, optionalAuth } from '../middleware/auth.js';
import { uploadLimiter } from '../middleware/rateLimiters.js';
import { parseUpload, persistUploadedFile } from '../middleware/upload.js';
import * as documentController from '../controllers/document.controller.js';

const router = Router();

const adminOnly = [requireAuth, requireRole('admin', 'superadmin')];

const documentRules = [
  body('title').trim().isLength({ min: 5, max: 200 }).withMessage('Title must be 5 to 200 characters'),
  body('description').optional({ values: 'falsy' }).isLength({ max: 2000 }).withMessage('Description is too long'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('subject').optional({ values: 'falsy' }).isLength({ max: 120 }).withMessage('Subject is too long'),
  body('examination').optional({ values: 'falsy' }).isLength({ max: 120 }).withMessage('Examination is too long'),
  body('status').optional().isIn(['draft', 'published']).withMessage('Status must be draft or published'),
];

const listQueryRules = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive number'),
  query('limit').optional().isInt({ min: 1, max: 60 }).withMessage('Limit must be between 1 and 60'),
  query('fileType').optional().isIn(['pdf', 'doc', 'docx']).withMessage('Unsupported document type'),
  query('sort').optional().isIn(['newest', 'oldest', 'popular', 'title']).withMessage('Unsupported sort option'),
  query('from').optional({ values: 'falsy' }).isISO8601().withMessage('Invalid "from" date'),
  query('to').optional({ values: 'falsy' }).isISO8601().withMessage('Invalid "to" date'),
];

// ---- Public ----
router.get('/', listQueryRules, validate, documentController.listPublishedDocuments);
router.get('/admin', adminOnly, listQueryRules, validate, documentController.listAllDocuments);
router.get('/:idOrSlug', optionalAuth, documentController.getDocument);
router.get('/:idOrSlug/related', documentController.getRelatedDocuments);
router.post('/:idOrSlug/view', documentController.recordView);

// ---- Admin ----
router.post(
  '/',
  adminOnly,
  uploadLimiter,
  parseUpload,
  documentRules,
  body('file').custom((_value, { req }) => {
    if (!req.file) throw new Error('Attach a PDF, DOC or DOCX file to upload');
    return true;
  }),
  validate,
  persistUploadedFile,
  documentController.createDocument
);

router.put(
  '/:id',
  adminOnly,
  param('id').isMongoId().withMessage('Invalid document id'),
  uploadLimiter,
  parseUpload,
  [
    body('title').optional().trim().isLength({ min: 5, max: 200 }).withMessage('Title must be 5 to 200 characters'),
    body('description').optional({ values: 'falsy' }).isLength({ max: 2000 }).withMessage('Description is too long'),
    body('status').optional().isIn(['draft', 'published']).withMessage('Status must be draft or published'),
  ],
  validate,
  persistUploadedFile,
  documentController.updateDocument
);

router.patch(
  '/:id/status',
  adminOnly,
  [param('id').isMongoId().withMessage('Invalid document id'), body('status').isIn(['draft', 'published'])],
  validate,
  documentController.updateDocumentStatus
);

router.delete(
  '/:id',
  adminOnly,
  param('id').isMongoId().withMessage('Invalid document id'),
  validate,
  documentController.deleteDocument
);

export default router;
