import Card from '../models/Card.js';
import Board from '../models/Board.js';

class CardController {
  async getAll(req, res) {
    try {
      const { boardId } = req.params;
      const userId = req.user.userId;

      const board = await Board.findById(boardId);
      if (!board) {
        return res.status(404).json({ error: 'Board không tồn tại' });
      }

      if (board.ownerId !== userId && !board.members.includes(userId)) {
        return res.status(403).json({ error: 'Bạn không có quyền truy cập board này' });
      }

      const cards = await Card.findByBoard(boardId);
      res.json(cards);
    } catch (error) {
      console.error('Get cards error:', error);
      res.status(500).json({ error: 'Lỗi server khi lấy cards' });
    }
  }

  async getById(req, res) {
    try {
      const { boardId, id } = req.params;
      const userId = req.user.userId;

      const board = await Board.findById(boardId);
      if (!board) {
        return res.status(404).json({ error: 'Board không tồn tại' });
      }

      if (board.ownerId !== userId && !board.members.includes(userId)) {
        return res.status(403).json({ error: 'Bạn không có quyền truy cập board này' });
      }

      const card = await Card.findById(id);
      if (!card) {
        return res.status(404).json({ error: 'Card không tồn tại' });
      }

      if (card.boardId !== boardId) {
        return res.status(400).json({ error: 'Card không thuộc board này' });
      }

      res.json(card);
    } catch (error) {
      console.error('Get card error:', error);
      res.status(500).json({ error: 'Lỗi server khi lấy card' });
    }
  }

  async getByUser(req, res) {
    try {
      const { boardId, user_id } = req.params;
      const userId = req.user.userId;

      const board = await Board.findById(boardId);
      if (!board) {
        return res.status(404).json({ error: 'Board không tồn tại' });
      }

      if (board.ownerId !== userId && !board.members.includes(userId)) {
        return res.status(403).json({ error: 'Bạn không có quyền truy cập board này' });
      }

      const cards = await Card.findByUser(boardId, user_id);
      res.json(cards);
    } catch (error) {
      console.error('Get cards by user error:', error);
      res.status(500).json({ error: 'Lỗi server khi lấy cards' });
    }
  }

  async create(req, res) {
    try {
      const { boardId } = req.params;
      const userId = req.user.userId;
      const { name, description } = req.body;

      const board = await Board.findById(boardId);
      if (!board) {
        return res.status(404).json({ error: 'Board không tồn tại' });
      }

      if (board.ownerId !== userId && !board.members.includes(userId)) {
        return res.status(403).json({ error: 'Bạn không có quyền tạo card trong board này' });
      }

      const card = await Card.create({
        boardId,
        name,
        description,
        ownerId: userId
      });

      res.status(201).json(card);
    } catch (error) {
      console.error('Create card error:', error);
      res.status(500).json({ error: error.message || 'Lỗi server khi tạo card' });
    }
  }

  async update(req, res) {
    try {
      const { boardId, id } = req.params;
      const userId = req.user.userId;
      const updateData = req.body;

      const board = await Board.findById(boardId);
      if (!board) {
        return res.status(404).json({ error: 'Board không tồn tại' });
      }

      if (board.ownerId !== userId && !board.members.includes(userId)) {
        return res.status(403).json({ error: 'Bạn không có quyền cập nhật card trong board này' });
      }

      const card = await Card.findById(id);
      if (!card) {
        return res.status(404).json({ error: 'Card không tồn tại' });
      }

      if (card.boardId !== boardId) {
        return res.status(400).json({ error: 'Card không thuộc board này' });
      }

      if (card.ownerId !== userId && board.ownerId !== userId) {
        return res.status(403).json({ error: 'Bạn không có quyền cập nhật card này' });
      }

      const updatedCard = await Card.update(id, updateData);
      res.json(updatedCard);
    } catch (error) {
      console.error('Update card error:', error);
      res.status(500).json({ error: 'Lỗi server khi cập nhật card' });
    }
  }

  async delete(req, res) {
    try {
      const { boardId, id } = req.params;
      const userId = req.user.userId;

      const board = await Board.findById(boardId);
      if (!board) {
        return res.status(404).json({ error: 'Board không tồn tại' });
      }

      const card = await Card.findById(id);
      if (!card) {
        return res.status(404).json({ error: 'Card không tồn tại' });
      }

      if (card.boardId !== boardId) {
        return res.status(400).json({ error: 'Card không thuộc board này' });
      }

      if (card.ownerId !== userId && board.ownerId !== userId) {
        return res.status(403).json({ error: 'Bạn không có quyền xóa card này' });
      }

      await Card.delete(id);
      res.status(204).send();
    } catch (error) {
      console.error('Delete card error:', error);
      res.status(500).json({ error: 'Lỗi server khi xóa card' });
    }
  }
}

export default new CardController();