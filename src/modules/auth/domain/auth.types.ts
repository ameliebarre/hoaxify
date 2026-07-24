export interface SignUpDto {
  username: string;
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthUser {
  userId: number;
}

export interface PublicUser {
  id: number;
  username: string;
  email: string;
}

export interface AuthResponse {
  user: PublicUser;
  accessToken: string;
}
