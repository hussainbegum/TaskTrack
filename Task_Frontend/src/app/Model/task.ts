export interface Task {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskCreate {
  title: string;
  description: string;
  status?: 'pending' | 'in-progress' | 'completed';
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  status?: 'pending' | 'in-progress' | 'completed';
}