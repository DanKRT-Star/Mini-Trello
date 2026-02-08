export interface Card {
  id: string;
  boardId: string;
  name: string;
  description: string;
  ownerId: string;
  list_member: string[];
  tasks_count: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCardRequest {
  name: string;
  description?: string;
}

export interface UpdateCardRequest {
  name?: string;
  description?: string;
}

export interface CardState {
  cards: Card[];
  currentCard: Card | null;
  loading: boolean;
  error: string | null;
  
  fetchCards: (boardId: string) => Promise<void>;
  fetchCardDetail: (boardId: string, cardId: string) => Promise<void>;
  createCard: (boardId: string, data: CreateCardRequest) => Promise<Card>;
  updateCard: (boardId: string, cardId: string, data: UpdateCardRequest) => Promise<Card>;
  deleteCard: (boardId: string, cardId: string) => Promise<void>;
  clearError: () => void;
}

