import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    message: { type: String, required: true, trim: true, maxlength: 1000 },
  },
  { timestamps: true }
);

// Comments are always read newest first.
commentSchema.index({ createdAt: -1 });

commentSchema.set('toJSON', {
  transform: (_doc, ret) => ret,
});

export default mongoose.model('Comment', commentSchema);
