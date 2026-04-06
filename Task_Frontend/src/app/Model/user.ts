export interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
  role?: 'USER' | 'ADMIN';
  createdAt?: Date;
  updatedAt?: Date;
  taskCount?: number;
  completedTasks?: number; 
}

export interface UserLogin {
  email: string;
  password: string;
}


export interface AuthResponse {
  token: string;
  role: 'USER' | 'ADMIN';
  username: string;
  email: string;
}