import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import type { CreateTaskRequest, UpdateTaskRequest } from '@/types/task';
import type { AttachGitHubItemRequest } from '@/types/github';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor - Add token to requests
    this.api.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('token');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - Handle errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async signup(email: string) {
    const response = await this.api.post('/auth/signup', { email });
    return response.data;
  }

  async signin(email: string, verificationCode: string) {
    const response = await this.api.post('/auth/signin', { email, verificationCode });
    return response.data;
  }

  async resendCode(email: string) {
    const response = await this.api.post('/auth/resend-code', { email });
    return response.data;
  }

  async getMe() {
    const response = await this.api.get('/auth/me');
    return response.data;
  }

  async getUserById(userId: string) {
    const response = await this.api.get(`/auth/${userId}`);
    return response.data;
  }

  async updateProfile(data: { firstName?: string; lastName?: string }) {
    const response = await this.api.put('/auth/profile', data);
    return response.data;
  }

  // Board endpoints
  async getBoards() {
    const response = await this.api.get('/boards');
    return response.data;
  }

  async getBoardDetail(boardId: string) {
    const response = await this.api.get(`/boards/${boardId}`);
    return response.data;
  }

  async createBoard(data: { name: string; description?: string }) {
    const response = await this.api.post('/boards', data);
    return response.data;
  }

  async updateBoard(boardId: string, data: { name?: string; description?: string }) {
    const response = await this.api.put(`/boards/${boardId}`, data);
    return response.data;
  }

  async deleteBoard(boardId: string) {
    const response = await this.api.delete(`/boards/${boardId}`);
    return response.data;
  }

  async inviteMember(boardId: string, email_member: string) {
    const response = await this.api.post(`/boards/${boardId}/invite`, { email_member });
    return response.data;
  }

  async getInvites() {
    const response = await this.api.get('/boards/invites');
    return response.data;
  }

  async getSentInvites() {
    const response = await this.api.get('/boards/sent-invites');
    return response.data;
  }

  async acceptInvite(boardId: string, invite_id: string, status: 'accepted' | 'declined') {
    const response = await this.api.post(`/boards/${boardId}/invite/accept`, { invite_id, status });
    return response.data;
  }

  // Card endpoints
  async getCards(boardId: string) {
    const response = await this.api.get(`/boards/${boardId}/cards`);
    return response.data;
  }

  async getCardDetail(boardId: string, cardId: string) {
    const response = await this.api.get(`/boards/${boardId}/cards/${cardId}`);
    return response.data;
  }

  async createCard(boardId: string, data: { name: string; description?: string }) {
    const response = await this.api.post(`/boards/${boardId}/cards`, data);
    return response.data;
  }

  async updateCard(boardId: string, cardId: string, data: { name?: string; description?: string }) {
    const response = await this.api.put(`/boards/${boardId}/cards/${cardId}`, data);
    return response.data;
  }

  async deleteCard(boardId: string, cardId: string) {
    const response = await this.api.delete(`/boards/${boardId}/cards/${cardId}`);
    return response.data;
  }

  // Task endpoints
  async getTasks(boardId: string, cardId: string) {
    const response = await this.api.get(`/boards/${boardId}/cards/${cardId}/tasks`);
    return response.data;
  }

  async createTask(boardId: string, cardId: string, data: CreateTaskRequest) {
    const response = await this.api.post(`/boards/${boardId}/cards/${cardId}/tasks`, data);
    return response.data;
  }

  async updateTask(boardId: string, cardId: string, taskId: string, data: UpdateTaskRequest) {
    const response = await this.api.put(`/boards/${boardId}/cards/${cardId}/tasks/${taskId}`, data);
    return response.data;
  }

  async deleteTask(boardId: string, cardId: string, taskId: string) {
    const response = await this.api.delete(`/boards/${boardId}/cards/${cardId}/tasks/${taskId}`);
    return response.data;
  }

  async assignMember(boardId: string, cardId: string, taskId: string, memberId: string) {
    const response = await this.api.post(`/boards/${boardId}/cards/${cardId}/tasks/${taskId}/assign`, { memberId });
    return response.data;
  }

  async unassignMember(boardId: string, cardId: string, taskId: string, memberId: string) {
    const response = await this.api.delete(`/boards/${boardId}/cards/${cardId}/tasks/${taskId}/assign/${memberId}`);
    return response.data;
  }

  // GitHub endpoints
  async checkGitHubConnection() {
    const response = await this.api.get('/github/check-connection');
    return response.data;
  }

  async disconnectGitHub() {
    const response = await this.api.post('/github/disconnect');
    return response.data;
  }

  async getGitHubRepositories() {
    const response = await this.api.get('/github/repositories');
    return response.data;
  }

  async getRepositoryInfo(repositoryId: string) {
    const response = await this.api.get(`/github/repositories/${repositoryId}/github-info`);
    return response.data;
  }

  async attachGitHubItem(boardId: string, cardId: string, taskId: string, data: AttachGitHubItemRequest) {
    const response = await this.api.post(
      `/github/boards/${boardId}/cards/${cardId}/tasks/${taskId}/github-attach`,
      data
    );
    return response.data;
  }

  async getTaskAttachments(boardId: string, cardId: string, taskId: string) {
    const response = await this.api.get(
      `/github/boards/${boardId}/cards/${cardId}/tasks/${taskId}/github-attachments`
    );
    return response.data;
  }

  async removeAttachment(boardId: string, cardId: string, taskId: string, attachmentId: string) {
    const response = await this.api.delete(
      `/github/boards/${boardId}/cards/${cardId}/tasks/${taskId}/github-attachments/${attachmentId}`
    );
    return response.data;
  }

  async handleGitHubCallback(code: string) {
    const response = await this.api.get(`/github/callback?code=${code}`);
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;