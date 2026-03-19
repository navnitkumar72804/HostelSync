import { User } from '../models/User.js';
import { Complaint } from '../models/Complaint.js';
import { AppError } from '../errors/AppError.js';
import { asyncHandler } from '../errors/asyncHandler.js';
import mongoose from 'mongoose';

// Get all users (students and wardens)
export const getAllUsersController = asyncHandler(async (req, res) => {
  const { role } = req.query;
  
  let filter = {};
  if (role && role !== 'all') {
    filter.role = role;
  }
  
  const users = await User.find(filter).select('-passwordHash').sort({ createdAt: -1 });
  
  // Transform MongoDB _id to id for frontend compatibility
  const transformedUsers = users.map(user => ({
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    hostelBlock: user.hostelBlock,
    room: user.room,
    isVerified: user.isVerified,
    createdAt: user.createdAt
  }));
  
  res.json({ users: transformedUsers });
});

// Verify or reject a user
export const verifyUserController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { verified } = req.body;

  if (!id || id === 'undefined') {
    throw new AppError('User ID is required', 400);
  }

  const user = await User.findById(id);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  user.isVerified = verified;
  await user.save();

  res.json({ 
    message: `User ${verified ? 'verified' : 'rejected'} successfully`,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, isVerified: user.isVerified }
  });
});

// Delete a user
export const deleteUserController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Prevent deletion of admin users
  if (user.role === 'Admin') {
    throw new AppError('Cannot delete admin users', 403);
  }

  // Delete all complaints associated with this user if they're a student
  if (user.role === 'Student') {
    await Complaint.deleteMany({ studentId: id });
  }

  await user.deleteOne();

  res.status(204).send();
});

// Update user details (assign warden to block, etc.)
export const updateUserController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { hostelBlock, room, name, email } = req.body;

  const user = await User.findById(id);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Update allowed fields
  if (hostelBlock !== undefined) user.hostelBlock = hostelBlock;
  if (room !== undefined) user.room = room;
  if (name !== undefined) user.name = name;
  if (email !== undefined) user.email = email;

  await user.save();

  res.json({ 
    message: 'User updated successfully',
    user: { id: user.id, name: user.name, email: user.email, role: user.role, hostelBlock: user.hostelBlock, room: user.room }
  });
});

// Get all complaints with filters
export const getAllComplaintsController = asyncHandler(async (req, res) => {
  const { status, category, hostelBlock, studentId } = req.query;
  
  let filter = {};
  
  if (status && status !== 'all') {
    filter.status = status;
  }
  if (category && category !== 'all') {
    filter.category = category;
  }
  if (hostelBlock && hostelBlock !== 'all') {
    filter.hostelBlock = hostelBlock;
  }
  if (studentId) {
    filter.studentId = studentId;
  }

  const complaints = await Complaint.find(filter)
    .populate('studentId', 'name email')
    .sort({ dateCreated: -1 });

  res.json({ complaints });
});

// Delete a complaint (admin only)
export const deleteComplaintController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const complaint = await Complaint.findById(id);
  if (!complaint) {
    throw new AppError('Complaint not found', 404);
  }

  await complaint.deleteOne();

  res.status(204).send();
});

// Get dashboard statistics
export const getDashboardStatsController = asyncHandler(async (req, res) => {
  const totalComplaints = await Complaint.countDocuments();
  const pendingComplaints = await Complaint.countDocuments({ status: 'Pending' });
  const inProgressComplaints = await Complaint.countDocuments({ status: 'In Progress' });
  const resolvedComplaints = await Complaint.countDocuments({ status: 'Resolved' });
  
  const totalUsers = await User.countDocuments();
  const totalStudents = await User.countDocuments({ role: 'Student' });
  const totalWardens = await User.countDocuments({ role: 'Warden' });
  const verifiedUsers = await User.countDocuments({ isVerified: true });
  const unverifiedUsers = await User.countDocuments({ isVerified: false });

  // Category breakdown
  const categoryStats = await Complaint.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  // Block breakdown
  const blockStats = await Complaint.aggregate([
    { $group: { _id: '$hostelBlock', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  // Recent complaints (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const recentComplaints = await Complaint.find({
    dateCreated: { $gte: sevenDaysAgo }
  }).sort({ dateCreated: -1 }).limit(10);

  // Recent users (last 7 days)
  const recentUsers = await User.find({
    createdAt: { $gte: sevenDaysAgo }
  }).sort({ createdAt: -1 }).limit(10).select('-passwordHash');

  res.json({
    stats: {
      complaints: {
        total: totalComplaints,
        pending: pendingComplaints,
        inProgress: inProgressComplaints,
        resolved: resolvedComplaints
      },
      users: {
        total: totalUsers,
        students: totalStudents,
        wardens: totalWardens,
        verified: verifiedUsers,
        unverified: unverifiedUsers
      }
    },
    analytics: {
      categories: categoryStats,
      blocks: blockStats
    },
    recent: {
      complaints: recentComplaints,
      users: recentUsers
    }
  });
});
