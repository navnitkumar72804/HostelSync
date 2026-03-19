import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['Student', 'Warden', 'Admin'], default: 'Student' },
  hostelBlock: { type: String },
  room: { type: String },
  isVerified: { type: Boolean, default: false }
}, { timestamps: true });

// No pre-save hook needed since we're directly setting passwordHash

// instance method to verify password (use function() so `this` is bound)
UserSchema.methods.verifyPassword = async function (candidatePassword) {
  if (!this.passwordHash) return false;
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

const User = mongoose.models?.User || mongoose.model('User', UserSchema);

export default User;
export { User };


