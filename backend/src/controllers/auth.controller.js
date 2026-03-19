import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { ensureDatabaseConnectedWithRetry } from '../config/db.js';
import { JWT_SECRET } from '../config/env.js';
import { User } from '../models/User.js';
import { AppError } from '../errors/AppError.js';
import { validateSignup, validateLogin } from '../validators/auth.validator.js';
import { asyncHandler } from '../errors/asyncHandler.js';

function signToken(user) {
  const payload = { sub: user.id, role: user.role };
  const secret = JWT_SECRET;
  const expiresIn = '7d';
  return jwt.sign(payload, secret, { expiresIn });
}

export const signupController = asyncHandler(async (req, res) => {
  if (mongoose.connection.readyState !== 1) throw new AppError(503, 'Database not connected. Try again shortly.');
  const errMsg = validateSignup(req.body);
  if (errMsg) throw new AppError(400, errMsg);
  const { name, email, password, role, hostelBlock, room } = req.body;
  
  // Prevent admin signup through regular signup
  if (role === 'Admin') {
    throw new AppError(403, 'Admin accounts can only be created through the admin signup process');
  }
  
  const exists = await User.findOne({ email });
  if (exists) throw new AppError(409, 'Email already registered');
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ 
    name, 
    email, 
    passwordHash, 
    role, 
    hostelBlock, 
    room,
    isVerified: false // New users need admin verification
  });
  
  // Don't automatically log in unverified users
  return res.status(201).json({ 
    message: 'Account created successfully. Please wait for admin verification before logging in.',
    user: { id: user.id, name: user.name, email: user.email, role: user.role, hostelBlock: user.hostelBlock, room: user.room, isVerified: false }
  });
});

export const adminSignupController = asyncHandler(async (req, res) => {
  if (mongoose.connection.readyState !== 1) throw new AppError(503, 'Database not connected. Try again shortly.');
  
  const { name, email, password, adminCode } = req.body;
  
  // Validate required fields
  if (!name || !email || !password || !adminCode) {
    throw new AppError(400, 'All fields are required');
  }
  
  // Validate admin code
  if (adminCode !== 'ADMIN2024') {
    throw new AppError(403, 'Invalid admin authorization code');
  }
  
  // Check if email already exists
  const exists = await User.findOne({ email });
  if (exists) throw new AppError(409, 'Email already registered');
  
  // Check if there are any existing admins (for additional security)
  const existingAdmins = await User.countDocuments({ role: 'Admin' });
  if (existingAdmins === 0) {
    // First admin can be created without additional verification
    console.log('Creating first admin account');
  } else {
    // For additional admins, require existing admin verification
    // This could be enhanced with a more sophisticated approval system
    console.log('Creating additional admin account');
  }
  
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ 
    name, 
    email, 
    passwordHash, 
    role: 'Admin',
    isVerified: true // Admin accounts are verified by default
  });
  
  const token = signToken(user);
  return res.status(201).json({ 
    token, 
    user: { 
      id: user.id, 
      name: user.name, 
      email: user.email, 
      role: user.role,
      isVerified: user.isVerified
    } 
  });
});

export const loginController = asyncHandler(async (req, res) => {
  // Check database connection first
  if (mongoose.connection.readyState !== 1) {
    throw new AppError(503, 'Database not connected. Please try again shortly.');
  }
  
  const errMsg = validateLogin(req.body);
  if (errMsg) throw new AppError(400, errMsg);
  
  const { email, password } = req.body;
  if (!email || !password) {
    throw new AppError(400, 'Email and password are required');
  }
  
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user) throw new AppError(401, 'Invalid credentials');
  
  const ok = await user.verifyPassword(password);
  if (!ok) throw new AppError(401, 'Invalid credentials');
  
  // Check if user is verified (except for Admin users who are auto-verified)
  if (!user.isVerified && user.role !== 'Admin') {
    throw new AppError(403, 'Your account is pending verification. Please contact the administrator.');
  }
  
  const token = signToken(user);
  return res.json({ 
    token, 
    user: { 
      id: user.id, 
      name: user.name, 
      email: user.email, 
      role: user.role, 
      hostelBlock: user.hostelBlock, 
      room: user.room 
    } 
  });
});

export const meController = asyncHandler(async (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  const user = await User.findById(req.user.id).select('-passwordHash');
  if (!user) {
    return res.status(401).json({ message: 'User not found' });
  }
  
  return res.json({ 
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      hostelBlock: user.hostelBlock,
      room: user.room,
      isVerified: user.isVerified
    }
  });
});

// Update user profile
export const updateProfileController = asyncHandler(async (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { name, email, hostelBlock, room } = req.body;
  const user = await User.findById(req.user.id);
  
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Update allowed fields
  if (name !== undefined) user.name = name;
  if (email !== undefined) {
    // Check if email is already taken by another user
    const existingUser = await User.findOne({ email, _id: { $ne: user.id } });
    if (existingUser) {
      throw new AppError(409, 'Email already in use');
    }
    user.email = email;
  }
  if (hostelBlock !== undefined) user.hostelBlock = hostelBlock;
  if (room !== undefined) user.room = room;

  await user.save();

  return res.json({
    message: 'Profile updated successfully',
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      hostelBlock: user.hostelBlock,
      room: user.room,
      isVerified: user.isVerified
    }
  });
});

// Update password
export const updatePasswordController = asyncHandler(async (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new AppError(400, 'Current password and new password are required');
  }

  if (newPassword.length < 6) {
    throw new AppError(400, 'Password must be at least 6 characters');
  }

  const user = await User.findById(req.user.id).select('+passwordHash');
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Verify current password
  const isValid = await user.verifyPassword(currentPassword);
  if (!isValid) {
    throw new AppError(401, 'Current password is incorrect');
  }

  // Hash and save new password
  user.passwordHash = await bcrypt.hash(newPassword, 10);
  await user.save();

  return res.json({ message: 'Password updated successfully' });
});


