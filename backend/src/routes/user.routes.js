import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { createWardenController, deleteUserController, listUsersController } from '../controllers/user.controller.js';

const router = Router();

router.get('/', requireAuth(['Admin']), listUsersController);
router.post('/warden', requireAuth(['Admin']), createWardenController);
router.delete('/:id', requireAuth(['Admin']), deleteUserController);

export default router;


