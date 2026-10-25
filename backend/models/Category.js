import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120, unique: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    description: { type: String, trim: true, maxlength: 600, default: '' },
    icon: { type: String, trim: true, default: 'book' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

categorySchema.set('toJSON', {
  transform: (_doc, ret) => ret,
});

export default mongoose.model('Category', categorySchema);
