import { db } from '../configs/firebase.js';

class Card {
  constructor(data) {
    this.boardId = data.boardId;
    this.name = data.name;
    this.description = data.description || '';
    this.ownerId = data.ownerId;
    this.list_member = data.list_member || [];
    this.tasks_count = data.tasks_count || 0;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  validate() {
    const errors = [];

    if (!this.name || this.name.trim() === '') {
      errors.push('Tên card là bắt buộc');
    }

    if (!this.boardId) {
      errors.push('Board ID là bắt buộc');
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
      boardId: this.boardId,
      name: this.name,
      description: this.description,
      ownerId: this.ownerId,
      list_member: this.list_member,
      tasks_count: this.tasks_count,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  static async create(cardData) {
    const card = new Card(cardData);
    const validation = card.validate();

    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    const docRef = await db.collection('cards').add(card.toFirestore());
    return { id: docRef.id, ...card.toFirestore() };
  }

  static async findById(cardId) {
    const doc = await db.collection('cards').doc(cardId).get();
    
    if (!doc.exists) return null;
    
    return { id: doc.id, ...doc.data() };
  }

  static async findByBoard(boardId) {
    const snapshot = await db.collection('cards')
      .where('boardId', '==', boardId)
      .get();

    const cards = [];
    snapshot.forEach(doc => {
      cards.push({ id: doc.id, ...doc.data() });
    });

    return cards;
  }

  static async findByUser(boardId, userId) {
    const snapshot = await db.collection('cards')
      .where('boardId', '==', boardId)
      .where('ownerId', '==', userId)
      .get();

    const cards = [];
    snapshot.forEach(doc => {
      cards.push({ id: doc.id, ...doc.data() });
    });

    return cards;
  }

  static async update(cardId, updateData) {
    await db.collection('cards').doc(cardId).update({
      ...updateData,
      updatedAt: new Date().toISOString()
    });

    return this.findById(cardId);
  }

  static async delete(cardId) {
    const tasksSnapshot = await db.collection('tasks')
      .where('cardId', '==', cardId)
      .get();

    const batch = db.batch();

    tasksSnapshot.forEach(doc => {
      batch.delete(doc.ref);
    });

    batch.delete(db.collection('cards').doc(cardId));
    
    await batch.commit();
  }

  static async updateTaskCount(cardId) {
    const tasksSnapshot = await db.collection('tasks')
      .where('cardId', '==', cardId)
      .get();

    await db.collection('cards').doc(cardId).update({
      tasks_count: tasksSnapshot.size,
      updatedAt: new Date().toISOString()
    });

    return this.findById(cardId);
  }
}

export default Card;