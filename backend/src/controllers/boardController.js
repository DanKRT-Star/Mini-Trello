import Board from '../models/Board.js';
import User from '../models/User.js';
import { db } from '../configs/firebase.js';
import { sendInvitationEmail } from '../utils/email.js';

class BoardController {
  async getAll(req, res) {
    try {
      const userId = req.user.userId;
      const boards = await Board.findByUser(userId);

      res.json(boards);
    } catch (error) {
      console.error('Get boards error:', error);
      res.status(500).json({ error: 'Lỗi server khi lấy boards' });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      const board = await Board.findById(id);

      if (!board) {
        return res.status(404).json({ error: 'Board không tồn tại' });
      }

      if (board.ownerId !== userId && !board.members.includes(userId)) {
        return res.status(403).json({ error: 'Bạn không có quyền truy cập board này' });
      }

      res.json(board);
    } catch (error) {
      console.error('Get board error:', error);
      res.status(500).json({ error: 'Lỗi server khi lấy board' });
    }
  }

  async create(req, res) {
    try {
      const { name, description } = req.body;
      const userId = req.user.userId;

      const board = await Board.create({
        name,
        description,
        ownerId: userId
      });

      res.status(201).json(board);
    } catch (error) {
      console.error('Create board error:', error);
      res.status(500).json({ error: error.message || 'Lỗi server khi tạo board' });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      const { name, description } = req.body;

      const board = await Board.findById(id);

      if (!board) {
        return res.status(404).json({ error: 'Board không tồn tại' });
      }

      if (board.ownerId !== userId) {
        return res.status(403).json({ error: 'Chỉ chủ sở hữu mới có thể cập nhật board' });
      }

      const updateData = {};
      if (name) updateData.name = name;
      if (description !== undefined) updateData.description = description;

      const updatedBoard = await Board.update(id, updateData);

      res.json(updatedBoard);
    } catch (error) {
      console.error('Update board error:', error);
      res.status(500).json({ error: 'Lỗi server khi cập nhật board' });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      const board = await Board.findById(id);

      if (!board) {
        return res.status(404).json({ error: 'Board không tồn tại' });
      }

      if (board.ownerId !== userId) {
        return res.status(403).json({ error: 'Chỉ chủ sở hữu mới có thể xóa board' });
      }

      await Board.delete(id);

      res.status(204).send();
    } catch (error) {
      console.error('Delete board error:', error);
      res.status(500).json({ error: 'Lỗi server khi xóa board' });
    }
  }

  async invite(req, res) {
    try {
      const { boardId } = req.params;
      const userId = req.user.userId;
      const { email_member } = req.body;

      const board = await Board.findById(boardId);

      if (!board) {
        return res.status(404).json({ error: 'Board không tồn tại' });
      }

      if (board.ownerId !== userId && !board.members.includes(userId)) {
        return res.status(403).json({ error: 'Bạn không có quyền mời thành viên' });
      }

      const invitedUser = await User.findByEmail(email_member);

      if (!invitedUser) {
        return res.status(404).json({ error: 'User không tồn tại' });
      }

      if (board.members.includes(invitedUser.id)) {
        return res.status(400).json({ error: 'User đã là thành viên của board' });
      }

      const invitation = {
        boardId,
        board_owner_id: board.ownerId,
        member_id: invitedUser.id,
        email_member,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      const inviteRef = await db.collection('invitations').add(invitation);

      const owner = await User.findById(userId);
      await sendInvitationEmail(email_member, board.name, owner.email);

      res.json({
        success: true,
        inviteId: inviteRef.id,
        message: 'Lời mời đã được gửi'
      });
    } catch (error) {
      console.error('Invite error:', error);
      res.status(500).json({ error: 'Lỗi server khi mời thành viên' });
    }
  }

  async getInvites(req, res) {
    try {
      const userId = req.user.userId;
      const invitesSnapshot = await db.collection('invitations').where('member_id', '==', userId).where('status', '==', 'pending').get();
      const invites = [];
      invitesSnapshot.forEach((doc) => {
        invites.push({ inviteId: doc.id, ...doc.data() });
      });

      res.json(invites);
    } catch (error) {
      console.error('Get invites error:', error);
      res.status(500).json({ error: 'Lỗi server khi lấy lời mời' });
    }
  }

  async acceptInvite(req, res) {
    try {
      const { boardId } = req.params;
      const userId = req.user.userId;
      const { invite_id, status } = req.body;

      const inviteDoc = await db.collection('invitations').doc(invite_id).get();

      if (!inviteDoc.exists) {
        return res.status(404).json({ error: 'Lời mời không tồn tại' });
      }

      const inviteData = inviteDoc.data();

      if (inviteData.member_id !== userId) {
        return res.status(403).json({ error: 'Bạn không có quyền xử lý lời mời này' });
      }

      if (inviteData.boardId !== boardId) {
        return res.status(400).json({ error: 'BoardId không khớp với lời mời' });
      }

      await db.collection('invitations').doc(invite_id).update({
        status,
        updatedAt: new Date().toISOString()
      });

      if (status === 'accepted') {
        await Board.addMember(boardId, userId);
      }

      res.json({
        success: true,
        message: status === 'accepted' ? 'Đã chấp nhận lời mời' : 'Đã từ chối lời mời'
      });
    } catch (error) {
      console.error('Accept invite error:', error);
      res.status(500).json({ error: 'Lỗi server khi xử lý lời mời' });
    }
  }

  async getSentInvites(req, res) {
    try {
      const userId = req.user.userId;
      const invitesSnapshot = await db.collection('invitations')
        .where('board_owner_id', '==', userId)
        .get();

      const invites = [];
      invitesSnapshot.forEach((doc) => {
        invites.push({ inviteId: doc.id, ...doc.data() });
      });

      // Sort by createdAt in descending order (most recent first)
      invites.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      res.json(invites);
    } catch (error) {
      console.error('Get sent invites error:', error);
      res.status(500).json({ error: 'Lỗi server khi lấy lời mời đã gửi' });
    }
  }
}

export default new BoardController();