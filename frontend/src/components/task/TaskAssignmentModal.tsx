import { useState } from 'react';
import { X, Users } from 'lucide-react';
import { useBoardStore } from '@/stores/boardStore';
import { useTaskStore } from '@/stores/taskStore';
import type { Task } from '@/types/task';
import toast from 'react-hot-toast';

interface TaskAssignmentModalProps {
  task: Task;
  boardId: string;
  cardId: string;
  onClose: () => void;
}

export default function TaskAssignmentModal({
  task,
  boardId,
  cardId,
  onClose,
}: TaskAssignmentModalProps) {
  const { currentBoard } = useBoardStore();
  const { updateTask } = useTaskStore();
  const [selectedMembers, setSelectedMembers] = useState<string[]>(
    task.assignedMembers || []
  );
  const [loading, setLoading] = useState(false);

  const boardMembers = currentBoard?.members || [];
  const owner = currentBoard?.ownerId;

  const handleToggleMember = (memberId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateTask(boardId, cardId, task.id, {
        assignedMembers: selectedMembers,
      });
      toast.success('Cập nhật assign members thành công!');
      onClose();
    } catch {
      toast.error('Không thể cập nhật assign members');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-scaleIn">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Giao task cho member</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Task Name */}
        <div className="px-6 pt-4 pb-2 border-b border-gray-100">
          <p className="text-sm text-gray-600 mb-1">Task:</p>
          <p className="font-semibold text-gray-900 truncate">{task.title}</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-3">
          {boardMembers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Không có member nào trong board</p>
            </div>
          ) : (
            boardMembers.map((memberId) => {
              const isSelected = selectedMembers.includes(memberId);
              const isOwner = memberId === owner;

              return (
                <label
                  key={memberId}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggleMember(memberId)}
                    className="w-4 h-4 text-purple-600 rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {memberId}
                      {isOwner && (
                        <span className="ml-2 text-xs text-purple-600 font-semibold">
                          (Owner)
                        </span>
                      )}
                    </p>
                  </div>
                </label>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-100">
          <button
            onClick={onClose}
            className="btn-secondary flex-1"
            disabled={loading}
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            className="btn-primary flex-1"
            disabled={loading || boardMembers.length === 0}
          >
            {loading ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </div>
    </div>
  );
}
