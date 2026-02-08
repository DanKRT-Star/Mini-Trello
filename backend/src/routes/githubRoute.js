import express from 'express';
import githubController from '../controllers/githubController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

router.use(authenticateToken);

// GitHub connection management
router.get('/callback', githubController.githubCallback);
router.get('/check-connection', githubController.checkConnection);
router.post('/disconnect', githubController.disconnectGitHub);

// Repositories
router.get('/repositories', githubController.getUserRepositories);
router.get('/repositories/:repositoryId/github-info', githubController.getRepositoryInfo);

// GitHub attachments to tasks
router.post(
  '/boards/:boardId/cards/:cardId/tasks/:taskId/github-attach',
  githubController.attachToTask
);

router.get(
  '/boards/:boardId/cards/:cardId/tasks/:taskId/github-attachments',
  githubController.getTaskAttachments
);

router.delete(
  '/boards/:boardId/cards/:cardId/tasks/:taskId/github-attachments/:attachmentId',
  githubController.removeAttachment
);

export default router;