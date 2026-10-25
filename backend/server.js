import path from 'path';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import env from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/db.js';
import apiRoutes from './routes/index.js';
import { generalLimiter } from './middleware/rateLimiters.js';
import { notFoundHandler, errorHandler } from './middleware/error.js';
import { ensureUploadsDir } from './services/storage.service.js';

const app = express();

app.disable('x-powered-by');

// Behind a reverse proxy in production; left unset locally so rate limiting sees real clients.
if (env.nodeEnv === 'production') app.set('trust proxy', 1);

const allowedOrigins = env.clientUrl
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`Origin ${origin} is not allowed by the CORS policy`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

if (env.nodeEnv !== 'production') {
  app.use(morgan('dev'));
}

/**
 * Uploaded study material is served read-only. `nosniff` plus an explicit
 * Content-Disposition prevents a malicious file from being interpreted or executed,
 * and compression/SSI are disabled on this path.
 */
app.use(
  '/uploads',
  express.static(env.uploadsDir, {
    index: false,
    dotfiles: 'deny',
    setHeaders(res, filePath) {
      const ext = path.extname(filePath).toLowerCase();
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
      res.setHeader('Content-Disposition', ext === '.pdf' ? 'inline' : 'attachment');
    },
  })
);

app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'Government Exam Study Portal API',
    data: { version: '1.0.0', docs: '/api/health' },
  });
});

app.use('/api', generalLimiter, apiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

async function start() {
  ensureUploadsDir();
  await connectDatabase();

  const server = app.listen(env.port, () => {
    console.log(`[server] listening on http://localhost:${env.port} (${env.nodeEnv})`);
    console.log(`[server] accepting requests from ${allowedOrigins.join(', ') || 'no configured origins'}`);
  });

  const shutdown = async (signal) => {
    console.log(`\n[server] ${signal} received, shutting down`);
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start().catch((err) => {
  console.error('[startup] failed:', err.message);
  process.exit(1);
});

export default app;
