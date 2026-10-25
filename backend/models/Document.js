import mongoose from 'mongoose';

export const DOCUMENT_TYPES = ['pdf', 'doc', 'docx'];
export const DOCUMENT_STATUSES = ['draft', 'published'];

const documentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    description: { type: String, trim: true, maxlength: 2000, default: '' },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    subject: { type: String, trim: true, maxlength: 120, default: '', index: true },
    examination: { type: String, trim: true, maxlength: 120, default: '', index: true },

    fileUrl: { type: String, required: true },
    filePath: { type: String, required: true },
    originalName: { type: String, required: true },
    fileType: { type: String, enum: DOCUMENT_TYPES, required: true },
    mimeType: { type: String, default: '' },
    fileSize: { type: Number, required: true },

    // Generated preview (PDF) used by the online viewer. For PDF uploads this equals fileUrl.
    previewUrl: { type: String, default: '' },
    // Student-facing explanation shown when a Word file could not be converted for preview.
    previewError: { type: String, default: '' },
    thumbnailUrl: { type: String, default: '' },
    pageCount: { type: Number, default: 0 },

    tags: { type: [String], default: [] },
    status: { type: String, enum: DOCUMENT_STATUSES, default: 'draft', index: true },
    allowDownload: { type: Boolean, default: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
    viewCount: { type: Number, default: 0, min: 0 },
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

documentSchema.index({ status: 1, createdAt: -1 });
documentSchema.index({ title: 1 });

documentSchema.virtual('canPreview').get(function canPreview() {
  return Boolean(this.previewUrl);
});

documentSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    // Storage internals never leave the server.
    delete ret.filePath;
    return ret;
  },
});

export default mongoose.model('Document', documentSchema);
