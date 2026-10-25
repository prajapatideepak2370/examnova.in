import rateLimit from 'express-rate-limit';

const jsonResponse = (message) => (_req, res) => {
  res.status(429).json({ success: false, message });
};

/** Broad limiter applied to the whole API surface. */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 600,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonResponse('Too many requests. Please try again in a few minutes.'),
});

/** Tight limiter for login attempts. */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonResponse('Too many sign-in attempts. Please wait 15 minutes and try again.'),
});

/** Stops comment spam while staying comfortable for genuine visitors. */
export const commentLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonResponse('You have already posted a few comments. Please wait a few minutes and try again.'),
});

/** Protects the upload endpoint from abuse. */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonResponse('Upload limit reached. Please try again later.'),
});
