import { useEffect, useState } from 'react';
import { useGitHubStore } from '@/stores/githubStore';
import { useAuthStore } from '@/stores/authStore';
import { Github, Unlink, CheckCircle2, XCircle, Sparkles, Shield, Eye, GitBranch, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Settings() {
  const { connected, username, avatarUrl, checkConnection, connectGitHub, disconnectGitHub, loading: ghLoading } = useGitHubStore();
  const { user, updateProfile, loading: authLoading } = useAuthStore();
  
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  useEffect(() => {
    setFirstName(user?.firstName || '');
    setLastName(user?.lastName || '');
  }, [user]);

  const handleSaveProfile = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      toast.error('Họ và tên không được để trống');
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile(firstName.trim(), lastName.trim());
      setIsEditing(false);
    } catch {
      // Error is already handled by toast in the store
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-purple-50 to-pink-50">
      {/* Decorative Background */}
      <div className="bg-decorative opacity-50">
        <div className="bg-blob-purple top-20 right-20 animate-blob"></div>
        <div className="bg-blob-blue bottom-20 left-20 animate-blob animation-delay-2000"></div>
      </div>

      <main className="relative max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8 pb-20">
        {/* GitHub Integration */}
        <div className="card p-8 mb-8 animate-fadeIn">
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center shadow-lg">
                <Github className="w-9 h-9 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">GitHub Integration</h2>
                <p className="text-gray-600">
                  Kết nối với GitHub để attach PRs, commits và issues vào tasks
                </p>
              </div>
            </div>
          </div>

          {connected ? (
            <div className="space-y-6">
              {/* Connected Status */}
              <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-green-50 to-emerald-50 border-2 border-green-200 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <CheckCircle2 className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-lg font-bold text-green-800 mb-1">Đã kết nối với GitHub</p>
                    {username && (
                      <div className="flex items-center gap-3 mt-2">
                        {avatarUrl && (
                          <img
                            src={avatarUrl}
                            alt={username}
                            className="w-8 h-8 rounded-full border-2 border-white shadow-md"
                          />
                        )}
                        <p className="text-sm font-semibold text-green-700">@{username}</p>
                      </div>
                    )}
                  </div>
                  <Sparkles className="w-8 h-8 text-green-500 animate-pulse" />
                </div>
                {/* Animated background effect */}
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 translate-x-full group-hover:-translate-x-full transition-transform duration-1000"></div>
              </div>

              {/* Disconnect Button */}
              <button
                onClick={disconnectGitHub}
                disabled={ghLoading}
                className="btn-danger w-full sm:w-auto"
              >
                <div className="flex items-center gap-2">
                  <Unlink className="w-5 h-5" />
                  <span>Ngắt kết nối GitHub</span>
                </div>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Not Connected Status */}
              <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-gray-50 to-slate-100 border-2 border-gray-200 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gray-400 rounded-2xl flex items-center justify-center shadow-lg">
                    <XCircle className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-lg font-bold text-gray-700 mb-1">Chưa kết nối GitHub</p>
                    <p className="text-sm text-gray-500">
                      Kết nối để sử dụng tính năng attach GitHub items vào tasks
                    </p>
                  </div>
                </div>
              </div>

              {/* Connect Button */}
              <button
                onClick={connectGitHub}
                className="btn-primary w-full sm:w-auto"
              >
                <div className="flex items-center gap-2">
                  <Github className="w-5 h-5" />
                  <span>Kết nối với GitHub</span>
                </div>
              </button>
            </div>
          )}

          {/* Permissions Info */}
          <div className="mt-8 p-6 bg-linear-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-blue-900">Quyền truy cập</h3>
            </div>
            <ul className="space-y-2.5 text-sm text-blue-700">
              <li className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-600" />
                <span className="font-medium">Đọc thông tin repositories</span>
              </li>
              <li className="flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-blue-600" />
                <span className="font-medium">Xem branches, pull requests và issues</span>
              </li>
              <li className="flex items-center gap-2">
                <Github className="w-4 h-4 text-blue-600" />
                <span className="font-medium">Xem commits history</span>
              </li>
            </ul>
          </div>
        </div>

          {/* Account Settings */}
        <div className="card p-8 animate-fadeIn animation-delay-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-linear-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            Tài khoản
          </h2>
          <div className="space-y-6">
            {/* Profile Info Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Thông tin cá nhân</h3>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                  >
                    Chỉnh sửa
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {/* First Name */}
                <div>
                  <label className="label flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                    Tên
                  </label>
                  <input
                    type="text"
                    className={`w-full ${isEditing ? 'input-field' : 'input-field bg-gray-50 text-gray-500 cursor-not-allowed'}`}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={!isEditing || isSaving}
                    placeholder="Nhập tên..."
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label className="label flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                    Họ
                  </label>
                  <input
                    type="text"
                    className={`w-full ${isEditing ? 'input-field' : 'input-field bg-gray-50 text-gray-500 cursor-not-allowed'}`}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={!isEditing || isSaving}
                    placeholder="Nhập họ..."
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="label flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3.5 bg-linear-to-r from-gray-50 to-slate-100 border-2 border-gray-300 rounded-xl text-gray-500 cursor-not-allowed"
                    value={user?.email || ''}
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-2 ml-1">Email không thể thay đổi</p>
                </div>
              </div>

              {/* Save/Cancel Buttons */}
              {isEditing && (
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setFirstName(user?.firstName || '');
                      setLastName(user?.lastName || '');
                    }}
                    className="btn-secondary flex-1"
                    disabled={isSaving}
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                    disabled={isSaving || authLoading}
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      
    </div>
  );
}