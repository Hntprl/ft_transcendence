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
