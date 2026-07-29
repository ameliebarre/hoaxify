export interface RegisteredUser {
  id: number;
  username: string;
  email: string;
}

export interface CurrentUser {
  id: number;
  username: string;
  email: string;
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
