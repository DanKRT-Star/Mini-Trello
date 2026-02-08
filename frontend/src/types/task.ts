export type TaskStatus = 'icebox' | 'backlog' | 'ongoing' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  cardId: string;
  boardId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  deadline: string | null;
  ownerId: string;
  assignedMembers: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  deadline?: string;
  assignedMembers?: string[];
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  deadline?: string;
  cardId?: string;
  assignedMembers?: string[];
}

export interface AssignMemberRequest {
  memberId: string;
}

export interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  
  fetchTasks: (boardId: string, cardId: string) => Promise<void>;
  createTask: (boardId: string, cardId: string, data: CreateTaskRequest) => Promise<Task>;
  updateTask: (boardId: string, cardId: string, taskId: string, data: UpdateTaskRequest) => Promise<Task>;
  deleteTask: (boardId: string, cardId: string, taskId: string) => Promise<void>;
  moveTask: (taskId: string, newStatus: TaskStatus) => void;
  assignMember: (boardId: string, cardId: string, taskId: string, memberId: string) => Promise<void>;
  unassignMember: (boardId: string, cardId: string, taskId: string, memberId: string) => Promise<void>;
  clearError: () => void;
}