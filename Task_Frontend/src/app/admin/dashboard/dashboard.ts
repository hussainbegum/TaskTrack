// admin-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'user';
  createdAt: Date;
  taskCount?: number;
  completedTasks?: number;
}

interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  dueDate?: Date;
}

interface MenuItem {
  name: string;
  icon: string;
  path: string;
  active: boolean;
}

interface Notification {
  id: string;
  message: string;
  icon: string;
  timeAgo: string;
  read: boolean;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class AdminDashboardComponent implements OnInit {
  // Sidebar state
  isMini = false;
  menuItems: MenuItem[] = [
    { name: 'Dashboard', icon: 'dashboard', path: 'dashboard', active: true },
    { name: 'Users', icon: 'people', path: 'users', active: false },
    { name: 'Tasks', icon: 'assignment', path: 'tasks', active: false }
  ];
  
  currentView = 'dashboard';
  
  // Admin user
  currentAdmin: User | null = null;
  
  // Data
  users: User[] = [];
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  
  // Task filters
  taskFilterStatus = 'all';
  taskFilterUser = 'all';
  taskSearchTerm = '';
  
  // Stats
  totalUsers = 0;
  totalTasks = 0;
  completedTasks = 0;
  pendingTasks = 0;
  inProgressTasks = 0;
  overallCompletionRate = 0;
  userGrowthRate = 12;
  taskGrowthRate = 18;
  completedGrowthRate = 15;
  pendingDecreaseRate = 8;
  
  // UI state
  showNotifications = false;
  showUserMenu = false;
  notifications: Notification[] = [];
  notificationsCount = 0;
  
  // Modals
  showUserModal = false;
  showTaskModal = false;
  editingUser: User | null = null;
  editingTask: Task | null = null;
  
  userForm: Partial<User> = {
    name: '',
    email: '',
    password: '',
    role: 'user'
  };
  
  taskForm: Partial<Task> = {
    title: '',
    description: '',
    assignedTo: '',
    status: 'pending',
    priority: 'medium',
    dueDate: undefined
  };
  
  ngOnInit(): void {
    this.loadCurrentAdmin();
    this.loadMockData();
    this.loadNotifications();
    this.updateStats();
  }
  
  loadCurrentAdmin(): void {
    // In a real app, get from auth service
    this.currentAdmin = {
      id: 'admin-1',
      name: 'Alex Johnson',
      email: 'alex@taskflow.com',
      role: 'admin',
      createdAt: new Date()
    };
  }
  
  loadMockData(): void {
    // Mock users
    this.users = [
      {
        id: 'user-1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'user',
        createdAt: new Date('2024-01-15'),
        taskCount: 5,
        completedTasks: 3
      },
      {
        id: 'user-2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'user',
        createdAt: new Date('2024-02-01'),
        taskCount: 8,
        completedTasks: 5
      },
      {
        id: 'user-3',
        name: 'Mike Wilson',
        email: 'mike@example.com',
        role: 'user',
        createdAt: new Date('2024-02-20'),
        taskCount: 3,
        completedTasks: 1
      },
      {
        id: 'user-4',
        name: 'Sarah Brown',
        email: 'sarah@example.com',
        role: 'user',
        createdAt: new Date('2024-03-10'),
        taskCount: 6,
        completedTasks: 4
      }
    ];
    
    // Mock tasks
    this.tasks = [
      {
        id: 'task-1',
        title: 'Complete project documentation',
        description: 'Write comprehensive documentation for the new feature set including API references and usage examples.',
        assignedTo: 'user-1',
        status: 'completed',
        priority: 'high',
        createdAt: new Date('2024-03-01'),
        dueDate: new Date('2024-03-15')
      },
      {
        id: 'task-2',
        title: 'Fix login bug',
        description: 'Resolve the authentication issue affecting user login on mobile devices.',
        assignedTo: 'user-2',
        status: 'in-progress',
        priority: 'high',
        createdAt: new Date('2024-03-10'),
        dueDate: new Date('2024-03-20')
      },
      {
        id: 'task-3',
        title: 'Design new dashboard',
        description: 'Create mockups for the new admin dashboard with analytics features.',
        assignedTo: 'user-3',
        status: 'pending',
        priority: 'medium',
        createdAt: new Date('2024-03-12'),
        dueDate: new Date('2024-03-25')
      },
      {
        id: 'task-4',
        title: 'Update user profiles',
        description: 'Add additional fields to user profiles including avatar upload and bio.',
        assignedTo: 'user-1',
        status: 'completed',
        priority: 'low',
        createdAt: new Date('2024-03-05'),
        dueDate: new Date('2024-03-18')
      },
      {
        id: 'task-5',
        title: 'Implement email notifications',
        description: 'Set up email notification system for task assignments and reminders.',
        assignedTo: 'user-4',
        status: 'in-progress',
        priority: 'medium',
        createdAt: new Date('2024-03-14'),
        dueDate: new Date('2024-03-28')
      },
      {
        id: 'task-6',
        title: 'Database optimization',
        description: 'Optimize database queries and add indexes for better performance.',
        assignedTo: 'user-2',
        status: 'pending',
        priority: 'high',
        createdAt: new Date('2024-03-15'),
        dueDate: new Date('2024-03-30')
      }
    ];
    
    this.filteredTasks = [...this.tasks];
    this.updateUserTaskCounts();
    this.updateStats();
  }
  
  updateUserTaskCounts(): void {
    this.users.forEach(user => {
      const userTasks = this.tasks.filter(t => t.assignedTo === user.id);
      user.taskCount = userTasks.length;
      user.completedTasks = userTasks.filter(t => t.status === 'completed').length;
    });
  }
  
  updateStats(): void {
    this.totalUsers = this.users.length;
    this.totalTasks = this.tasks.length;
    this.completedTasks = this.tasks.filter(t => t.status === 'completed').length;
    this.inProgressTasks = this.tasks.filter(t => t.status === 'in-progress').length;
    this.pendingTasks = this.tasks.filter(t => t.status === 'pending').length;
    
    const completedPercentage = this.totalTasks > 0 
      ? (this.completedTasks / this.totalTasks) * 100 
      : 0;
    this.overallCompletionRate = Math.round(completedPercentage);
  }
  
  loadNotifications(): void {
    this.notifications = [
      {
        id: 'notif-1',
        message: 'New user registered: John Doe',
        icon: 'person_add',
        timeAgo: '5 min ago',
        read: false
      },
      {
        id: 'notif-2',
        message: 'Task "Complete documentation" was completed',
        icon: 'task_alt',
        timeAgo: '1 hour ago',
        read: false
      },
      {
        id: 'notif-3',
        message: '2 tasks are due today',
        icon: 'schedule',
        timeAgo: '3 hours ago',
        read: true
      }
    ];
    this.notificationsCount = this.notifications.filter(n => !n.read).length;
  }
  
  // View Management
  setView(view: string): void {
    this.currentView = view;
    this.menuItems.forEach(item => {
      item.active = item.path === view;
    });
  }
  
  getPageTitle(): string {
    switch(this.currentView) {
      case 'dashboard': return 'Admin Dashboard';
      case 'users': return 'User Management';
      case 'tasks': return 'Task Management';
      default: return 'Dashboard';
    }
  }
  
  getPageSubtitle(): string {
    switch(this.currentView) {
      case 'dashboard': return 'Monitor team performance and manage tasks';
      case 'users': return 'Create, edit, and manage user accounts';
      case 'tasks': return 'Assign and track tasks across your team';
      default: return '';
    }
  }
  
  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }
  
