import GitHubService from '../configs/github.js';
import { db } from '../configs/firebase.js';
import axios from 'axios';

class GitHubController {
  // OAuth callback - Xử lý sau khi user authorize GitHub
  async githubCallback(req, res) {
    try {
      const { code } = req.query;
      const userId = req.user.userId;

      if (!code) {
        return res.status(400).json({ error: 'Authorization code là bắt buộc' });
      }

      // Exchange code for access token
      const tokenResponse = await axios.post(
        'https://github.com/login/oauth/access_token',
        {
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code
        },
        {
          headers: {
            Accept: 'application/json'
          }
        }
      );

      const { access_token } = tokenResponse.data;

      if (!access_token) {
        return res.status(400).json({ error: 'Không thể lấy access token từ GitHub' });
      }

      // Lưu token vào user
      await db.collection('users').doc(userId).update({
        githubAccessToken: access_token,
        githubConnectedAt: new Date().toISOString()
      });

      // Lấy thông tin user từ GitHub
      const githubService = new GitHubService(access_token);
      const githubUser = await githubService.getUserInfo();

      await db.collection('users').doc(userId).update({
        githubUsername: githubUser.login,
        githubId: githubUser.id,
        githubAvatarUrl: githubUser.avatar_url
      });

      res.json({
        success: true,
        message: 'Kết nối GitHub thành công',
        githubUsername: githubUser.login,
        githubAvatarUrl: githubUser.avatar_url
      });
    } catch (error) {
      console.error('GitHub callback error:', error);
      
      if (error.response?.status === 401) {
        return res.status(401).json({ error: 'GitHub authorization thất bại' });
      }
      
      res.status(500).json({ 
        error: 'Lỗi server khi kết nối GitHub',
        details: error.message 
      });
    }
  }

