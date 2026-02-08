import type { Board } from './board';
import type { Card } from './card';
import type { Task } from './task';
import type { User } from './auth';

// Board socket events
export interface BoardUpdatedData {
  board: Board;
}

// Card socket events
export interface CardCreatedData {
  card: Card;
}

export interface CardUpdatedData {
  card: Card;
}

export interface CardDeletedData {
  cardId: string;
  boardId: string;
}

// Task socket events
export interface TaskCreatedData {
  task: Task;
  cardId: string;
  boardId: string;
}

export interface TaskUpdatedData {
  task: Task;
  cardId: string;
  boardId: string;
}

export interface TaskDeletedData {
  taskId: string;
  cardId: string;
  boardId: string;
}

export interface TaskMovedData {
  taskId: string;
  oldStatus: string;
  newStatus: string;
  cardId: string;
  boardId: string;
}

// User socket events
export interface UserJoinedData {
  user: User;
  boardId: string;
}

export interface UserLeftData {
  userId: string;
  boardId: string;
}
