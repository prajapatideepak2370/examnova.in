import Comment from '../models/Comment.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess, buildPaginationMeta } from '../utils/apiResponse.js';
import { parsePagination } from '../utils/pagination.js';

/** Public and always newest first. */
export const listComments = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 10, maxLimit: 50 });

  const [comments, total] = await Promise.all([
    Comment.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
    Comment.countDocuments(),
  ]);

  return sendSuccess(res, {
    message: 'Comments fetched',
    data: { comments },
    meta: buildPaginationMeta({ page, limit, total }),
  });
});

/**
 * The body has already been trimmed, length-checked and stripped of markup by
 * the validation chain, so it is stored as-is.
 */
export const createComment = asyncHandler(async (req, res) => {
  // Honeypot field: hidden from real visitors, so anything in it means a bot.
  // We answer as if it worked so automated posters do not learn to adapt.
  if (String(req.body.website || '').trim()) {
    return sendSuccess(res, {
      statusCode: 201,
      message: 'Comment posted',
      data: { comment: null },
    });
  }

  const comment = await Comment.create({ name: req.body.name, message: req.body.message });
  return sendSuccess(res, { statusCode: 201, message: 'Comment posted', data: { comment } });
});

/** Moderation: administrator only, enforced by the route middleware. */
export const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findByIdAndDelete(req.params.id);
  if (!comment) throw ApiError.notFound('Comment not found');

  return sendSuccess(res, { message: 'Comment deleted', data: { id: req.params.id } });
});
