import { useEffect, useState } from 'react';
import { X, Mail, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { apiService } from '@/services/api';
import toast from 'react-hot-toast';

interface SentInvite {
  inviteId: string;
  boardId: string;
  board_owner_id: string;
  member_id: string;
  email_member: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

interface SentInvitationsModalProps {
  onClose: () => void;
}

export default function SentInvitationsModal({ onClose }: SentInvitationsModalProps) {
  const [invites, setInvites] = useState<SentInvite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSentInvites = async () => {
      try {
        setLoading(true);
        const data = await apiService.getSentInvites();
        setInvites(data);
      } catch (error) {
        console.error('Error fetching sent invites:', error);
        toast.error('Không thể tải danh sách lời mời');
      } finally {
        setLoading(false);
      }
    };

    fetchSentInvites();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-50 border-green-200';
      case 'declined':
        return 'bg-red-50 border-red-200';
      case 'pending':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 rounded-full">
            <CheckCircle2 className="w-4 h-4 text-green-700" />
            <span className="text-xs font-semibold text-green-700">Đã chấp nhận</span>
          </div>
        );
      case 'declined':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-red-100 rounded-full">
            <XCircle className="w-4 h-4 text-red-700" />
            <span className="text-xs font-semibold text-red-700">Đã từ chối</span>
          </div>
        );
      case 'pending':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-100 rounded-full">
            <Clock className="w-4 h-4 text-yellow-700" />
            <span className="text-xs font-semibold text-yellow-700">Chờ phản hồi</span>
          </div>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Hôm qua';
    }

    return date.toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full animate-scaleIn max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
          <h2 className="text-xl font-bold text-gray-900">Lời mời đã gửi</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Đang tải...</p>
              </div>
            </div>
          ) : invites.length === 0 ? (
            <div className="flex items-center justify-center p-12">
              <div className="text-center">
                <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg font-medium">Chưa có lời mời nào</p>
                <p className="text-gray-500 text-sm">Bạn chưa gửi lời mời cho ai</p>
              </div>
            </div>
          ) : (
            <div className="p-6 space-y-3">
              {invites.map((invite) => (
                <div
                  key={invite.inviteId}
                  className={`border-2 rounded-lg p-4 transition-all ${getStatusColor(invite.status)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
                          <Mail className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-900 truncate">
                            {invite.email_member}
                          </p>
                          <p className="text-xs text-gray-500">
                            Gửi lúc {formatDate(invite.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0 ml-4">
                      {getStatusBadge(invite.status)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
