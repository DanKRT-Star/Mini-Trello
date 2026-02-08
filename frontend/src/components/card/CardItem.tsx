import { useState } from 'react';
import type { Card } from '@/types/card';
import { Layers, Users, MoreVertical, Sparkles } from 'lucide-react';
import TaskBoardModal from '@/components/task/TaskBoardModal';
import CardEditModal from './CardEditModal';

interface CardItemProps {
  card: Card;
  boardId: string;
  onCardUpdated?: () => void;
}

export default function CardItem({ card, boardId, onCardUpdated }: CardItemProps) {
  const [showTaskBoard, setShowTaskBoard] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  return (
    <>
      <div
        onClick={() => setShowTaskBoard(true)}
        className="card-hover p-8 animate-fadeIn"
      >
        {/* Gradient Border Effect */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-violet-500 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-transparent group-hover:bg-linear-to-r group-hover:from-violet-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all duration-300 flex-1 pr-2">
            {card.name}
          </h3>
          <div className="flex items-center gap-2">
            <div className="icon-container-small opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110">
              <Sparkles className="w-4 h-4 text-purple-600" />
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowEditModal(true);
              }}
              className="btn-icon opacity-0 group-hover:opacity-100"
              title="Chỉnh sửa card"
            >
              <MoreVertical className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {card.description && (
          <p className="text-gray-600 text-sm mb-5 line-clamp-2 leading-relaxed">{card.description}</p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="badge badge-blue group-hover:shadow-md group-hover:shadow-blue-200/50 transition-all">
              <div className="icon-container-blue w-6 h-6 shadow-sm">
                <Layers className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm font-bold">{card.tasks_count}</span>
              <span className="text-xs">tasks</span>
            </div>
            {card.list_member.length > 0 && (
              <div className="badge badge-purple group-hover:shadow-md group-hover:shadow-purple-200/50 transition-all">
                <div className="w-6 h-6 bg-linear-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-sm">
                  <Users className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm font-bold">{card.list_member.length}</span>
              </div>
            )}
          </div>
        </div>

        {/* Hover Shine Effect */}
        <div className="hover-shine"></div>
      </div>

      {showTaskBoard && (
        <TaskBoardModal
          boardId={boardId}
          cardId={card.id}
          cardName={card.name}
          onClose={() => setShowTaskBoard(false)}
        />
      )}

      {showEditModal && (
        <CardEditModal
          card={card}
          boardId={boardId}
          onClose={() => setShowEditModal(false)}
          onCardUpdated={onCardUpdated}
        />
      )}
    </>
  );
}