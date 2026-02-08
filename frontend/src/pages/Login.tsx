import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Mail, Key, Loader2, Sparkles, ArrowRight, AlertCircle, RotateCcw } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { signin, resendCode, loading, error } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  // Countdown timer effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (resendCountdown > 0) {
      interval = setInterval(() => {
        setResendCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendCountdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await signin(email, verificationCode);
      navigate('/dashboard');
    } catch {
      // Error handling is already done in the store
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      return;
    }
    
    setResendLoading(true);
    try {
      await resendCode(email);
      setResendCountdown(60); // 60 seconds cooldown
    } catch {
      // Error handling is already done in the store
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-page px-4 py-8 relative overflow-hidden">
      {/* Animated Background */}
      <div className="bg-decorative">
        <div className="bg-blob-purple top-20 left-10 animate-blob"></div>
        <div className="bg-blob-pink top-40 right-10 animate-blob animation-delay-2000"></div>
        <div className="bg-blob-blue -bottom-20 left-1/2 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-8 animate-fadeIn">
          <div className="relative inline-block mb-6">
            <div className="w-20 h-20 bg-linear-to-br from-violet-500 via-purple-600 to-pink-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/40 transform hover:scale-110 transition-all duration-300">
              <Sparkles className="w-10 h-10 text-white animate-pulse" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-linear-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
          <h1 className="text-5xl font-bold gradient-text mb-3">
            Mini Trello
          </h1>
          <p className="text-gray-600 text-lg font-medium">Quản lý công việc hiệu quả</p>
        </div>

        {/* Form Card */}
        <div className="card p-8 animate-scaleIn">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="gradient-text">
              Đăng nhập
            </span>
          </h2>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg animate-slideIn">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-800 mb-1">Lỗi đăng nhập</p>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="group">
              <label className="flex items-center gap-2 mb-2">
                <Mail className="w-4 h-4 text-purple-600" />
                Email của bạn
              </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="name@example.com"
                  required
                />
            </div>

            {/* Code Field */}
            <div className="group">
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-purple-600" />
                  Mã xác thực (6 số)
                </label>
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resendLoading || resendCountdown > 0 || !email}
                  className="text-xs font-semibold text-purple-600 hover:text-purple-700 disabled:text-gray-400 transition-colors flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  {resendCountdown > 0 ? `${resendCountdown}s` : 'Gửi lại'}
                </button>
              </div>
              <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="input-field tracking-widest font-bold text-lg"
                  placeholder="000000"
                  maxLength={6}
                  required
              />
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-700 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Kiểm tra email (bao gồm Spam) để lấy mã. Nếu hết hạn, bấm "Gửi lại"
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-8"
            >
              <div className="flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Đang đăng nhập...</span>
                  </>
                ) : (
                  <>
                    <span>Đăng nhập vào Dashboard</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
              <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-gray-600">
              Chưa có tài khoản?{' '}
              <Link 
                to="/signup" 
                className="font-bold gradient-text hover:from-violet-700 hover:to-purple-700 transition-all"
              >
                Đăng ký ngay →
              </Link>
            </p>
          </div>
        </div>

        {/* Bottom Text */}
        <div className="mt-8 text-center animate-fadeIn">
          <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-medium">Bảo mật</span>
            </div>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="font-medium">Riêng tư</span>
            </div>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              <span className="font-medium">Miễn phí</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}