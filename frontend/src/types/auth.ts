export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  createdAt: string;
  githubUsername?: string;
  githubAvatarUrl?: string;
  githubConnectedAt?: string;
}

export interface SignupRequest {
  email: string;
  firstName?: string;
  lastName?: string;
}

export interface SignupResponse {
  message: string;
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export interface SigninRequest {
  email: string;
  verificationCode: string;
}

export interface SigninResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
}

export interface ResendCodeRequest {
  email: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  
  signup: (email: string) => Promise<SignupResponse>;
  signin: (email: string, verificationCode: string) => Promise<void>;
  resendCode: (email: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  getMe: () => Promise<void>;
  updateProfile: (firstName?: string, lastName?: string) => Promise<void>;
}