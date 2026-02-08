import { create } from 'zustand';
import type { GitHubState, AttachGitHubItemRequest } from '@/types/github';
import { apiService } from '@/services/api';
import toast from 'react-hot-toast';
import type { AxiosError } from 'axios';

export const useGitHubStore = create<GitHubState>((set) => ({
  connected: false,
  username: null,
  avatarUrl: null,
  repositories: [],
  loading: false,
  error: null,

  checkConnection: async () => {
    try {
      const response = await apiService.checkGitHubConnection();
      set({
        connected: response.connected,
        username: response.githubUsername,
        avatarUrl: response.githubAvatarUrl,
      });
    } catch {
      set({ connected: false, username: null, avatarUrl: null });
    }
  },

  connectGitHub: () => {
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
    const redirectUri = `${import.meta.env.VITE_FRONTEND_URL}/auth/github/callback`;
    const scope = 'repo,read:user';
    
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
    window.location.href = githubAuthUrl;
  },

  disconnectGitHub: async () => {
    set({ loading: true, error: null });
    try {
      await apiService.disconnectGitHub();
      set({
        connected: false,
        username: null,
        avatarUrl: null,
        repositories: [],
        loading: false,
      });
      toast.success('Đã ngắt kết nối với GitHub');
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string }> | unknown;
      const errorMessage = (axiosError as AxiosError<{ error: string }>)?.response?.data?.error || 'Không thể nğt kết nối GitHub';
      set({ loading: false, error: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  },

  fetchRepositories: async () => {
    set({ loading: true, error: null });
    try {
      const repositories = await apiService.getGitHubRepositories();
      set({ repositories, loading: false });
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string }> | unknown;
      const errorMessage = (axiosError as AxiosError<{ error: string }>)?.response?.data?.error || 'Không thể tải repositories';
      set({ loading: false, error: errorMessage });
      toast.error(errorMessage);
    }
  },

  fetchRepositoryInfo: async (repositoryId: string) => {
    set({ loading: true, error: null });
    try {
      const info = await apiService.getRepositoryInfo(repositoryId);
      set({ loading: false });
      return info;
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string }> | unknown;
      const errorMessage = (axiosError as AxiosError<{ error: string }>)?.response?.data?.error || 'Không thể tải thông tin repository';
      set({ loading: false, error: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  },

  attachToTask: async (boardId: string, cardId: string, taskId: string, data: AttachGitHubItemRequest) => {
    set({ loading: true, error: null });
    try {
      await apiService.attachGitHubItem(boardId, cardId, taskId, data);
      set({ loading: false });
      toast.success('Đã attach GitHub item!');
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string }> | unknown;
      const errorMessage = (axiosError as AxiosError<{ error: string }>)?.response?.data?.error || 'Không thể attach GitHub item';
      set({ loading: false, error: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  },

  fetchTaskAttachments: async (boardId: string, cardId: string, taskId: string) => {
    try {
      const attachments = await apiService.getTaskAttachments(boardId, cardId, taskId);
      return attachments;
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string }> | unknown;
      const errorMessage = (axiosError as AxiosError<{ error: string }>)?.response?.data?.error || 'Không thể tải attachments';
      toast.error(errorMessage);
      throw error;
    }
  },

  removeAttachment: async (boardId: string, cardId: string, taskId: string, attachmentId: string) => {
    try {
      await apiService.removeAttachment(boardId, cardId, taskId, attachmentId);
      toast.success('Đã xóa attachment!');
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string }> | unknown;
      const errorMessage = (axiosError as AxiosError<{ error: string }>)?.response?.data?.error || 'Không thể xóa attachment';
      toast.error(errorMessage);
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
