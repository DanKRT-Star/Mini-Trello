import { useState } from 'react';
import { useBoardStore } from '@/stores/boardStore';
import { X, Loader2, Sparkles } from 'lucide-react';

interface CreateBoardModalProps {
  onClose: () => void;
}

export default function CreateBoardModal({ onClose }: CreateBoardModalProps) {
  const { createBoard, loading } = useBoardStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createBoard({ name, description });
      onClose();
    } catch {
      // Error handled by store
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
        {/* Header with Gradient */}
        <div className="relative px-8 py-6 bg-gradient-header">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white drop-shadow-lg">Tạo Board Mới</h2>
            </div>
            <button onClick={onClose} className="btn-icon bg-white/20">
              <X className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="label flex items-center gap-2 mb-2">
              <div className="label-dot label-dot-purple"></div>
              Tên Board *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              placeholder="Ví dụ: Marketing Campaign 2024"
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
              rows={4}
              placeholder="Mô tả ngắn gọn về board này..."
            />
          </div>

          <div className="flex gap-3 pt-4">
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
                    <span>Tạo Board</span>
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