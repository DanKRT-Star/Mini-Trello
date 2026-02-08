import { create } from 'zustand';
import type { TaskState, CreateTaskRequest, UpdateTaskRequest, TaskStatus } from '@/types/task';
import { apiService } from '@/services/api';
import toast from 'react-hot-toast';
import type { AxiosError } from 'axios';

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  loading: false,
  error: null,

  fetchTasks: async (boardId: string, cardId: string) => {
    set({ loading: true, error: null });
    try {
      const tasks = await apiService.getTasks(boardId, cardId);
      set({ tasks, loading: false });
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string }> | unknown;
      const errorMessage = (axiosError as AxiosError<{ error: string }>)?.response?.data?.error || 'Không thể tải tasks';
      set({ loading: false, error: errorMessage });
      toast.error(errorMessage);
    }
  },

  createTask: async (boardId: string, cardId: string, data: CreateTaskRequest) => {
    set({ loading: true, error: null });
    try {
      const task = await apiService.createTask(boardId, cardId, data);
      set((state) => ({
        tasks: [...state.tasks, task],
        loading: false,
      }));
      toast.success('Tạo task thành công!');
      return task;
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string }> | unknown;
      const errorMessage = (axiosError as AxiosError<{ error: string }>)?.response?.data?.error || 'Không thể tạo task';
      set({ loading: false, error: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  },

  updateTask: async (boardId: string, cardId: string, taskId: string, data: UpdateTaskRequest) => {
    set({ loading: true, error: null });
    try {
      const updatedTask = await apiService.updateTask(boardId, cardId, taskId, data);
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === taskId ? updatedTask : t)),
        loading: false,
      }));
      toast.success('Cập nhật task thành công!');
      return updatedTask;
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string }> | unknown;
      const errorMessage = (axiosError as AxiosError<{ error: string }>)?.response?.data?.error || 'Không thể cập nhật task';
      set({ loading: false, error: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  },

  deleteTask: async (boardId: string, cardId: string, taskId: string) => {
    set({ loading: true, error: null });
    try {
      await apiService.deleteTask(boardId, cardId, taskId);
      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== taskId),
        loading: false,
      }));
      toast.success('Xóa task thành công!');
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string }> | unknown;
      const errorMessage = (axiosError as AxiosError<{ error: string }>)?.response?.data?.error || 'Không thể xóa task';
      set({ loading: false, error: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  },

  moveTask: (taskId: string, newStatus: TaskStatus) => {
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)),
    }));
  },

  assignMember: async (boardId: string, cardId: string, taskId: string, memberId: string) => {
    try {
      await apiService.assignMember(boardId, cardId, taskId, memberId);
      toast.success('Assign member thành công!');
      // Reload tasks
      useTaskStore.getState().fetchTasks(boardId, cardId);
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string }> | unknown;
      const errorMessage = (axiosError as AxiosError<{ error: string }>)?.response?.data?.error || 'Không thể assign member';
      toast.error(errorMessage);
      throw error;
    }
  },

  unassignMember: async (boardId: string, cardId: string, taskId: string, memberId: string) => {
    try {
      await apiService.unassignMember(boardId, cardId, taskId, memberId);
      toast.success('Unassign member thành công!');
      // Reload tasks
      useTaskStore.getState().fetchTasks(boardId, cardId);
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string }> | unknown;
      const errorMessage = (axiosError as AxiosError<{ error: string }>)?.response?.data?.error || 'Không thể unassign member';
      toast.error(errorMessage);
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));