  // Lấy danh sách repositories của user
  async getUserRepositories(req, res) {
    try {
      const userId = req.user.userId;

      const userDoc = await db.collection('users').doc(userId).get();
      const userData = userDoc.data();

      if (!userData.githubAccessToken) {
        return res.status(401).json({ 
          error: 'Bạn chưa kết nối với GitHub. Vui lòng kết nối GitHub trước.' 
        });
      }

      const githubService = new GitHubService(userData.githubAccessToken);
      const repositories = await githubService.getRepositories();

      // Lưu repositories vào database để dùng sau
      const batch = db.batch();

      for (const repo of repositories) {
        // Kiểm tra repo đã tồn tại chưa
        const existingRepoSnapshot = await db.collection('repositories')
          .where('userId', '==', userId)
          .where('githubId', '==', repo.id)
          .get();

        if (existingRepoSnapshot.empty) {
          const repoRef = db.collection('repositories').doc();
          batch.set(repoRef, {
            userId,
            githubId: repo.id,
            fullName: repo.full_name,
            name: repo.name,
            owner: repo.owner.login,
            private: repo.private,
            url: repo.html_url,
            description: repo.description || '',
            language: repo.language || '',
            stars: repo.stargazers_count || 0,
            forks: repo.forks_count || 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
      }

      await batch.commit();

      res.json(repositories);
    } catch (error) {
      console.error('Get repositories error:', error);
      
      if (error.response?.status === 401) {
        return res.status(401).json({ error: 'GitHub token không hợp lệ hoặc đã hết hạn' });
      }
      
      res.status(500).json({ error: 'Lỗi server khi lấy repositories' });
    }
  }

  // Lấy tất cả thông tin của một repository
  async getRepositoryInfo(req, res) {
    try {
      const { repositoryId } = req.params;
      const userId = req.user.userId;

      // Lấy GitHub access token
      const userDoc = await db.collection('users').doc(userId).get();
      const userData = userDoc.data();

      if (!userData.githubAccessToken) {
        return res.status(401).json({ 
          error: 'Bạn chưa kết nối với GitHub. Vui lòng kết nối GitHub trước.' 
        });
      }

      const githubService = new GitHubService(userData.githubAccessToken);

      // Lấy repository từ database
      const repoDoc = await db.collection('repositories').doc(repositoryId).get();
      
      if (!repoDoc.exists) {
        return res.status(404).json({ error: 'Repository không tồn tại trong database' });
      }

      const repoData = repoDoc.data();

      // Kiểm tra quyền truy cập
      if (repoData.userId !== userId) {
        return res.status(403).json({ error: 'Bạn không có quyền truy cập repository này' });
      }

      const [owner, repo] = repoData.fullName.split('/');

      // Lấy tất cả thông tin từ GitHub
      const repoInfo = await githubService.getRepositoryInfo(owner, repo);

      res.json({
        repositoryId,
        fullName: repoData.fullName,
        url: repoData.url,
        ...repoInfo
      });
    } catch (error) {
      console.error('Get repository info error:', error);
      
      if (error.response?.status === 401) {
        return res.status(401).json({ error: 'GitHub token không hợp lệ' });
      }
      
      if (error.response?.status === 404) {
        return res.status(404).json({ error: 'Repository không tồn tại trên GitHub' });
      }
      
      res.status(500).json({ error: 'Lỗi server khi lấy thông tin repository' });
    }
  }

  // Attach GitHub item (PR, commit, issue) vào task
  async attachToTask(req, res) {
    try {
      const { boardId, cardId, taskId } = req.params;
      const { type, number, sha } = req.body;
      const userId = req.user.userId;

      // Validate type
      const validTypes = ['pull_request', 'commit', 'issue'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({ 
          error: 'Type không hợp lệ. Chỉ chấp nhận: pull_request, commit, issue' 
        });
      }

      // Validate required fields based on type
      if (type === 'commit' && !sha) {
        return res.status(400).json({ error: 'SHA là bắt buộc cho commit type' });
      }

      if ((type === 'pull_request' || type === 'issue') && !number) {
        return res.status(400).json({ error: 'Number là bắt buộc cho PR/issue type' });
      }

      // Tạo attachment
      const attachment = {
        taskId,
        cardId,
        boardId,
        type,
        number: number || null,
        sha: sha || null,
        createdBy: userId,
        createdAt: new Date().toISOString()
      };

      const attachmentRef = await db.collection('github_attachments').add(attachment);

      res.status(201).json({
        taskId,
        attachmentId: attachmentRef.id,
        type,
        number: number || undefined,
        sha: sha || undefined
      });
    } catch (error) {
      console.error('Attach GitHub item error:', error);
      res.status(500).json({ error: 'Lỗi server khi attach GitHub item' });
    }
  }

  // Lấy tất cả GitHub attachments của task
  async getTaskAttachments(req, res) {
    try {
      const { taskId } = req.params;

      const attachmentsSnapshot = await db.collection('github_attachments')
        .where('taskId', '==', taskId)
        .orderBy('createdAt', 'desc')
        .get();

      const attachments = [];
      attachmentsSnapshot.forEach(doc => {
        const data = doc.data();
        const attachment = {
          attachmentId: doc.id,
          type: data.type,
          createdAt: data.createdAt
        };

        if (data.type === 'commit') {
          attachment.sha = data.sha;
        } else {
          attachment.number = data.number;
        }

        attachments.push(attachment);
      });

      res.json(attachments);
    } catch (error) {
      console.error('Get task attachments error:', error);
      res.status(500).json({ error: 'Lỗi server khi lấy attachments' });
    }
  }

  // Xóa GitHub attachment
  async removeAttachment(req, res) {
    try {
      const { attachmentId } = req.params;
      const userId = req.user.userId;

      const attachmentDoc = await db.collection('github_attachments').doc(attachmentId).get();

      if (!attachmentDoc.exists) {
        return res.status(404).json({ error: 'Attachment không tồn tại' });
      }

      const attachmentData = attachmentDoc.data();

      // Kiểm tra quyền (chỉ người tạo mới được xóa)
      if (attachmentData.createdBy !== userId) {
        return res.status(403).json({ error: 'Bạn không có quyền xóa attachment này' });
      }

      await db.collection('github_attachments').doc(attachmentId).delete();

      res.status(204).send();
    } catch (error) {
      console.error('Remove attachment error:', error);
      res.status(500).json({ error: 'Lỗi server khi xóa attachment' });
    }
  }

  // Disconnect GitHub
  async disconnectGitHub(req, res) {
    try {
      const userId = req.user.userId;

      await db.collection('users').doc(userId).update({
        githubAccessToken: null,
        githubUsername: null,
        githubId: null,
        githubAvatarUrl: null,
        githubConnectedAt: null
      });

      res.json({
        success: true,
        message: 'Đã ngắt kết nối với GitHub'
      });
    } catch (error) {
      console.error('Disconnect GitHub error:', error);
      res.status(500).json({ error: 'Lỗi server khi ngắt kết nối GitHub' });
    }
  }

  // Check GitHub connection status
  async checkConnection(req, res) {
    try {
      const userId = req.user.userId;

      const userDoc = await db.collection('users').doc(userId).get();
      const userData = userDoc.data();

      const isConnected = !!userData.githubAccessToken;

      res.json({
        connected: isConnected,
        githubUsername: userData.githubUsername || null,
        githubAvatarUrl: userData.githubAvatarUrl || null,
        connectedAt: userData.githubConnectedAt || null
      });
    } catch (error) {
      console.error('Check connection error:', error);
      res.status(500).json({ error: 'Lỗi server khi kiểm tra kết nối' });
    }
  }
}

export default new GitHubController();