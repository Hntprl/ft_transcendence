export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstname: string;
  lastname: string;
}

export interface AuthResponse {
  accessToken?: string;
  access_token?: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginDto) => Promise<void>;
  register: (data: RegisterDto) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  loginWithGoogle: (token: string) => Promise<void>;
}
