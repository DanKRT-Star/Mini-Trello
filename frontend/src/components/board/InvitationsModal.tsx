import { useEffect } from 'react';
import { useBoardStore } from '@/stores/boardStore';
import { X, Check } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function InvitationsModal({ open, onClose }: Props) {
  const { invites = [], fetchInvites, acceptInvite, loading } = useBoardStore();

  useEffect(() => {
    if (open && fetchInvites) fetchInvites();
  }, [open, fetchInvites]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>
      <div className="card max-w-md w-full p-6 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Lời mời tham gia</h3>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-gray-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          {invites.length === 0 ? (
            <p className="text-sm text-gray-500">Không có lời mời nào.</p>
          ) : (
            invites.map((inv) => (
              <div key={inv.inviteId} className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                <div>
                  <p className="font-semibold">{inv.boardId}</p>
                  <p className="text-xs text-gray-500">{inv.email_member}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => acceptInvite(inv.boardId, inv.inviteId, 'declined')}
                    className="btn-secondary"
                    disabled={loading}
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => acceptInvite(inv.boardId, inv.inviteId, 'accepted')}
                    className="btn-primary"
                    disabled={loading}
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
