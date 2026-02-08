// src/stores/authStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthState, User } from '@/types/auth';
import { apiService } from '@/services/api';
import toast from 'react-hot-toast';
import type { AxiosError } from 'axios';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      signup: async (email: string) => {
        set({ loading: true, error: null });
        try {
          const response = await apiService.signup(email);
          set({ loading: false });
          toast.success('Mã xác thực đã được gửi đến email của bạn!');
          return response;
        } catch (error) {
          const axiosError = error as AxiosError<{ error: string }> | unknown;
          const errorMessage = (axiosError as AxiosError<{ error: string }>)?.response?.data?.error || 'Có lỗi xảy ra khi đăng ký';
          set({ loading: false, error: errorMessage });
          toast.error(errorMessage);
          throw error;
        }
      },

      signin: async (email: string, verificationCode: string) => {
        set({ loading: true, error: null });
        try {
          const response = await apiService.signin(email, verificationCode);
          
          // Save to localStorage
          localStorage.setItem('token', response.accessToken);
          localStorage.setItem('user', JSON.stringify(response.user));

          set({
            user: response.user as User,
            token: response.accessToken,
            isAuthenticated: true,
            loading: false,
          });

          toast.success('Đăng nhập thành công!');
        } catch (error) {
          const axiosError = error as AxiosError<{ error: string }> | unknown;
          const errorMessage = (axiosError as AxiosError<{ error: string }>)?.response?.data?.error || 'Đăng nhập thất bại';
          set({ loading: false, error: errorMessage });
          toast.error(errorMessage);
          throw error;
        }
      },

      resendCode: async (email: string) => {
        set({ loading: true, error: null });
        try {
          await apiService.resendCode(email);
          set({ loading: false });
          toast.success('Mã xác thực mới đã được gửi!');
        } catch (error) {
          const axiosError = error as AxiosError<{ error: string }> | unknown;
          const errorMessage = (axiosError as AxiosError<{ error: string }>)?.response?.data?.error || 'Không thể gửi lại mã';
          set({ loading: false, error: errorMessage });
          toast.error(errorMessage);
          throw error;
        }
      },

      getMe: async () => {
        try {
          const user = await apiService.getMe();
          set({ user, isAuthenticated: true });
        } catch {
          set({ user: null, token: null, isAuthenticated: false });
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      },

      updateProfile: async (firstName?: string, lastName?: string) => {
        set({ loading: true, error: null });
        try {
          const response = await apiService.updateProfile({
            firstName: firstName?.trim() || undefined,
            lastName: lastName?.trim() || undefined
          });
          
          set({
            user: response.user as User,
            loading: false,
          });

          // Update localStorage
          localStorage.setItem('user', JSON.stringify(response.user));
          toast.success('Cập nhật hồ sơ thành công!');
        } catch (error) {
          const axiosError = error as AxiosError<{ error: string }> | unknown;
          const errorMessage = (axiosError as AxiosError<{ error: string }>)?.response?.data?.error || 'Không thể cập nhật hồ sơ';
          set({ loading: false, error: errorMessage });
          toast.error(errorMessage);
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
        toast.success('Đã đăng xuất');
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);