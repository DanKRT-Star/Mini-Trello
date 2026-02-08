import { useEffect } from 'react';
import { X } from 'lucide-react';
import TaskBoard from './TaskBoard';

interface TaskBoardModalProps {
  boardId: string;
  cardId: string;
  cardName: string;
  onClose: () => void;
}

export default function TaskBoardModal({ boardId, cardId, cardName, onClose }: TaskBoardModalProps) {
  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 animate-fadeIn">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="glass-effect border-b px-6 py-4 flex items-center justify-between shadow-lg">
          <h2 className="text-xl font-bold gradient-text">{cardName}</h2>
          <button
            onClick={onClose}
            className="btn-icon"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* TaskBoard */}
        <div className="flex-1 overflow-hidden">
          <TaskBoard boardId={boardId} cardId={cardId} />
        </div>
      </div>
    </div>
  );
}