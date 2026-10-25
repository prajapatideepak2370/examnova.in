import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['admin', 'superadmin'], default: 'admin' },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

adminSchema.methods.comparePassword = function comparePassword(plainPassword) {
  return bcrypt.compare(plainPassword, this.passwordHash);
};

adminSchema.statics.hashPassword = function hashPassword(plainPassword) {
  return bcrypt.hash(plainPassword, 12);
};

adminSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.passwordHash;
    return ret;
  },
});

export default mongoose.model('Admin', adminSchema);
