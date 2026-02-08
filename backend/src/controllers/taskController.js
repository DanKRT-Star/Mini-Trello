import Task from '../models/Task.js';
import Card from '../models/Card.js';
import Board from '../models/Board.js';

class TaskController {
  async getAll(req, res) {
    try {
      const { boardId, id: cardId } = req.params;
      const userId = req.user.userId;

      const board = await Board.findById(boardId);
      if (!board) {
        return res.status(404).json({ error: 'Board không tồn tại' });
      }

      if (board.ownerId !== userId && !board.members.includes(userId)) {
        return res.status(403).json({ error: 'Bạn không có quyền truy cập board này' });
      }

      const card = await Card.findById(cardId);
      if (!card) {
        return res.status(404).json({ error: 'Card không tồn tại' });
      }

      if (card.boardId !== boardId) {
        return res.status(400).json({ error: 'Card không thuộc board này' });
      }

      const tasks = await Task.findByCard(cardId);
      res.json(tasks);
    } catch (error) {
      console.error('Get tasks error:', error);
      res.status(500).json({ error: 'Lỗi server khi lấy tasks' });
    }
  }

  async getById(req, res) {
    try {
      const { boardId, id: cardId, taskId } = req.params;
      const userId = req.user.userId;

      const board = await Board.findById(boardId);
      if (!board) {
        return res.status(404).json({ error: 'Board không tồn tại' });
      }

      if (board.ownerId !== userId && !board.members.includes(userId)) {
        return res.status(403).json({ error: 'Bạn không có quyền truy cập board này' });
      }

      const task = await Task.findById(taskId);
      if (!task) {
        return res.status(404).json({ error: 'Task không tồn tại' });
      }

      if (task.cardId !== cardId || task.boardId !== boardId) {
        return res.status(400).json({ error: 'Task không thuộc card này' });
      }

      res.json(task);
    } catch (error) {
      console.error('Get task error:', error);
      res.status(500).json({ error: 'Lỗi server khi lấy task' });
    }
  }

  async create(req, res) {
    try {
      const { boardId, id: cardId } = req.params;
      const userId = req.user.userId;
      const { title, description, status, priority, deadline, assignedMembers } = req.body;

      const board = await Board.findById(boardId);
      if (!board) {
        return res.status(404).json({ error: 'Board không tồn tại' });
      }

      if (board.ownerId !== userId && !board.members.includes(userId)) {
        return res.status(403).json({ error: 'Bạn không có quyền tạo task trong board này' });
      }

      const card = await Card.findById(cardId);
      if (!card) {
        return res.status(404).json({ error: 'Card không tồn tại' });
      }

      if (card.boardId !== boardId) {
        return res.status(400).json({ error: 'Card không thuộc board này' });
      }

      const task = await Task.create({
        boardId,
        cardId,
        title,
        description,
        status,
        priority,
        deadline,
        ownerId: userId,
        assignedMembers: assignedMembers || []
      });

      res.status(201).json(task);
    } catch (error) {
      console.error('Create task error:', error);
      res.status(500).json({ error: error.message || 'Lỗi server khi tạo task' });
    }
  }

  async update(req, res) {
    try {
      const { boardId, id: cardId, taskId } = req.params;
      const userId = req.user.userId;
      const updateData = req.body;

      const board = await Board.findById(boardId);
      if (!board) {
        return res.status(404).json({ error: 'Board không tồn tại' });
      }

      if (board.ownerId !== userId && !board.members.includes(userId)) {
        return res.status(403).json({ error: 'Bạn không có quyền cập nhật task trong board này' });
      }

      const task = await Task.findById(taskId);
      if (!task) {
        return res.status(404).json({ error: 'Task không tồn tại' });
      }

      if (task.cardId !== cardId || task.boardId !== boardId) {
        return res.status(400).json({ error: 'Task không thuộc card này' });
      }

      const updatedTask = await Task.update(taskId, updateData);
      res.json(updatedTask);
    } catch (error) {
      console.error('Update task error:', error);
      res.status(500).json({ error: 'Lỗi server khi cập nhật task' });
    }
  }

