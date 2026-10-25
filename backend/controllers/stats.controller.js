import Document from '../models/Document.js';
import Question from '../models/Question.js';
import Category from '../models/Category.js';
import Admin from '../models/Admin.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';

/** GET /api/stats/dashboard – admin dashboard counters and highlights. */
export const getDashboardStats = asyncHandler(async (_req, res) => {
  const [
    totalDocuments,
    publishedDocuments,
    draftDocuments,
    totalQuestions,
    totalCategories,
    totalAdmins,
    viewsAgg,
  ] = await Promise.all([
    Document.countDocuments({}),
    Document.countDocuments({ status: 'published' }),
    Document.countDocuments({ status: 'draft' }),
    Question.countDocuments({}),
    Category.countDocuments({}),
    Admin.countDocuments({}),
    Document.aggregate([{ $group: { _id: null, total: { $sum: '$viewCount' } } }]),
  ]);

  const [recentDocuments, topDocuments, byCategory, byFileType] = await Promise.all([
    Document.find()
      .populate('category', 'name slug icon')
      .sort({ createdAt: -1 })
      .limit(5),
    Document.find({ status: 'published' })
      .populate('category', 'name slug icon')
      .sort({ viewCount: -1 })
      .limit(5),
    Document.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 }, views: { $sum: '$viewCount' } } },
      { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          categoryId: '$_id',
          name: { $ifNull: ['$category.name', 'Uncategorised'] },
          slug: { $ifNull: ['$category.slug', ''] },
          count: 1,
          views: 1,
        },
      },
      { $sort: { count: -1 } },
    ]),
    Document.aggregate([{ $group: { _id: '$fileType', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
  ]);

  return sendSuccess(res, {
    message: 'Dashboard statistics fetched',
    data: {
      totals: {
        documents: totalDocuments,
        published: publishedDocuments,
        drafts: draftDocuments,
        questions: totalQuestions,
        categories: totalCategories,
        admins: totalAdmins,
        views: viewsAgg[0]?.total || 0,
      },
      recentDocuments,
      topDocuments,
      byCategory,
      byFileType: byFileType.map((row) => ({ fileType: row._id, count: row.count })),
    },
  });
});
