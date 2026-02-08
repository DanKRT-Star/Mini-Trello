export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  owner: {
    login: string;
    avatar_url: string;
  };
}

export interface GitHubBranch {
  name: string;
  lastCommitSha: string;
}

export interface GitHubPullRequest {
  title: string;
  pullNumber: number;
}

export interface GitHubIssue {
  title: string;
  issueNumber: number;
}

export interface GitHubCommit {
  sha: string;
  message: string;
}

export interface GitHubRepositoryInfo {
  repositoryId: string;
  fullName: string;
  url: string;
  branches: GitHubBranch[];
  pulls: GitHubPullRequest[];
  issues: GitHubIssue[];
  commits: GitHubCommit[];
}

export type GitHubAttachmentType = 'pull_request' | 'commit' | 'issue';

export interface GitHubAttachment {
  attachmentId: string;
  type: GitHubAttachmentType;
  number?: number;
  sha?: string;
  createdAt: string;
}

export interface AttachGitHubItemRequest {
  type: GitHubAttachmentType;
  number?: number;
  sha?: string;
}

export interface GitHubState {
  connected: boolean;
  username: string | null;
  avatarUrl: string | null;
  repositories: GitHubRepository[];
  loading: boolean;
  error: string | null;
  
  checkConnection: () => Promise<void>;
  connectGitHub: () => void;
  disconnectGitHub: () => Promise<void>;
  fetchRepositories: () => Promise<void>;
  fetchRepositoryInfo: (repositoryId: string) => Promise<GitHubRepositoryInfo>;
  attachToTask: (boardId: string, cardId: string, taskId: string, data: AttachGitHubItemRequest) => Promise<void>;
  fetchTaskAttachments: (boardId: string, cardId: string, taskId: string) => Promise<GitHubAttachment[]>;
  removeAttachment: (boardId: string, cardId: string, taskId: string, attachmentId: string) => Promise<void>;
  clearError: () => void;
}