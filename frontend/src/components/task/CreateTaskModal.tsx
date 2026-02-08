import { useState, useEffect } from 'react';
import { useTaskStore } from '@/stores/taskStore';
import { useBoardStore } from '@/stores/boardStore';
import type { TaskStatus, TaskPriority } from '@/types/task';
import { X, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { apiService } from '@/services/api';

interface CreateTaskModalProps {
  boardId: string;
  cardId: string;
  defaultStatus?: TaskStatus;
  onClose: () => void;
}

interface MemberInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

const priorityColors = {
  low: 'from-green-500 to-emerald-600',
  medium: 'from-yellow-500 to-orange-600',
  high: 'from-red-500 to-rose-600',
};

export default function CreateTaskModal({ boardId, cardId, defaultStatus, onClose }: CreateTaskModalProps) {
  const { createTask, loading } = useTaskStore();
  const { currentBoard } = useBoardStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>(defaultStatus || 'backlog');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [deadline, setDeadline] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [memberInfo, setMemberInfo] = useState<Map<string, MemberInfo>>(new Map());
  const [, setLoadingMembers] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const boardMembers = currentBoard?.members || [];
  const owner = currentBoard?.ownerId;

  useEffect(() => {
    const fetchMembersInfo = async () => {
      if (boardMembers.length === 0) return;

      setLoadingMembers(true);
      const infoMap = new Map<string, MemberInfo>();

      try {
        for (const memberId of boardMembers) {
          try {
            const userInfo = await apiService.getUserById(memberId);
            infoMap.set(memberId, {
              id: memberId,
              firstName: userInfo.firstName || '',
              lastName: userInfo.lastName || '',
              email: userInfo.email,
            });
          } catch (error) {
            console.error(`Failed to fetch info for member ${memberId}:`, error);
            // Fallback to email if we have it
            infoMap.set(memberId, {
              id: memberId,
              firstName: '',
              lastName: '',
              email: memberId,
            });
          }
        }

        setMemberInfo(infoMap);
      } finally {
        setLoadingMembers(false);
      }
    };

    fetchMembersInfo();
  }, [boardMembers]);

  const getMemberDisplayName = (memberId: string) => {
    const info = memberInfo.get(memberId);
    if (!info) return memberId;

    if (info.firstName || info.lastName) {
      return `${info.firstName} ${info.lastName}`.trim();
    }

    return info.email || memberId;
  };

  const handleToggleMember = (memberId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createTask(boardId, cardId, {
        title,
        description,
        status,
        priority,
        deadline: deadline || undefined,
        assignedMembers: selectedMembers.length > 0 ? selectedMembers : undefined,
      });
      onClose();
    } catch {
      // Error handled by store
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-lg max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header with Gradient */}
        <div className="sticky top-0 px-8 py-6 bg-linear-to-r from-violet-500 via-purple-600 to-pink-600 z-10 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white drop-shadow-lg">Tạo Task Mới</h2>
            </div>
            <button onClick={onClose} className="btn-icon bg-white/20">
              <X className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto flex-1">
          <div>
            <label className="label flex items-center gap-2 mb-2">
              <div className="label-dot label-dot-purple"></div>
              Tiêu đề *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field"
              placeholder="Ví dụ: Design homepage mockup"
              required
            />
          </div>

          <div>
            <label className="label flex items-center gap-2 mb-2">
              <div className="label-dot label-dot-purple"></div>
              Mô tả
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="textarea-field"
              rows={3}
              placeholder="Chi tiết về task..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label flex items-center gap-2 mb-2">
                <div className="label-dot label-dot-blue"></div>
                Trạng thái
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="input-field-blue cursor-pointer"
              >
                <option value="icebox">❄️ Icebox</option>
                <option value="backlog">📋 Backlog</option>
                <option value="ongoing">⚡ On Going</option>
                <option value="review">👀 Review</option>
                <option value="done">✅ Done</option>
              </select>
            </div>

            <div>
              <label className="label flex items-center gap-2 mb-2">
                <div className="label-dot label-dot-orange"></div>
                Độ ưu tiên
              </label>
              <div className="relative">
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  className="input-field cursor-pointer appearance-none"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <div className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-3 h-3 rounded-full bg-linear-to-r ${priorityColors[priority]} pointer-events-none`}></div>
              </div>
            </div>
          </div>

          <div>
            <label className="label flex items-center gap-2 mb-2">
              <div className="label-dot label-dot-pink"></div>
              Deadline
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="input-field cursor-pointer"
            />
          </div>

          <div>
            <label className="label flex items-center gap-2 mb-3">
              <div className="w-4 h-4 bg-purple-500 rounded"></div>
              Giao cho members
            </label>
            {boardMembers.length === 0 ? (
              <p className="text-sm text-gray-500">Không có members trong board</p>
            ) : (
              <div className="space-y-2 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                {boardMembers.map((memberId) => {
                  const isSelected = selectedMembers.includes(memberId);
                  const isOwner = memberId === owner;
                  const displayName = getMemberDisplayName(memberId);

                  return (
                    <label
                      key={memberId}
                      className="flex items-center gap-3 p-2 rounded hover:bg-white cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleMember(memberId)}
                        className="w-4 h-4 text-purple-600 rounded"
                      />
                      <span className="text-sm font-medium text-gray-900">
                        {displayName}
                        {isOwner && (
                          <span className="ml-2 text-xs text-purple-600 font-semibold">
                            (Owner)
                          </span>
                        )}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={loading}
            >
              <div className="flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Đang tạo...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    <span>Tạo Task</span>
                  </>
                )}
              </div>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}