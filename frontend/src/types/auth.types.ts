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
  accessToken: string;
}

export interface User {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginDto) => Promise<void>;
  register: (data: RegisterDto) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  googleLogin: (token: string) => Promise<void>;
}
