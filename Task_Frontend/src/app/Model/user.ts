export interface User {
  id: number;
  name: string;        // Backend uses 'name' not 'username'
  email: string;
  password?: string;
  role?: string;
  createdAt?: string;  // Add createdAt if needed
  updatedAt?: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface UserRegister {
  name: string;        // Backend expects 'name'
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  message?: string;
}