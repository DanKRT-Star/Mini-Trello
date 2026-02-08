import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBoardStore } from '@/stores/boardStore';
import { Plus, Users, Calendar, Sparkles, Mail, Send } from 'lucide-react';
import CreateBoardModal from '@/components/board/CreateBoardModal';
import InvitationsModal from '@/components/board/InvitationsModal';
import SentInvitationsModal from '@/components/board/SentInvitationsModal';

export default function Dashboard() {
  const navigate = useNavigate();
  const { boards, loading, fetchBoards } = useBoardStore();
  const { invites = [], fetchInvites } = useBoardStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInvites, setShowInvites] = useState(false);
  const [showSentInvites, setShowSentInvites] = useState(false);

  useEffect(() => {
    fetchBoards();
    if (fetchInvites) fetchInvites();
  }, [fetchBoards, fetchInvites]);

  const handleBoardClick = (boardId: string) => {
    navigate(`/board/${boardId}`);
  };

  const gradients = [
    'from-violet-500 to-purple-600',
    'from-blue-500 to-cyan-600',
    'from-emerald-500 to-teal-600',
    'from-orange-500 to-pink-600',
    'from-rose-500 to-pink-600',
    'from-indigo-500 to-purple-600',
  ];

  return (
    <div className="min-h-screen bg-gradient-page">
      {/* Decorative Background */}
      <div className="bg-decorative">
        <div className="bg-blob-purple top-20 right-20 animate-blob"></div>
        <div className="bg-blob-pink -bottom-40 -left-40 animate-blob animation-delay-2000"></div>
        <div className="bg-blob-blue top-40 left-40 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className="relative max-w-7xl mx-auto p-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-end md:items-center justify-between gap-4">
          <div className="animate-fadeIn flex items-center gap-4">
            <div className="icon-container hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-4xl font-bold gradient-text">
                Boards của bạn
              </h1>
              <p className="text-gray-600 text-sm">
                Quản lý tất cả dự án của bạn một cách hiệu quả
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowInvites(true)}
              className="relative inline-flex items-center px-3 py-2 bg-white border rounded-lg"
              title="Lời mời nhận được"
            >
              <Mail className="w-4 h-4 text-gray-600" />
              {invites.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-xs rounded-full px-2">{invites.length}</span>
              )}
            </button>

            <button
              onClick={() => setShowSentInvites(true)}
              className="inline-flex items-center px-3 py-2 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
              title="Lời mời đã gửi"
            >
              <Send className="w-4 h-4 text-gray-600" />
            </button>

            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                <span>Tạo Board Mới</span>
              </div>
              <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="relative max-w-7xl mx-auto p-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="loading-container">
            <div className="relative">
              <div className="loading-spinner"></div>
              <Sparkles className="w-6 h-6 text-purple-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="text-gray-600 text-lg mt-6 font-medium">Đang tải boards...</p>
          </div>
        ) : boards.length === 0 ? (
          <div className="card p-16 text-center animate-scaleIn">
            <div className="relative inline-block mb-8">
              <div className="empty-state-icon">
                <Plus className="w-12 h-12 text-purple-600" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-linear-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center shadow-lg">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </div>
            <h3 className="text-3xl font-bold gradient-text mb-3">
              Chưa có board nào
            </h3>
            <p className="text-gray-600 mb-10 text-lg max-w-md mx-auto">
              Tạo board đầu tiên để bắt đầu quản lý công việc của bạn một cách chuyên nghiệp
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary inline-flex"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              <span>Tạo Board Đầu Tiên</span>
              <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
            {boards.map((board, index) => (
              <div
                key={board.id}
                onClick={() => handleBoardClick(board.id)}
                className="board-card animate-slideIn"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Card Header with gradient */}
                <div className={`h-32 bg-linear-to-br ${gradients[index % gradients.length]} p-6 flex items-end relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute top-4 right-4 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white drop-shadow-lg relative z-10 line-clamp-2">
                    {board.name}
                  </h3>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  {board.description ? (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 h-10">
                      {board.description}
                    </p>
                  ) : (
                    <p className="text-gray-400 text-sm italic mb-4 h-10">
                      Chưa có mô tả
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-sm text-gray-600 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 group-hover:text-purple-600 transition-colors">
                      <div className="icon-container-small">
                        <Users className="w-4 h-4 text-purple-600" />
                      </div>
                      <span className="font-semibold">{board.members.length}</span>
                    </div>
                    <div className="flex items-center gap-2 group-hover:text-blue-600 transition-colors">
                      <div className="w-8 h-8 bg-linear-to-br from-blue-100 to-cyan-100 rounded-lg flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="text-xs font-medium">
                        {new Date(board.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Shine effect on hover */}
                <div className="hover-shine absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-full group-hover:-translate-x-full transition-transform duration-1000"></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showCreateModal && (
        <CreateBoardModal onClose={() => setShowCreateModal(false)} />
      )}
      {showInvites && (
        <InvitationsModal open={showInvites} onClose={() => setShowInvites(false)} />
      )}
      {showSentInvites && (
        <SentInvitationsModal onClose={() => setShowSentInvites(false)} />
      )}
    </div>
  );
}