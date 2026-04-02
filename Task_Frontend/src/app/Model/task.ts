export interface Task {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  userId: number;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date | null;
  priority?: 'low' | 'medium' | 'high';
}

export interface TaskCreate {
  title: string;
  description: string;
  userId: number;
  status?: 'pending' | 'in-progress' | 'completed';
  dueDate?: Date | null;
  priority?: 'low' | 'medium' | 'high';
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  status?: 'pending' | 'in-progress' | 'completed';
  userId?: number;
  dueDate?: Date | null;
  priority?: 'low' | 'medium' | 'high';
}