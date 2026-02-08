import express from 'express';
import taskController from '../controllers/taskController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router({ mergeParams: true });

router.use(authenticateToken);

// CRUD operations
router.get('/', taskController.getAll);
router.post('/', taskController.create);
router.get('/:taskId', taskController.getById);
router.put('/:taskId', taskController.update);
router.delete('/:taskId', taskController.delete);

// Task assignment
router.post('/:taskId/assign', taskController.assignMember);
router.get('/:taskId/assign', taskController.getAssignedMembers);
router.delete('/:taskId/assign/:memberId', taskController.unassignMember);

export default router;