import express from 'express';
import cardController from '../controllers/cardController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router({ mergeParams: true });

router.use(authenticateToken);

router.get('/', cardController.getAll);
router.post('/', cardController.create);
router.get('/user/:user_id', cardController.getByUser);
router.get('/:id', cardController.getById);
router.put('/:id', cardController.update);
router.delete('/:id', cardController.delete);

export default router;