  // Sidebar
  toggleSidebar(): void {
    this.isMini = !this.isMini;
  }
  
  // User Menu
  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }
  
  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
  }
  
  markAllNotificationsRead(): void {
    this.notifications.forEach(n => n.read = true);
    this.notificationsCount = 0;
  }
  
  // User Management
  openCreateUserModal(): void {
    this.editingUser = null;
    this.userForm = { name: '', email: '', password: '', role: 'user' };
    this.showUserModal = true;
  }
  
  editUser(user: User): void {
    this.editingUser = user;
    this.userForm = { ...user, password: '' };
    this.showUserModal = true;
  }
  
  saveUser(): void {
    if (!this.userForm.name || !this.userForm.email) {
      alert('Please fill in all required fields');
      return;
    }
    
    if (this.editingUser) {
      // Update existing user
      const index = this.users.findIndex(u => u.id === this.editingUser!.id);
      if (index !== -1) {
        this.users[index] = {
          ...this.users[index],
          name: this.userForm.name!,
          email: this.userForm.email!,
          role: this.userForm.role as 'admin' | 'user'
        };
      }
      this.addNotification(`User ${this.userForm.name} was updated`);
    } else {
      // Create new user
      if (!this.userForm.password) {
        alert('Please enter a password');
        return;
      }
      const newUser: User = {
        id: `user-${Date.now()}`,
        name: this.userForm.name!,
        email: this.userForm.email!,
        role: this.userForm.role as 'admin' | 'user',
        createdAt: new Date(),
        taskCount: 0,
        completedTasks: 0
      };
      this.users.push(newUser);
      this.addNotification(`New user ${newUser.name} was created`);
    }
    
    this.updateStats();
    this.closeUserModal();
  }
  
  deleteUser(userId: string): void {
    if (confirm('Are you sure you want to delete this user? All their tasks will be unassigned.')) {
      const user = this.users.find(u => u.id === userId);
      // Unassign tasks from this user
      this.tasks.forEach(task => {
        if (task.assignedTo === userId) {
          task.assignedTo = '';
        }
      });
      this.users = this.users.filter(u => u.id !== userId);
      this.updateUserTaskCounts();
      this.updateStats();
      this.filterTasks();
      this.addNotification(`User ${user?.name} was deleted`);
    }
  }
  
  // Task Management
  openCreateTaskModal(): void {
    this.editingTask = null;
    this.taskForm = {
      title: '',
      description: '',
      assignedTo: '',
      status: 'pending',
      priority: 'medium',
      dueDate: undefined
    };
    this.showTaskModal = true;
  }
  
  assignTaskToUser(user: User): void {
    this.openCreateTaskModal();
    this.taskForm.assignedTo = user.id;
  }
  
  editTask(taskId: string): void {
    const task = this.tasks.find(t => t.id === taskId);
    if (task) {
      this.editingTask = task;
      this.taskForm = { ...task };
      this.showTaskModal = true;
    }
  }
  
  editTaskDetails(task: Task): void {
    this.editTask(task.id);
  }
  
  saveTask(): void {
    if (!this.taskForm.title || !this.taskForm.assignedTo) {
      alert('Please fill in all required fields');
      return;
    }
    
    if (this.editingTask) {
      // Update existing task
      const index = this.tasks.findIndex(t => t.id === this.editingTask!.id);
      if (index !== -1) {
        this.tasks[index] = {
          ...this.tasks[index],
          title: this.taskForm.title!,
          description: this.taskForm.description || '',
          assignedTo: this.taskForm.assignedTo!,
          status: this.taskForm.status as any,
          priority: this.taskForm.priority as any,
          dueDate: this.taskForm.dueDate ? new Date(this.taskForm.dueDate) : undefined
        };
      }
      this.addNotification(`Task "${this.taskForm.title}" was updated`);
    } else {
      // Create new task
      const newTask: Task = {
        id: `task-${Date.now()}`,
        title: this.taskForm.title!,
        description: this.taskForm.description || '',
        assignedTo: this.taskForm.assignedTo!,
        status: this.taskForm.status as any,
        priority: this.taskForm.priority as any,
        createdAt: new Date(),
        dueDate: this.taskForm.dueDate ? new Date(this.taskForm.dueDate) : undefined
      };
      this.tasks.push(newTask);
      this.addNotification(`New task "${newTask.title}" was assigned to ${this.getUserById(newTask.assignedTo)?.name}`);
    }
    
    this.updateUserTaskCounts();
    this.updateStats();
    this.filterTasks();
    this.closeTaskModal();
  }
  
  updateTaskStatus(task: Task): void {
    const index = this.tasks.findIndex(t => t.id === task.id);
    if (index !== -1) {
      this.tasks[index] = { ...task };
      this.updateUserTaskCounts();
      this.updateStats();
      this.addNotification(`Task "${task.title}" status changed to ${this.getStatusText(task.status)}`);
    }
  }
  
  deleteTask(taskId: string): void {
    if (confirm('Are you sure you want to delete this task?')) {
      const task = this.tasks.find(t => t.id === taskId);
      this.tasks = this.tasks.filter(t => t.id !== taskId);
      this.updateUserTaskCounts();
      this.updateStats();
      this.filterTasks();
      this.addNotification(`Task "${task?.title}" was deleted`);
    }
  }
  
  filterTasks(): void {
    this.filteredTasks = this.tasks.filter(task => {
      let matches = true;
      
      if (this.taskFilterStatus !== 'all' && task.status !== this.taskFilterStatus) {
        matches = false;
      }
      
      if (this.taskFilterUser !== 'all' && task.assignedTo !== this.taskFilterUser) {
        matches = false;
      }
      
      if (this.taskSearchTerm && !task.title.toLowerCase().includes(this.taskSearchTerm.toLowerCase()) &&
          !task.description.toLowerCase().includes(this.taskSearchTerm.toLowerCase())) {
        matches = false;
      }
      
      return matches;
    });
  }
  
  // Helper Methods
  getUserById(userId: string): User | undefined {
    return this.users.find(u => u.id === userId);
  }
  
  getAssignedUserName(userId: string): string {
    const user = this.users.find(u => u.id === userId);
    return user ? user.name : 'Unassigned';
  }
  
  getUserAvatarColor(user: User): string {
    const colors = [
      'linear-gradient(135deg, #3b82f6, #1d4ed8)',
      'linear-gradient(135deg, #8b5cf6, #6d28d9)',
      'linear-gradient(135deg, #10b981, #059669)',
      'linear-gradient(135deg, #f59e0b, #d97706)',
      'linear-gradient(135deg, #ef4444, #dc2626)'
    ];
    const index = user.id.charCodeAt(user.id.length - 1) % colors.length;
    return colors[index];
  }
  
  getUserCompletionRate(user: User): number {
    if (!user.taskCount || user.taskCount === 0) return 0;
    return Math.round(((user.completedTasks || 0) / user.taskCount) * 100);
  }
  
  getStatusText(status: string): string {
    switch(status) {
      case 'completed': return 'Completed';
      case 'in-progress': return 'In Progress';
      default: return 'Pending';
    }
  }
  
  getCompletedPercentage(): number {
    if (this.totalTasks === 0) return 0;
    return Math.round((this.completedTasks / this.totalTasks) * 100);
  }
  
  getInProgressPercentage(): number {
    if (this.totalTasks === 0) return 0;
    return Math.round((this.inProgressTasks / this.totalTasks) * 100);
  }
  
  getPendingPercentage(): number {
    if (this.totalTasks === 0) return 0;
    return Math.round((this.pendingTasks / this.totalTasks) * 100);
  }
  
  // Modal Management
  closeUserModal(): void {
    this.showUserModal = false;
    this.editingUser = null;
  }
  
  closeTaskModal(): void {
    this.showTaskModal = false;
    this.editingTask = null;
  }
  
  // Notifications
  addNotification(message: string): void {
    const newNotif: Notification = {
      id: `notif-${Date.now()}`,
      message: message,
      icon: 'info',
      timeAgo: 'Just now',
      read: false
    };
    this.notifications.unshift(newNotif);
    this.notificationsCount = this.notifications.filter(n => !n.read).length;
  }
  
  // Logout
  logout(): void {
    if (confirm('Are you sure you want to logout?')) {
      // In a real app, clear auth token and redirect
      console.log('Logging out...');
    }
  }
}