import { db } from '../configs/firebase.js';
import { isValidEmail } from '../utils/helper.js';

class User {
  constructor(data) {
    this.email = data.email;
    this.firstName = data.firstName || '';
    this.lastName = data.lastName || '';
    this.verificationCode = data.verificationCode;
    this.codeExpiresAt = data.codeExpiresAt;
    this.verified = data.verified || false;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  validate() {
    const errors = [];

    if (!this.email || !isValidEmail(this.email)) {
      errors.push('Email không hợp lệ');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  toFirestore() {
    return {
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      verificationCode: this.verificationCode,
      codeExpiresAt: this.codeExpiresAt,
      verified: this.verified,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  static async create(userData) {
    const user = new User(userData);
    const validation = user.validate();

    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    const docRef = await db.collection('users').add(user.toFirestore());
    return { id: docRef.id, ...user.toFirestore() };
  }

  static async findByEmail(email) {
    const snapshot = await db.collection('users')
      .where('email', '==', email)
      .get();

    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  }

  static async findById(userId) {
    const doc = await db.collection('users').doc(userId).get();
    
    if (!doc.exists) return null;
    
    return { id: doc.id, ...doc.data() };
  }

  static async update(userId, updateData) {
    await db.collection('users').doc(userId).update({
      ...updateData,
      updatedAt: new Date().toISOString()
    });

    return this.findById(userId);
  }

  static async delete(userId) {
    await db.collection('users').doc(userId).delete();
  }
}

export default User;