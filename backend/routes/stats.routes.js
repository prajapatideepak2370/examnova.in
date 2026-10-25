import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import * as statsController from '../controllers/stats.controller.js';

const router = Router();

router.get('/dashboard', requireAuth, requireRole('admin', 'superadmin'), statsController.getDashboardStats);

export default router;
