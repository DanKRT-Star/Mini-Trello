import { io, Socket } from 'socket.io-client';
import type {
  BoardUpdatedData,
  CardCreatedData,
  CardUpdatedData,
  CardDeletedData,
  TaskCreatedData,
  TaskUpdatedData,
  TaskDeletedData,
  TaskMovedData,
  UserJoinedData,
  UserLeftData,
} from '@/types/socket';

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

class SocketService {
  private socket: Socket | null = null;

  connect(token: string) {
    if (this.socket?.connected) return;

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Board events
  joinBoard(boardId: string) {
    this.socket?.emit('join-board', boardId);
  }

  leaveBoard(boardId: string) {
    this.socket?.emit('leave-board', boardId);
  }

  onBoardUpdated(callback: (data: BoardUpdatedData) => void) {
    this.socket?.on('board-updated', callback);
  }

  emitBoardUpdate(data: BoardUpdatedData) {
    this.socket?.emit('board-update', data);
  }

  // Card events
  onCardCreated(callback: (data: CardCreatedData) => void) {
    this.socket?.on('card-created', callback);
  }

  onCardUpdated(callback: (data: CardUpdatedData) => void) {
    this.socket?.on('card-updated', callback);
  }

  onCardDeleted(callback: (data: CardDeletedData) => void) {
    this.socket?.on('card-deleted', callback);
  }

  emitCardCreated(data: CardCreatedData) {
    this.socket?.emit('card-created', data);
  }

  emitCardUpdated(data: CardUpdatedData) {
    this.socket?.emit('card-update', data);
  }

  emitCardDeleted(data: CardDeletedData) {
    this.socket?.emit('card-deleted', data);
  }

  // Task events
  onTaskCreated(callback: (data: TaskCreatedData) => void) {
    this.socket?.on('task-created', callback);
  }

  onTaskUpdated(callback: (data: TaskUpdatedData) => void) {
    this.socket?.on('task-updated', callback);
  }

  onTaskDeleted(callback: (data: TaskDeletedData) => void) {
    this.socket?.on('task-deleted', callback);
  }

  onTaskMoved(callback: (data: TaskMovedData) => void) {
    this.socket?.on('task-moved', callback);
  }

  emitTaskCreated(data: TaskCreatedData) {
    this.socket?.emit('task-created', data);
  }

  emitTaskUpdated(data: TaskUpdatedData) {
    this.socket?.emit('task-update', data);
  }

  emitTaskDeleted(data: TaskDeletedData) {
    this.socket?.emit('task-deleted', data);
  }

  emitTaskMoved(data: TaskMovedData) {
    this.socket?.emit('task-moved', data);
  }

  // User events
  onUserJoined(callback: (data: UserJoinedData) => void) {
    this.socket?.on('user-joined', callback);
  }

  onUserLeft(callback: (data: UserLeftData) => void) {
    this.socket?.on('user-left', callback);
  }

  // Remove all listeners
  removeAllListeners() {
    this.socket?.removeAllListeners();
  }
}

export const socketService = new SocketService();
export default socketService;