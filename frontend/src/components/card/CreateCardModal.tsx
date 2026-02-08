import { useState } from 'react';
import { useCardStore } from '@/stores/cardStore';
import { X, Loader2, Sparkles, Grid3x3 } from 'lucide-react';

interface CreateCardModalProps {
  boardId: string;
  onClose: () => void;
}

export default function CreateCardModal({ boardId, onClose }: CreateCardModalProps) {
  const { createCard, loading } = useCardStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createCard(boardId, { name, description });
      onClose();
    } catch {
      // Error handled by store
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
        {/* Header with Gradient */}
        <div className="relative px-8 py-6 bg-linear-to-r from-blue-500 via-cyan-600 to-teal-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                <Grid3x3 className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white drop-shadow-lg">Tạo Card Mới</h2>
            </div>
            <button onClick={onClose} className="btn-icon bg-white/20">
              <X className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="label flex items-center gap-2 mb-2">
              <div className="label-dot label-dot-blue"></div>
              Tên Card *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field-blue"
              placeholder="Ví dụ: Website Development"
              required
            />
          </div>

          <div>
            <label className="label flex items-center gap-2 mb-2">
              <div className="label-dot label-dot-blue"></div>
              Mô tả
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="textarea-field"
              rows={4}
              placeholder="Mô tả chi tiết về card..."
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
              className="group relative flex-1 px-6 py-3.5 bg-linear-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
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
                    <span>Tạo Card</span>
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