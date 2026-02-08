import { create } from 'zustand';
import type { CardState, CreateCardRequest, UpdateCardRequest } from '@/types/card';
import { apiService } from '@/services/api';
import toast from 'react-hot-toast';
import type { AxiosError } from 'axios';

export const useCardStore = create<CardState>((set) => ({
  cards: [],
  currentCard: null,
  loading: false,
  error: null,

  fetchCards: async (boardId: string) => {
    set({ loading: true, error: null });
    try {
      const cards = await apiService.getCards(boardId);
      set({ cards, loading: false });
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string }> | unknown;
      const errorMessage = (axiosError as AxiosError<{ error: string }>)?.response?.data?.error || 'Không thể tải cards';
      set({ loading: false, error: errorMessage });
      toast.error(errorMessage);
    }
  },

  fetchCardDetail: async (boardId: string, cardId: string) => {
    set({ loading: true, error: null });
    try {
      const card = await apiService.getCardDetail(boardId, cardId);
      set({ currentCard: card, loading: false });
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string }> | unknown;
      const errorMessage = (axiosError as AxiosError<{ error: string }>)?.response?.data?.error || 'Không thể tải card';
      set({ loading: false, error: errorMessage });
      toast.error(errorMessage);
    }
  },

  createCard: async (boardId: string, data: CreateCardRequest) => {
    set({ loading: true, error: null });
    try {
      const card = await apiService.createCard(boardId, data);
      set((state) => ({
        cards: [...state.cards, card],
        loading: false,
      }));
      toast.success('Tạo card thành công!');
      return card;
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string }> | unknown;
      const errorMessage = (axiosError as AxiosError<{ error: string }>)?.response?.data?.error || 'Không thể tạo card';
      set({ loading: false, error: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  },

  updateCard: async (boardId: string, cardId: string, data: UpdateCardRequest) => {
    set({ loading: true, error: null });
    try {
      const updatedCard = await apiService.updateCard(boardId, cardId, data);
      set((state) => ({
        cards: state.cards.map((c) => (c.id === cardId ? updatedCard : c)),
        currentCard: state.currentCard?.id === cardId ? updatedCard : state.currentCard,
        loading: false,
      }));
      toast.success('Cập nhật card thành công!');
      return updatedCard;
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string }> | unknown;
      const errorMessage = (axiosError as AxiosError<{ error: string }>)?.response?.data?.error || 'Không thể cập nhật card';
      set({ loading: false, error: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  },

  deleteCard: async (boardId: string, cardId: string) => {
    set({ loading: true, error: null });
    try {
      await apiService.deleteCard(boardId, cardId);
      set((state) => ({
        cards: state.cards.filter((c) => c.id !== cardId),
        currentCard: state.currentCard?.id === cardId ? null : state.currentCard,
        loading: false,
      }));
      toast.success('Xóa card thành công!');
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string }> | unknown;
      const errorMessage = (axiosError as AxiosError<{ error: string }>)?.response?.data?.error || 'Không thể xóa card';
      set({ loading: false, error: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
