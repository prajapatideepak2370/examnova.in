import Admin from '../models/Admin.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { signToken, setAuthCookie, clearAuthCookie } from '../middleware/auth.js';

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email: String(email).toLowerCase().trim() }).select('+passwordHash');

  // Generic message so the endpoint cannot be used to enumerate admin accounts.
  if (!admin || !(await admin.comparePassword(password))) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const token = signToken(admin);
  setAuthCookie(res, token);

  admin.lastLoginAt = new Date();
  await admin.save();

  return sendSuccess(res, {
    message: 'Signed in successfully',
    data: { admin: admin.toJSON(), token },
  });
});

export const logout = asyncHandler(async (_req, res) => {
  clearAuthCookie(res);
  return sendSuccess(res, { message: 'Signed out successfully', data: null });
});

export const getCurrentAdmin = asyncHandler(async (req, res) =>
  sendSuccess(res, { message: 'Authenticated', data: { admin: req.admin.toJSON() } })
);
