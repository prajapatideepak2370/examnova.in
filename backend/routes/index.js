import { Router } from 'express';
import mongoose from 'mongoose';
import authRoutes from './auth.routes.js';
import documentRoutes from './document.routes.js';
import categoryRoutes from './category.routes.js';
import commentRoutes from './comment.routes.js';
import statsRoutes from './stats.routes.js';

const router = Router();

router.get('/health', (_req, res) => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  res.json({
    success: true,
    message: 'API is running',
    data: {
      uptime: Math.round(process.uptime()),
      database: states[mongoose.connection.readyState] || 'unknown',
      timestamp: new Date().toISOString(),
    },
  });
});

router.use('/auth', authRoutes);
router.use('/documents', documentRoutes);
router.use('/categories', categoryRoutes);
router.use('/comments', commentRoutes);
router.use('/stats', statsRoutes);

export default router;
