import mongoose from 'mongoose';

export const DIFFICULTY_LEVELS = ['easy', 'medium', 'hard'];

const questionSchema = new mongoose.Schema(
  {
    questionText: { type: String, required: true, trim: true },
    // Optional grouped-set support (multiple questions can share one passage).
    passage: { type: String, trim: true, default: '' },
    options: {
      type: [String],
      required: true,
      validate: [
        { validator: (v) => Array.isArray(v) && v.length === 4, message: 'Exactly four options are required' },
        { validator: (v) => v.every((o) => String(o).trim().length > 0), message: 'Options cannot be empty' },
      ],
    },
    correctAnswer: {
      type: Number,
      required: true,
      min: 0,
      max: 3,
    },
    explanation: { type: String, trim: true, default: '' },
    subject: { type: String, required: true, trim: true, maxlength: 120, index: true },
    topic: { type: String, trim: true, maxlength: 120, default: '', index: true },
    examination: { type: String, trim: true, maxlength: 120, default: '', index: true },
    difficulty: { type: String, enum: DIFFICULTY_LEVELS, default: 'medium', index: true },
    marks: { type: Number, default: 1, min: 1 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  },
  { timestamps: true }
);

questionSchema.index({ subject: 1, topic: 1, difficulty: 1 });

export default mongoose.model('Question', questionSchema);
