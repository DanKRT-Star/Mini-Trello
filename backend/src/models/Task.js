import { db } from '../configs/firebase.js';

class Task {
  constructor(data) {
    this.cardId = data.cardId;
    this.boardId = data.boardId;
    this.title = data.title;
    this.description = data.description || '';
    this.status = data.status || 'icebox';
    this.ownerId = data.ownerId;
    this.assignedMembers = data.assignedMembers || [];
    this.priority = data.priority || 'medium';
    this.deadline = data.deadline || null;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  validate() {
    const errors = [];

    if (!this.title || this.title.trim() === '') {
      errors.push('Tiêu đề task là bắt buộc');
    }

    if (!this.cardId) {
      errors.push('Card ID là bắt buộc');
    }

    if (!this.boardId) {
      errors.push('Board ID là bắt buộc');
    }

    const validStatuses = ['icebox', 'backlog', 'ongoing', 'review', 'done'];
    if (!validStatuses.includes(this.status)) {
      errors.push('Status không hợp lệ');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  toFirestore() {
    return {
      cardId: this.cardId,
      boardId: this.boardId,
      title: this.title,
      description: this.description,
      status: this.status,
      ownerId: this.ownerId,
      assignedMembers: this.assignedMembers,
      priority: this.priority,
      deadline: this.deadline,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  static async create(taskData) {
    const task = new Task(taskData);
    const validation = task.validate();

    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    const docRef = await db.collection('tasks').add(task.toFirestore());
    
    // Dynamic import to avoid circular dependency
    const { default: Card } = await import('./Card.js');
    await Card.updateTaskCount(task.cardId);

    return { id: docRef.id, ...task.toFirestore() };
  }

  static async findById(taskId) {
    const doc = await db.collection('tasks').doc(taskId).get();
    
    if (!doc.exists) return null;
    
    return { id: doc.id, ...doc.data() };
  }

  static async findByCard(cardId) {
    const snapshot = await db.collection('tasks')
      .where('cardId', '==', cardId)
      .get();

    const tasks = [];
    snapshot.forEach(doc => {
      tasks.push({ id: doc.id, ...doc.data() });
    });

    return tasks;
  }

  static async findByStatus(cardId, status) {
    const snapshot = await db.collection('tasks')
      .where('cardId', '==', cardId)
      .where('status', '==', status)
      .get();

    const tasks = [];
    snapshot.forEach(doc => {
      tasks.push({ id: doc.id, ...doc.data() });
    });

    return tasks;
  }

  static async update(taskId, updateData) {
    const oldTask = await this.findById(taskId);
    
    // Validate updateData
    const validStatuses = ['icebox', 'backlog', 'ongoing', 'review', 'done'];
    const validPriorities = ['low', 'medium', 'high'];
    
    if (updateData.status && !validStatuses.includes(updateData.status)) {
      throw new Error('Status không hợp lệ');
    }
    
    if (updateData.priority && !validPriorities.includes(updateData.priority)) {
      throw new Error('Priority không hợp lệ');
    }
    
    if (updateData.deadline && isNaN(new Date(updateData.deadline).getTime())) {
      throw new Error('Deadline không hợp lệ');
    }
    
    await db.collection('tasks').doc(taskId).update({
      ...updateData,
      updatedAt: new Date().toISOString()
    });

    if (updateData.cardId && updateData.cardId !== oldTask.cardId) {
      const { default: Card } = await import('./Card.js');
      await Card.updateTaskCount(oldTask.cardId);
      await Card.updateTaskCount(updateData.cardId);
    }

    return this.findById(taskId);
  }

  static async delete(taskId) {
    const task = await this.findById(taskId);
    
    if (!task) {
      throw new Error('Task không tồn tại');
    }

    await db.collection('tasks').doc(taskId).delete();

    const { default: Card } = await import('./Card.js');
    await Card.updateTaskCount(task.cardId);
  }

  static async assignMember(taskId, memberId) {
    const task = await this.findById(taskId);
    
    if (!task) {
      throw new Error('Task không tồn tại');
    }

    if (!task.assignedMembers.includes(memberId)) {
      await db.collection('tasks').doc(taskId).update({
        assignedMembers: [...task.assignedMembers, memberId],
        updatedAt: new Date().toISOString()
      });
    }

    return this.findById(taskId);
  }

  static async unassignMember(taskId, memberId) {
    const task = await this.findById(taskId);
    
    if (!task) {
      throw new Error('Task không tồn tại');
    }

    await db.collection('tasks').doc(taskId).update({
      assignedMembers: task.assignedMembers.filter(m => m !== memberId),
      updatedAt: new Date().toISOString()
    });

    return this.findById(taskId);
  }
}

export default Task;