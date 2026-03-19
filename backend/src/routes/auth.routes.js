import { Router } from 'express';
import { 
  loginController, 
  signupController, 
  adminSignupController, 
  meController,
  updateProfileController,
  updatePasswordController
} from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { getDatabaseState } from '../config/db.js';
import { User } from '../models/User.js';

const router = Router();

router.post('/signup', signupController);
router.post('/admin/signup', adminSignupController);
router.post('/login', loginController);
router.get('/me', requireAuth(), meController);
router.patch('/profile', requireAuth(), updateProfileController);
router.patch('/password', requireAuth(), updatePasswordController);

// Test endpoint to debug database connection
router.get('/test-db', async (req, res) => {
  try {
    const dbState = getDatabaseState();
    const userCount = await User.countDocuments();
    res.json({
      dbConnected: dbState === 1,
      dbState,
      userCount,
      message: 'Database test successful'
    });
  } catch (error) {
    res.status(500).json({
      dbConnected: false,
      error: error.message,
      message: 'Database test failed'
    });
  }
});

export default router;


