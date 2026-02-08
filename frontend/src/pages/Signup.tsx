import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Mail, Loader2, ArrowRight, Sparkles, AlertCircle, CheckCircle, PartyPopper } from 'lucide-react';

export default function Signup() {
  const navigate = useNavigate();
  const { signup, loading, error } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'email' | 'success'>('email');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await signup(email);
      setStep('success');
    } catch {
      // Error handled by store
    }
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-page px-4 py-8 relative overflow-hidden">
        {/* Animated Background */}
        <div className="bg-decorative">
          <div className="bg-blob-green top-20 left-10 animate-blob"></div>
          <div className="bg-blob-blue top-40 right-10 animate-blob animation-delay-2000"></div>
          <div className="bg-blob-purple -bottom-20 left-1/2 animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-md w-full relative z-10">
          <div className="card p-10 text-center animate-scaleIn">
            {/* Success Animation */}
            <div className="relative inline-block mb-8">
              <div className="w-24 h-24 bg-linear-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-green-500/40 animate-bounce">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-10 h-10 bg-linear-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                <PartyPopper className="w-5 h-5 text-white" />
              </div>
            </div>
            
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-linear-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Email đã được gửi!
              </span>
            </h2>
            
            <p className="text-gray-600 mb-3 text-lg">
              Chúng tôi đã gửi mã xác thực 6 số đến:
            </p>
            <div className="mb-8 p-4 bg-linear-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
              <p className="text-purple-700 font-bold text-xl break-all">
                {email}
              </p>
            </div>
            
            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 mb-8">
              <div className="flex items-start gap-3 text-left">
                <Mail className="w-6 h-6 text-blue-600 shrink-0 mt-1" />
                <div>
                  <p className="text-gray-700 font-medium mb-2">
                    Vui lòng kiểm tra email (bao gồm thư mục Spam) và sử dụng mã để đăng nhập vào ứng dụng.
                  </p>
                  <p className="text-gray-600 text-sm flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                    Mã sẽ hết hạn sau 24 giờ
                  </p>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => navigate('/login')}
              className="btn-primary w-full mb-4"
            >
              <div className="flex items-center justify-center gap-2">
                <span>Đi đến trang đăng nhập</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
              <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>

            <button
              onClick={() => setStep('email')}
              className="btn-secondary w-full"
            >
              Quay lại
            </button>
          </div>
        </div>
      </div>
    );
  }

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
          <p className="text-gray-600 text-lg font-medium">Bắt đầu quản lý công việc của bạn</p>
        </div>

        {/* Form Card */}
        <div className="card p-8 animate-scaleIn">
          <h2 className="text-3xl font-bold mb-6">
            <span className="gradient-text">
              Đăng ký miễn phí
            </span>
          </h2>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg animate-slideIn">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-800 mb-1">Không thể đăng ký</p>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
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
              <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-xs text-purple-700 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Chúng tôi sẽ gửi mã xác thực 6 số đến email này
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-8"
            >
              <div className="flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    <span>Đăng ký tài khoản</span>
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
              Đã có tài khoản?{' '}
              <Link 
                to="/login" 
                className="font-bold gradient-text hover:from-violet-700 hover:to-purple-700 transition-all"
              >
                Đăng nhập ngay →
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