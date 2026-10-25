import mongoose from 'mongoose';
import Category from '../models/Category.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess, buildPaginationMeta } from '../utils/apiResponse.js';

/** Resolves a category identifier that may be an ObjectId, slug or exact name. */
export async function resolveCategoryId(value) {
  if (!value) return null;
  if (mongoose.isValidObjectId(value)) {
    const byId = await Category.findById(value);
    if (byId) return byId._id;
  }

  const bySlugOrName = await Category.findOne({
    $or: [
      { slug: String(value).toLowerCase().trim() },
      { name: new RegExp(`^${String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
    ],
  });
  return bySlugOrName ? bySlugOrName._id : null;
}

export const listCategories = asyncHandler(async (_req, res) => {
  const categories = await Category.aggregate([
    { $sort: { order: 1, name: 1 } },
    {
      $lookup: {
        from: 'documents',
        let: { categoryId: '$_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$category', '$$categoryId'] }, status: 'published' } },
          { $count: 'count' },
        ],
        as: 'publishedStat',
      },
    },
    {
      $addFields: {
        documentCount: { $ifNull: [{ $first: '$publishedStat.count' }, 0] },
      },
    },
    { $project: { publishedStat: 0 } },
  ]);

  return sendSuccess(res, {
    message: 'Categories fetched',
    data: { categories },
    meta: { total: categories.length },
  });
});

export const getCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw ApiError.notFound('Category not found');
  return sendSuccess(res, { message: 'Category fetched', data: { category } });
});

export const createCategory = asyncHandler(async (req, res) => {
  const { name, description = '', icon = 'book', order = 0 } = req.body;

  const slug = String(name).toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-');
  const exists = await Category.findOne({ $or: [{ slug }, { name }] });
  if (exists) throw ApiError.conflict('A category with this name already exists');

  const category = await Category.create({ name, slug, description, icon, order });
  return sendSuccess(res, { statusCode: 201, message: 'Category created', data: { category } });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw ApiError.notFound('Category not found');

  const { name, description, icon, order } = req.body;
  if (name && name !== category.name) {
    const slug = String(name).toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-');
    const clash = await Category.findOne({ slug, _id: { $ne: category._id } });
    if (clash) throw ApiError.conflict('Another category already uses this name');
    category.name = name;
    category.slug = slug;
  }
  if (description !== undefined) category.description = description;
  if (icon !== undefined) category.icon = icon;
  if (order !== undefined) category.order = order;

  await category.save();
  return sendSuccess(res, { message: 'Category updated', data: { category } });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw ApiError.notFound('Category not found');

  const { default: Document } = await import('../models/Document.js');
  const linked = await Document.countDocuments({ category: category._id });
  if (linked > 0) {
    throw ApiError.conflict(
      `This category still has ${linked} document(s). Move or delete them before removing the category.`
    );
  }

  await category.deleteOne();
  return sendSuccess(res, { message: 'Category deleted', data: { id: req.params.id } });
});
