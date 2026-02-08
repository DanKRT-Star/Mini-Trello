import { useState } from 'react';
import { useBoardStore } from '@/stores/boardStore';
import { X, Loader2, Mail, Sparkles } from 'lucide-react';

interface InviteMemberModalProps {
  boardId: string;
  onClose: () => void;
}

export default function InviteMemberModal({ boardId, onClose }: InviteMemberModalProps) {
  const { inviteMember, loading } = useBoardStore();
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await inviteMember(boardId, email);
      onClose();
    } catch {
      // error handled in store
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="relative px-6 py-5 bg-gradient-header">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg font-bold text-white">Mời thành viên</h2>
            </div>
            <button onClick={onClose} className="btn-icon bg-white/20">
              <X className="w-5 h-5 text-white group-hover:rotate-90 transition-transform" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Mail className="w-4 h-4 text-gray-500" />
            Email người được mời
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
            placeholder="nhập email@example.com"
            required
          />

          <div className="flex gap-3 pt-2">
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
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang gửi...
                </span>
              ) : (
                <span>Gửi lời mời</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}