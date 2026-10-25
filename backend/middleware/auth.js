import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import ApiError from '../utils/ApiError.js';
import Admin from '../models/Admin.js';
import asyncHandler from '../utils/asyncHandler.js';

export const TOKEN_COOKIE = 'exam_portal_token';

export function signToken(admin) {
  return jwt.sign({ sub: String(admin._id), role: admin.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
}

export function setAuthCookie(res, token) {
  res.cookie(TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: env.cookieSecure ? 'none' : 'lax',
    secure: env.cookieSecure,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });
}

export function clearAuthCookie(res) {
  res.clearCookie(TOKEN_COOKIE, { path: '/' });
}

function extractToken(req) {
  if (req.cookies && req.cookies[TOKEN_COOKIE]) return req.cookies[TOKEN_COOKIE];
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) return header.slice(7).trim();
  return null;
}

/** Rejects the request unless a valid admin token is present. */
export const requireAuth = asyncHandler(async (req, _res, next) => {
  const token = extractToken(req);
  if (!token) throw ApiError.unauthorized('Please sign in to continue');

  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch {
    throw ApiError.unauthorized('Your session has expired. Please sign in again.');
  }

  const admin = await Admin.findById(payload.sub);
  if (!admin) throw ApiError.unauthorized('Account no longer exists');

  req.admin = admin;
  next();
});

/**
 * Attaches req.admin when a valid token is present but never blocks the request.
 * Used by public document routes so admins can preview unpublished drafts.
 */
export const optionalAuth = asyncHandler(async (req, _res, next) => {
  const token = extractToken(req);
  if (!token) return next();

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    const admin = await Admin.findById(payload.sub);
    if (admin) req.admin = admin;
  } catch {
    // Invalid or expired tokens are simply treated as anonymous visitors.
  }
  return next();
});

/** Role gate used on top of requireAuth. */
export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.admin) return next(ApiError.unauthorized());
    if (roles.length > 0 && !roles.includes(req.admin.role)) {
      return next(ApiError.forbidden(`This action requires one of these roles: ${roles.join(', ')}`));
    }
    return next();
  };
}
