import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { LogOut, Settings, User, Sparkles, Menu } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="glass-effect shadow-lg border-b-2 border-purple-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="icon-container group-hover:scale-110 transition-transform">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-linear-to-br from-pink-500 to-rose-500 rounded-full shadow-lg animate-pulse"></div>
              </div>
              <span className="text-2xl font-bold gradient-text">
                Mini Trello
              </span>
            </Link>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-linear-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-300 group border-2 border-transparent hover:border-purple-200"
              >
                <div className="relative">
                  <div className="icon-container group-hover:scale-110 transition-all">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-lg"></div>
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold text-gray-700 group-hover:text-purple-700 transition-colors">
                    {user?.email?.split('@')[0]}
                  </p>
                  <p className="text-xs text-gray-500">Online</p>
                </div>
                <Menu className="w-4 h-4 text-gray-500 group-hover:text-purple-600 transition-colors" />
              </button>

              {showDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowDropdown(false)}
                  />
                  <div className="absolute right-0 mt-3 w-72 glass-effect rounded-2xl shadow-2xl border border-purple-100 z-20 animate-scaleIn overflow-hidden">
                    {/* User Info */}
                    <div className="p-5 bg-gradient-header">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white shadow-lg">
                          <User className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">TÀI KHOẢN</p>
                          <p className="text-xs text-white/80">Đang hoạt động</p>
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-white truncate bg-white/20 px-3 py-2 rounded-lg backdrop-blur-sm">
                        {user?.email}
                      </p>
                    </div>

                    {/* Menu Items */}
                    <div className="p-2">
                      <Link
                        to="/settings"
                        className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:text-purple-700 hover:bg-linear-to-r hover:from-purple-50 hover:to-pink-50 rounded-xl transition-all duration-300 group"
                        onClick={() => setShowDropdown(false)}
                      >
                        <div className="icon-container-blue w-9 h-9 group-hover:scale-110 transition-transform">
                          <Settings className="w-4 h-4" />
                        </div>
                        <span className="font-semibold">Cài đặt</span>
                      </Link>
                      
                      {/* Logout */}
                      <div className="my-2 border-t border-gray-200"></div>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-300 font-semibold group"
                      >
                        <div className="w-9 h-9 bg-linear-to-br from-red-100 to-rose-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                          <LogOut className="w-4 h-4 text-red-600" />
                        </div>
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}