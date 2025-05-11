export interface AuthResponse {
  token: string;
  user: {
    id: number;
    username: string;
    email: string;
  };
  message: string;
}

export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  photo: string;
} 