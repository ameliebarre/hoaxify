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

export type LoginResponse = {
  user: {
    id: number;
    username: string;
    email: string;
  };
  accessToken: string;
  refreshToken: string;
};
