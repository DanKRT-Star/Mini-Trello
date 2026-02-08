import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBoardStore } from '@/stores/boardStore';
import { useCardStore } from '@/stores/cardStore';
import { ArrowLeft, Settings, Users, Plus, Sparkles, Grid3x3 } from 'lucide-react';
import InviteMemberModal from '@/components/board/InviteMemberModal';
import CreateCardModal from '@/components/card/CreateCardModal';
import CardList from '@/components/card/CardList';

export default function BoardDetail() {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();
  const { currentBoard, fetchBoardDetail, loading: boardLoading } = useBoardStore();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const { cards, fetchCards, loading: cardsLoading } = useCardStore();
  const [showCreateCardModal, setShowCreateCardModal] = useState(false);

  useEffect(() => {
    if (boardId) {
      fetchBoardDetail(boardId);
      fetchCards(boardId);
    }
  }, [boardId, fetchBoardDetail, fetchCards]);

  if (boardLoading || !currentBoard) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-page">
        <div className="flex flex-col items-center gap-4 animate-fadeIn">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            <Sparkles className="w-6 h-6 text-purple-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-gray-600 text-lg font-medium">Đang tải board...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-page">
      {/* Decorative Background */}
      <div className="bg-decorative opacity-50">
        <div className="bg-blob-purple top-20 right-20 animate-blob"></div>
        <div className="bg-blob-pink bottom-20 left-20 animate-blob animation-delay-2000"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Left Section */}
            <div className="flex items-start gap-3 flex-1 min-w-0 animate-slideIn">
              <button
                onClick={() => navigate('/dashboard')}
                className="group shrink-0 p-2.5 rounded-xl transition-all duration-300 text-gray-600 border-2 border-transparent hover:bg-gray-100 hover:scale-110"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              </button>

              <div className="flex items-start gap-2 min-w-0 flex-1">
                <div className="shrink-0 w-10 h-10 bg-linear-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <Grid3x3 className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold gradient-text truncate">
                    {currentBoard.name}
                  </h1>
                  {currentBoard.description && (
                    <p className="text-xs sm:text-sm text-gray-600 truncate">{currentBoard.description}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2 shrink-0 animate-slideIn w-full sm:w-auto flex-wrap sm:flex-nowrap">
              <div className="flex items-center gap-2">
                <div className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs bg-linear-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-lg flex items-center gap-1.5 whitespace-nowrap">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-linear-to-br from-blue-500 to-cyan-600 rounded flex items-center justify-center shadow">
                    <Users className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-blue-700">{currentBoard.members.length}</span>
                </div>

                <button
                  onClick={() => setShowInviteModal(true)}
                  className="px-2.5 sm:px-3 py-1.5 sm:py-2 bg-white border-2 border-gray-200 rounded-lg text-xs font-semibold hover:bg-gray-50 transition-all"
                  title="Mời thành viên"
                >
                  Invite
                </button>
              </div>
              
              <button
                onClick={() => setShowCreateCardModal(true)}
                className="group relative hidden sm:inline-flex items-center gap-1.5 px-4 py-2 bg-linear-to-r from-violet-600 to-purple-600 text-white text-sm font-semibold rounded-lg shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                <span>Tạo Card</span>
                <div className="absolute inset-0 rounded-lg bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>

              <button
                onClick={() => setShowCreateCardModal(true)}
                className="group relative sm:hidden inline-flex p-2.5 bg-linear-to-r from-violet-600 to-purple-600 text-white rounded-lg shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                <div className="absolute inset-0 rounded-lg bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>

              <button 
                className="p-2.5 rounded-lg transition-all duration-300 text-gray-600 border-2 border-transparent hover:bg-gray-100 hover:text-purple-600 hover:scale-110" 
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="relative max-w-7xl mx-auto p-4 sm:px-6 lg:px-8">
        {cardsLoading ? (
          <div className="flex items-center justify-center py-12 animate-fadeIn">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
              <Sparkles className="w-5 h-5 text-purple-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
          </div>
        ) : cards.length === 0 ? (
          <div className="text-center py-16 animate-scaleIn">
            <div className="relative inline-block mb-6">
              <div className="w-20 h-20 bg-linear-to-br from-purple-100 to-pink-200 rounded-3xl flex items-center justify-center mx-auto shadow-lg">
                <Plus className="w-10 h-10 text-purple-600" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-linear-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center shadow-lg">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold gradient-text mb-2">
              Chưa có card nào
            </h3>
            <p className="text-gray-600 mb-8 text-lg">Tạo card đầu tiên để bắt đầu quản lý tasks</p>
            <button
              onClick={() => setShowCreateCardModal(true)}
              className="btn-primary"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              <span>Tạo Card Đầu Tiên</span>
              <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
          </div>
        ) : (
          <CardList
            cards={cards}
            boardId={boardId!}
            onCardUpdated={() => {
              if (boardId) {
                fetchCards(boardId);
              }
            }}
          />
        )}
      </main>

      {showCreateCardModal && boardId && (
        <CreateCardModal
          boardId={boardId}
          onClose={() => setShowCreateCardModal(false)}
        />
      )}

      {showInviteModal && currentBoard && (
        <InviteMemberModal
          boardId={currentBoard.id}
          onClose={() => setShowInviteModal(false)}
        />
      )}


    </div>
  );
}