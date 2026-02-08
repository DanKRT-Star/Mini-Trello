import { create } from 'zustand';
import type { BoardState, CreateBoardRequest, UpdateBoardRequest } from '@/types/board';
import { apiService } from '@/services/api';
import toast from 'react-hot-toast';
import type { AxiosError } from 'axios';

export const useBoardStore = create<BoardState>((set, get) => ({
  boards: [],
  currentBoard: null,
  invites: [],
  loading: false,
  error: null,

  fetchBoards: async () => {
    set({ loading: true, error: null });
    try {
      const boards = await apiService.getBoards();
      set({ boards, loading: false });
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string }> | unknown;
      const errorMessage = (axiosError as AxiosError<{ error: string }>)?.response?.data?.error || 'Không thể tải boards';
      set({ loading: false, error: errorMessage });
      toast.error(errorMessage);
    }
  },

  fetchBoardDetail: async (boardId: string) => {
    set({ loading: true, error: null });
    try {
      const board = await apiService.getBoardDetail(boardId);
      set({ currentBoard: board, loading: false });
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string }> | unknown;
      const errorMessage = (axiosError as AxiosError<{ error: string }>)?.response?.data?.error || 'Không thể tải board';
      set({ loading: false, error: errorMessage });
      toast.error(errorMessage);
    }
  },

  createBoard: async (data: CreateBoardRequest) => {
    set({ loading: true, error: null });
    try {
      const board = await apiService.createBoard(data);
      set((state) => ({
        boards: [...state.boards, board],
        loading: false,
      }));
      toast.success('Tạo board thành công!');
      return board;
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string }> | unknown;
      const errorMessage = (axiosError as AxiosError<{ error: string }>)?.response?.data?.error || 'Không thể tạo board';
      set({ loading: false, error: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  },

  updateBoard: async (boardId: string, data: UpdateBoardRequest) => {
    set({ loading: true, error: null });
    try {
      const updatedBoard = await apiService.updateBoard(boardId, data);
      set((state) => ({
        boards: state.boards.map((b) => (b.id === boardId ? updatedBoard : b)),
        currentBoard: state.currentBoard?.id === boardId ? updatedBoard : state.currentBoard,
        loading: false,
      }));
      toast.success('Cập nhật board thành công!');
      return updatedBoard;
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string }> | unknown;
      const errorMessage = (axiosError as AxiosError<{ error: string }>)?.response?.data?.error || 'Không thể cập nhật board';
      set({ loading: false, error: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  },

  deleteBoard: async (boardId: string) => {
    set({ loading: true, error: null });
    try {
      await apiService.deleteBoard(boardId);
      set((state) => ({
        boards: state.boards.filter((b) => b.id !== boardId),
        currentBoard: state.currentBoard?.id === boardId ? null : state.currentBoard,
        loading: false,
      }));
      toast.success('Xóa board thành công!');
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string }> | unknown;
      const errorMessage = (axiosError as AxiosError<{ error: string }>)?.response?.data?.error || 'Không thể xóa board';
      set({ loading: false, error: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  },

  inviteMember: async (boardId: string, email: string) => {
    set({ loading: true, error: null });
    try {
      await apiService.inviteMember(boardId, email);
      set({ loading: false });
      toast.success('Lời mời đã được gửi!');
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string }> | unknown;
      const errorMessage = (axiosError as AxiosError<{ error: string }>)?.response?.data?.error || 'Không thể gửi lời mời';
      set({ loading: false, error: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  },

  fetchInvites: async () => {
    set({ loading: true, error: null });
    try {
      const invites = await apiService.getInvites();
      set({ invites, loading: false });
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string }> | unknown;
      const errorMessage = (axiosError as AxiosError<{ error: string }>)?.response?.data?.error || 'Không thể tải lời mời';
      set({ loading: false, error: errorMessage });
      toast.error(errorMessage);
    }
  },

  acceptInvite: async (boardId: string, inviteId: string, status: 'accepted' | 'declined') => {
    set({ loading: true, error: null });
    try {
      await apiService.acceptInvite(boardId, inviteId, status);
      set({ loading: false });
      
      if (status === 'accepted') {
        toast.success('Đã chấp nhận lời mời!');
        // Reload boards
        get().fetchBoards();
        // reload invites
        get().fetchInvites?.();
      } else {
        toast.success('Đã từ chối lời mời');
        get().fetchInvites?.();
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string }> | unknown;
      const errorMessage = (axiosError as AxiosError<{ error: string }>)?.response?.data?.error || 'Không thể xậ lý lời mời';
      set({ loading: false, error: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));