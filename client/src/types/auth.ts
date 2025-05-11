export interface AuthResponse {
  token: string;
  user: {
    id: number;
    username: string;
    email: string;
  };
  message: string;
} 