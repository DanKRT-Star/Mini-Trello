import { db } from '../configs/firebase.js';

class Board {
  constructor(data) {
    this.name = data.name;
    this.description = data.description || '';
    this.ownerId = data.ownerId;
    this.members = data.members || [];
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  validate() {
    const errors = [];

    if (!this.name || this.name.trim() === '') {
      errors.push('Tên board là bắt buộc');
    }

    if (!this.ownerId) {
      errors.push('Owner ID là bắt buộc');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  toFirestore() {
    return {
      name: this.name,
      description: this.description,
      ownerId: this.ownerId,
      members: this.members,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  static async create(boardData) {
    const board = new Board(boardData);
    const validation = board.validate();

    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    if (!board.members.includes(board.ownerId)) {
      board.members.push(board.ownerId);
    }

    const docRef = await db.collection('boards').add(board.toFirestore());
    return { id: docRef.id, ...board.toFirestore() };
  }

  static async findById(boardId) {
    const doc = await db.collection('boards').doc(boardId).get();
    
    if (!doc.exists) return null;
    
    return { id: doc.id, ...doc.data() };
  }

  static async findByUser(userId) {
    const ownedBoards = await db.collection('boards')
      .where('ownerId', '==', userId)
      .get();

    const memberBoards = await db.collection('boards')
      .where('members', 'array-contains', userId)
      .get();

    const boards = [];
    const boardIds = new Set();

    ownedBoards.forEach(doc => {
      boards.push({ id: doc.id, ...doc.data() });
      boardIds.add(doc.id);
    });

    memberBoards.forEach(doc => {
      if (!boardIds.has(doc.id)) {
        boards.push({ id: doc.id, ...doc.data() });
      }
    });

    return boards;
  }

  static async update(boardId, updateData) {
    await db.collection('boards').doc(boardId).update({
      ...updateData,
      updatedAt: new Date().toISOString()
    });

    return this.findById(boardId);
  }

  static async delete(boardId) {
    const cardsSnapshot = await db.collection('cards')
      .where('boardId', '==', boardId)
      .get();

    const batch = db.batch();

    // Delete all tasks first
    for (const cardDoc of cardsSnapshot.docs) {
      const tasksSnapshot = await db.collection('tasks')
        .where('cardId', '==', cardDoc.id)
        .get();
      
      tasksSnapshot.forEach(taskDoc => {
        batch.delete(taskDoc.ref);
      });
    }

    // Then delete all cards
    cardsSnapshot.forEach(doc => {
      batch.delete(doc.ref);
    });

    // Finally delete board
    batch.delete(db.collection('boards').doc(boardId));
    
    await batch.commit();
  }

  static async addMember(boardId, userId) {
    const board = await this.findById(boardId);
    
    if (!board) {
      throw new Error('Board không tồn tại');
    }

    if (!board.members.includes(userId)) {
      await db.collection('boards').doc(boardId).update({
        members: [...board.members, userId],
        updatedAt: new Date().toISOString()
      });
    }

    return this.findById(boardId);
  }

  static async removeMember(boardId, userId) {
    const board = await this.findById(boardId);
    
    if (!board) {
      throw new Error('Board không tồn tại');
    }

    await db.collection('boards').doc(boardId).update({
      members: board.members.filter(m => m !== userId),
      updatedAt: new Date().toISOString()
    });

    return this.findById(boardId);
  }
}

export default Board;