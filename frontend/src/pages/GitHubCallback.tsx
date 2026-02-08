import { useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useGitHubStore } from '@/stores/githubStore';
import { Loader2 } from 'lucide-react';
import { apiService } from '@/services/api';
import toast from 'react-hot-toast';
import type { AxiosError } from 'axios';

export default function GitHubCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { token } = useAuthStore();
  const { checkConnection } = useGitHubStore();

  const handleCallback = useCallback(async () => {
    const code = searchParams.get('code');

    if (!code) {
      toast.error('Không nhận được code từ GitHub');
      navigate('/settings');
      return;
    }

    if (!token) {
      toast.error('Bạn cần đăng nhập trước');
      navigate('/login');
      return;
    }

    try {
      // Call backend to exchange code for token
      const response = await apiService.handleGitHubCallback(code);

      if (response.success) {
        toast.success(`Kết nối GitHub thành công! Username: @${response.githubUsername}`);
        await checkConnection();
        navigate('/settings');
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string }> | unknown;
      console.error('GitHub callback error:', axiosError);
      toast.error('Lỗi khi kết nối GitHub');
      navigate('/settings');
    }
  }, [searchParams, token, navigate, checkConnection]);

  useEffect(() => {
    handleCallback();
  }, [handleCallback]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
        <p className="text-gray-600">Đang kết nối với GitHub...</p>
      </div>
    </div>
  );
}