  async delete(req, res) {
    try {
      const { boardId, id: cardId, taskId } = req.params;
      const userId = req.user.userId;

      const board = await Board.findById(boardId);
      if (!board) {
        return res.status(404).json({ error: 'Board không tồn tại' });
      }

      if (board.ownerId !== userId && !board.members.includes(userId)) {
        return res.status(403).json({ error: 'Bạn không có quyền xóa task trong board này' });
      }

      const task = await Task.findById(taskId);
      if (!task) {
        return res.status(404).json({ error: 'Task không tồn tại' });
      }

      if (task.cardId !== cardId || task.boardId !== boardId) {
        return res.status(400).json({ error: 'Task không thuộc card này' });
      }

      await Task.delete(taskId);
      res.status(204).send();
    } catch (error) {
      console.error('Delete task error:', error);
      res.status(500).json({ error: 'Lỗi server khi xóa task' });
    }
  }

  async assignMember(req, res) {
    try {
      const { boardId, id: cardId, taskId } = req.params;
      const userId = req.user.userId;
      const { memberId } = req.body;

      const board = await Board.findById(boardId);
      if (!board) {
        return res.status(404).json({ error: 'Board không tồn tại' });
      }

      if (board.ownerId !== userId && !board.members.includes(userId)) {
        return res.status(403).json({ error: 'Bạn không có quyền assign task' });
      }

      // Kiểm tra member có trong board không
      if (!board.members.includes(memberId)) {
        return res.status(400).json({ error: 'Member không thuộc board này' });
      }

      const task = await Task.findById(taskId);
      if (!task) {
        return res.status(404).json({ error: 'Task không tồn tại' });
      }

      if (task.cardId !== cardId || task.boardId !== boardId) {
        return res.status(400).json({ error: 'Task không thuộc card này' });
      }

      const updatedTask = await Task.assignMember(taskId, memberId);

      res.status(201).json({
        taskId: updatedTask.id,
        memberId
      });
    } catch (error) {
      console.error('Assign member error:', error);
      res.status(500).json({ error: 'Lỗi server khi assign member' });
    }
  }

  async getAssignedMembers(req, res) {
    try {
      const { boardId, id: cardId, taskId } = req.params;
      const userId = req.user.userId;

      const board = await Board.findById(boardId);
      if (!board) {
        return res.status(404).json({ error: 'Board không tồn tại' });
      }

      if (board.ownerId !== userId && !board.members.includes(userId)) {
        return res.status(403).json({ error: 'Bạn không có quyền truy cập board này' });
      }

      const task = await Task.findById(taskId);
      if (!task) {
        return res.status(404).json({ error: 'Task không tồn tại' });
      }

      const assignedMembers = task.assignedMembers.map(memberId => ({
        taskId: task.id,
        memberId
      }));

      res.json(assignedMembers);
    } catch (error) {
      console.error('Get assigned members error:', error);
      res.status(500).json({ error: 'Lỗi server khi lấy assigned members' });
    }
  }

  async unassignMember(req, res) {
    try {
      const { boardId, id: cardId, taskId, memberId } = req.params;
      const userId = req.user.userId;

      const board = await Board.findById(boardId);
      if (!board) {
        return res.status(404).json({ error: 'Board không tồn tại' });
      }

      if (board.ownerId !== userId && !board.members.includes(userId)) {
        return res.status(403).json({ error: 'Bạn không có quyền unassign task' });
      }

      const task = await Task.findById(taskId);
      if (!task) {
        return res.status(404).json({ error: 'Task không tồn tại' });
      }

      if (task.cardId !== cardId || task.boardId !== boardId) {
        return res.status(400).json({ error: 'Task không thuộc card này' });
      }

      await Task.unassignMember(taskId, memberId);

      res.status(204).send();
    } catch (error) {
      console.error('Unassign member error:', error);
      res.status(500).json({ error: 'Lỗi server khi unassign member' });
    }
  }
}

export default new TaskController();