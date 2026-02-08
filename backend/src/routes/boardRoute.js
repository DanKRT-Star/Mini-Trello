import express from 'express';
import boardController from '../controllers/boardController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', boardController.getAll);
router.post('/', boardController.create);
router.get('/invites', boardController.getInvites);
router.get('/sent-invites', boardController.getSentInvites);
router.get('/:id', boardController.getById);
router.put('/:id', boardController.update);
router.delete('/:id', boardController.delete);
router.post('/:boardId/invite', boardController.invite);
router.post('/:boardId/invite/accept', boardController.acceptInvite);

export default router;