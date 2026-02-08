import { useState } from 'react';
import { Trash2, X } from 'lucide-react';
import type { Card } from '@/types/card';
import { useCardStore } from '@/stores/cardStore';
import toast from 'react-hot-toast';

interface CardEditModalProps {
  card: Card;
  boardId: string;
  onClose: () => void;
  onCardUpdated?: () => void;
}

export default function CardEditModal({
  card,
  boardId,
  onClose,
  onCardUpdated,
}: CardEditModalProps) {
  const [name, setName] = useState(card.name);
  const [description, setDescription] = useState(card.description);
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { updateCard, deleteCard } = useCardStore();

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Tên card không được để trống');
      return;
    }

    setLoading(true);
    try {
      await updateCard(boardId, card.id, {
        name: name.trim(),
        description: description.trim() || undefined,
      });
      toast.success('Cập nhật card thành công!');
      onCardUpdated?.();
      onClose();
    } catch {
      toast.error('Không thể cập nhật card');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteCard(boardId, card.id);
      toast.success('Xóa card thành công!');
      onCardUpdated?.();
      onClose();
    } catch {
      toast.error('Không thể xóa card');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-scaleIn">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Chỉnh sửa Card</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {showDeleteConfirm ? (
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <p className="text-gray-700 mb-4">
                Bạn có chắc chắn muốn xóa card "<span className="font-semibold">{card.name}</span>"? Hành động này không thể hoàn tác.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="btn-secondary"
                  disabled={loading}
                >
                  Hủy
                </button>
                <button
                  onClick={handleDelete}
                  className="btn-danger"
                  disabled={loading}
                >
                  {loading ? 'Đang xóa...' : 'Xóa'}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Name Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tên Card
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nhập tên card..."
                  className="input-field w-full"
                  disabled={loading}
                />
              </div>

              {/* Description Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mô tả
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Nhập mô tả card..."
                  rows={3}
                  className="input-field w-full resize-none"
                  disabled={loading}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
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
                  disabled={loading}
                >
                  {loading ? 'Đang lưu...' : 'Lưu'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="btn-icon bg-red-50 text-red-600 hover:bg-red-100"
                  title="Xóa card"
                  disabled={loading}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
