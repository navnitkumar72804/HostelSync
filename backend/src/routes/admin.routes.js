import { Router } from 'express';
import {
  getAllUsersController,
  verifyUserController,
  deleteUserController,
  updateUserController,
  getAllComplaintsController,
  deleteComplaintController,
  getDashboardStatsController
} from '../controllers/admin.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { User } from '../models/User.js';

const router = Router();

// All admin routes require authentication and admin role
router.use(requireAuth());
router.use(requireRole(['Admin']));

// User management routes
router.route('/users')
  .get(getAllUsersController);

router.route('/users/:id/verify')
  .patch(verifyUserController);

router.route('/users/:id')
  .patch(updateUserController)
  .delete(deleteUserController);

// Complaint management routes
router.route('/complaints')
  .get(getAllComplaintsController);

router.route('/complaints/:id')
  .delete(deleteComplaintController);

// Dashboard and analytics
router.route('/dashboard/stats')
  .get(getDashboardStatsController);

// Test endpoint to check database connection and users
router.route('/test')
  .get(async (req, res) => {
    try {
      const totalUsers = await User.countDocuments();
      const users = await User.find().select('name email role').limit(5);
      res.json({ 
        message: 'Admin test endpoint working',
        totalUsers,
        sampleUsers: users,
        dbConnected: true
      });
    } catch (error) {
      res.status(500).json({ 
        message: 'Database error',
        error: error.message,
        dbConnected: false
      });
    }
  });

export default router;
