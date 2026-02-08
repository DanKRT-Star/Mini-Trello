export interface Board {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  members: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateBoardRequest {
  name: string;
  description?: string;
}

export interface UpdateBoardRequest {
  name?: string;
  description?: string;
}

export interface InviteMemberRequest {
  email_member: string;
}

export interface InviteMemberResponse {
  success: boolean;
  inviteId: string;
  message: string;
}

export interface AcceptInviteRequest {
  invite_id: string;
  status: 'accepted' | 'declined';
}

export interface Invite {
  inviteId: string;
  boardId: string;
  board_owner_id?: string;
  member_id?: string;
  email_member: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt?: string;
}

export interface BoardState {
  boards: Board[];
  currentBoard: Board | null;
  loading: boolean;
  error: string | null;
  
  fetchBoards: () => Promise<void>;
  fetchBoardDetail: (boardId: string) => Promise<void>;
  createBoard: (data: CreateBoardRequest) => Promise<Board>;
  updateBoard: (boardId: string, data: UpdateBoardRequest) => Promise<Board>;
  deleteBoard: (boardId: string) => Promise<void>;
  inviteMember: (boardId: string, email: string) => Promise<void>;
  acceptInvite: (boardId: string, inviteId: string, status: 'accepted' | 'declined') => Promise<void>;
  invites?: Invite[];
  fetchInvites?: () => Promise<void>;
  clearError: () => void;
}