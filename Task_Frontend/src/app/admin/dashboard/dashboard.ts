import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { User } from '../../Model/user';
import { Task } from '../../Model/task';
import { AdminService } from '../../services/admin';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class AdminDashboardComponent implements OnInit {
  isMini = false;
  isSaving = false;
  menuItems = [
    { name: 'Dashboard', icon: 'dashboard', path: 'dashboard', active: true },
    { name: 'Users', icon: 'people', path: 'users', active: false },
    { name: 'Tasks', icon: 'assignment', path: 'tasks', active: false }
  ];

  currentView = 'dashboard';
  currentAdmin: User | null = null;

  users: User[] = [];
  tasks: Task[] = [];
  filteredTasks: Task[] = [];

  taskFilterStatus = 'all';
  taskFilterUser = 'all';
  taskSearchTerm = '';

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

  showUserMenu = false;
  showNotifications = false;
  notifications: any[] = [];
  notificationsCount = 0;

  showUserModal = false;
  showTaskModal = false;
  editingUser: User | null = null;
  editingTask: Task | null = null;

  userForm = {
    name: '',
    email: '',
    password: '',
    role: 'USER' as 'USER' | 'ADMIN'
  };

  taskForm = {
    title: '',
    description: '',
    userId: 0,
    status: 'pending' as 'pending' | 'in-progress' | 'completed',
    priority: 'medium' as 'low' | 'medium' | 'high',
    dueDate: undefined as Date | undefined | null
  };

  constructor(
    private authService: AuthService,
    private adminService: AdminService,
    public toastr: ToastrService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadCurrentAdmin();
    this.loadUsers();
    this.loadTasks();
    this.initNotifications();
  }

  private loadCurrentAdmin(): void {
    this.currentAdmin = this.authService.getCurrentUser();
  }

  private loadUsers(): void {
    this.adminService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.updateStats();
      },
      error: () => this.toastr.error('Failed to load users', 'Error')
    });
  }

  private loadTasks(): void {
    this.adminService.getAllTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.filteredTasks = [...tasks];
        this.updateStats();
      },
      error: () => this.toastr.error('Failed to load tasks', 'Error')
    });
  }

  private updateStats(): void {
    this.totalUsers = this.users.length;
    this.totalTasks = this.tasks.length;
    this.completedTasks = this.tasks.filter(t => t.status === 'completed').length;
    this.inProgressTasks = this.tasks.filter(t => t.status === 'in-progress').length;
    this.pendingTasks = this.tasks.filter(t => t.status === 'pending').length;
    this.overallCompletionRate = this.totalTasks > 0
      ? Math.round((this.completedTasks / this.totalTasks) * 100)
      : 0;
  }

  private initNotifications(): void {
    this.notifications = [{
      id: '1',
      message: 'Welcome to Admin Dashboard',
      icon: 'info',
      timeAgo: 'Just now',
      read: false
    }];
    this.notificationsCount = 1;
  }

  setView(view: string): void {
    this.currentView = view;
    this.menuItems.forEach(item => item.active = item.path === view);
    if (view === 'users') this.loadUsers();
    if (view === 'tasks') this.loadTasks();
  }

  getPageTitle(): string {
    const titles: Record<string, string> = {
      dashboard: 'Admin Dashboard',
      users: 'User Management',
      tasks: 'Task Management'
    };
    return titles[this.currentView] || 'Dashboard';
  }

  getPageSubtitle(): string {
    const subtitles: Record<string, string> = {
      dashboard: 'Monitor team performance and manage tasks',
      users: 'Create, edit, and manage user accounts',
      tasks: 'Assign and track tasks across your team'
    };
    return subtitles[this.currentView] || '';
  }

  get regularUsers(): User[] {
    return this.users.filter(user => user.role === 'USER');
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }

  toggleSidebar(): void { this.isMini = !this.isMini; }
  toggleUserMenu(): void { this.showUserMenu = !this.showUserMenu; }
  toggleNotifications(): void { this.showNotifications = !this.showNotifications; }

  markAllNotificationsRead(): void {
    this.notifications.forEach(n => n.read = true);
    this.notificationsCount = 0;
  }

  closeUserModal(): void {
    this.showUserModal = false;
    this.editingUser = null;
    this.isSaving = false;
    this.userForm = { name: '', email: '', password: '', role: 'USER' };
  }

  closeTaskModal(): void {
    this.showTaskModal = false;
    this.editingTask = null;
    this.isSaving = false;
    this.taskForm = {
      title: '',
      description: '',
      userId: 0,
      status: 'pending',
      priority: 'medium',
      dueDate: undefined
    };
  }

  // ── User Management ──────────────────────────────────────────────────────────

  openCreateUserModal(): void {
    this.editingUser = null;
    this.userForm = { name: '', email: '', password: '', role: 'USER' };
    this.showUserModal = true;
  }

  editUser(user: User): void {
    this.editingUser = user;
    this.userForm = {
      name: user.name,
      email: user.email,
      password: '',
      role: user.role || 'USER'
    };
    this.showUserModal = true;
  }

  saveUser(): void {
    if (!this.userForm.name || !this.userForm.email) {
      this.toastr.warning('Please fill in all required fields', 'Validation Error');
      return;
    }

    // Guard: prevent double-submit
    if (this.isSaving) return;
    this.isSaving = true;

    // Capture BEFORE closeUserModal() wipes the form
    const userName = this.userForm.name;

    if (this.editingUser) {
      this.adminService.updateUser(this.editingUser.id, {
        id: this.editingUser.id,
        name: this.userForm.name,
        email: this.userForm.email,
        role: this.userForm.role
      }).subscribe({
        next: () => {
          this.ngZone.run(() => {
            this.closeUserModal();
            this.loadUsers();
            this.toastr.success(`User "${userName}" updated successfully`, 'Success');
            this.addNotification(`User "${userName}" was updated`);
            this.setView('users');
            this.cdr.detectChanges();
          });
        },
        error: (err) => {
          this.ngZone.run(() => {
            console.error('Error updating user:', err);
            this.toastr.error('Failed to update user', 'Error');
            this.isSaving = false;
            this.cdr.detectChanges();
          });
        }
      });
    } else {
      if (!this.userForm.password) {
        this.toastr.warning('Please enter a password', 'Validation Error');
        this.isSaving = false;
        return;
      }
      this.adminService.createUser({
        id: 0,
        name: this.userForm.name,
        email: this.userForm.email,
        password: this.userForm.password,
        role: this.userForm.role
      }).subscribe({
        next: () => {
          this.ngZone.run(() => {
            this.closeUserModal();
            this.loadUsers();
            this.toastr.success(`User "${userName}" created successfully`, 'Success');
            this.addNotification(`New user "${userName}" was created`);
            this.setView('users');
            this.cdr.detectChanges();
          });
        },
        error: (err) => {
          this.ngZone.run(() => {
            console.error('Error creating user:', err);
            this.toastr.error('Failed to create user', 'Error');
            this.isSaving = false;
            this.cdr.detectChanges();
          });
        }
      });
    }
  }

  deleteUser(userId: number): void {
    const user = this.users.find(u => u.id === userId);
    this.adminService.deleteUser(userId).subscribe({
      next: () => {
        this.loadUsers();
        this.toastr.success(`User "${user?.name}" deleted successfully`, 'Success');
        this.addNotification(`User "${user?.name}" was deleted`);
      },
      error: (error) => {
        if (error.status === 200) {
          this.loadUsers();
          this.toastr.success(`User "${user?.name}" deleted successfully`, 'Success');
        } else {
          this.toastr.error('Failed to delete user', 'Error');
        }
      }
    });
  }

  // ── Task Management ───────────────────────────────────────────────────────────

  openCreateTaskModal(): void {
    this.editingTask = null;
    this.taskForm = {
      title: '',
      description: '',
      userId: 0,
      status: 'pending',
      priority: 'medium',
      dueDate: undefined
    };
    this.showTaskModal = true;
  }

  assignTaskToUser(user: User): void {
    this.openCreateTaskModal();
    this.taskForm.userId = user.id;
  }

  editTask(taskId: number): void {
    const task = this.tasks.find(t => t.id === taskId);
    if (task) {
      this.editingTask = task;
      this.taskForm = {
        title: task.title,
        description: task.description,
        userId: task.userId,
        status: task.status,
        priority: task.priority || 'low',
        dueDate: task.dueDate
      };
      this.showTaskModal = true;
    }
  }

  editTaskDetails(task: Task): void {
    this.editTask(task.id);
  }

  saveTask(): void {
    if (!this.taskForm.title || !this.taskForm.userId) {
      this.toastr.warning('Please fill in all required fields', 'Validation Error');
      return;
    }

    // Guard: prevent double-submit
    if (this.isSaving) return;
    this.isSaving = true;

    // Capture BEFORE closeTaskModal() wipes the form
    const taskTitle = this.taskForm.title;

    const data = {
      title: this.taskForm.title,
      description: this.taskForm.description || '',
      status: this.taskForm.status,
      userId: Number(this.taskForm.userId),
      dueDate: this.taskForm.dueDate,
      priority: this.taskForm.priority
    };

    if (this.editingTask) {
      this.adminService.updateTask(this.editingTask.id, data).subscribe({
        next: () => {
          this.ngZone.run(() => {
            this.closeTaskModal();
            this.loadTasks();
            this.toastr.success(`Task "${taskTitle}" updated successfully`, 'Success');
            this.addNotification(`Task "${taskTitle}" was updated`);
            this.setView('tasks');
            this.cdr.detectChanges();
          });
        },
        error: () => {
          this.ngZone.run(() => {
            this.toastr.error('Failed to update task', 'Error');
            this.isSaving = false;
            this.cdr.detectChanges();
          });
        }
      });
    } else {
      this.adminService.createTask(data).subscribe({
        next: () => {
          this.ngZone.run(() => {
            this.closeTaskModal();
            this.loadTasks();
            this.toastr.success(`Task "${taskTitle}" created successfully`, 'Success');
            this.addNotification(`New task "${taskTitle}" was created`);
            this.setView('tasks');
            this.cdr.detectChanges();
          });
        },
        error: () => {
          this.ngZone.run(() => {
            this.toastr.error('Failed to create task', 'Error');
            this.isSaving = false;
            this.cdr.detectChanges();
          });
        }
      });
    }
  }

  updateTaskStatus(task: Task): void {
    this.adminService.updateTaskStatus(task.id, task.status).subscribe({
      next: (updatedTask) => {
        const index = this.tasks.findIndex(t => t.id === task.id);
        if (index !== -1) this.tasks[index] = updatedTask;
        this.filteredTasks = [...this.tasks];
        this.updateStats();
        this.toastr.success(`Task status changed to ${this.getStatusText(task.status)}`, 'Status Updated');
        this.addNotification(`Task "${task.title}" status changed to ${this.getStatusText(task.status)}`);
      },
      error: () => {
        this.toastr.error('Failed to update task status', 'Error');
        this.loadTasks();
      }
    });
  }

  deleteTask(taskId: number): void {
    const task = this.tasks.find(t => t.id === taskId);
    this.adminService.deleteTask(taskId).subscribe({
      next: () => {
        this.loadTasks();
        this.toastr.success(`Task "${task?.title}" deleted successfully`, 'Success');
        this.addNotification(`Task "${task?.title}" was deleted`);
      },
      error: (error) => {
        if (error.status === 200) {
          this.loadTasks();
          this.toastr.success(`Task "${task?.title}" deleted successfully`, 'Success');
        } else {
          this.toastr.error('Failed to delete task', 'Error');
        }
      }
    });
  }

  filterTasks(): void {
    this.filteredTasks = this.tasks.filter(task => {
      if (this.taskFilterStatus !== 'all' && task.status !== this.taskFilterStatus) return false;
      if (this.taskFilterUser !== 'all' && task.userId !== +this.taskFilterUser) return false;
      if (this.taskSearchTerm &&
        !task.title.toLowerCase().includes(this.taskSearchTerm.toLowerCase()) &&
        !task.description.toLowerCase().includes(this.taskSearchTerm.toLowerCase())) return false;
      return true;
    });
  }

  getUserName(userId: number): string {
    const user = this.users.find(u => u.id === userId);
    return user ? user.name : 'Unassigned';
  }

  getAssignedUserName(userId: number): string {
    return this.getUserName(userId);
  }

  getUserById(userId: number): User | undefined {
    return this.users.find(u => u.id === userId);
  }

  getUserAvatarColor(user: User): string {
    const colors = [
      'linear-gradient(135deg, #3b82f6, #1d4ed8)',
      'linear-gradient(135deg, #8b5cf6, #6d28d9)',
      'linear-gradient(135deg, #10b981, #059669)',
      'linear-gradient(135deg, #f59e0b, #d97706)',
      'linear-gradient(135deg, #ef4444, #dc2626)'
    ];
    return colors[user.id % colors.length];
  }

  getUserCompletionRate(user: User): number {
    const userTasks = this.tasks.filter(t => t.userId === user.id);
    if (userTasks.length === 0) return 0;
    return Math.round((userTasks.filter(t => t.status === 'completed').length / userTasks.length) * 100);
  }

  getStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      completed: 'Completed',
      'in-progress': 'In Progress',
      pending: 'Pending'
    };
    return statusMap[status] || 'Pending';
  }

  getCompletedPercentage(): number {
    return this.totalTasks ? Math.round((this.completedTasks / this.totalTasks) * 100) : 0;
  }

  getInProgressPercentage(): number {
    return this.totalTasks ? Math.round((this.inProgressTasks / this.totalTasks) * 100) : 0;
  }

  getPendingPercentage(): number {
    return this.totalTasks ? Math.round((this.pendingTasks / this.totalTasks) * 100) : 0;
  }

  private addNotification(message: string): void {
    this.notifications.unshift({
      id: `notif-${Date.now()}`,
      message,
      icon: 'info',
      timeAgo: 'Just now',
      read: false
    });
    this.notificationsCount = this.notifications.filter(n => !n.read).length;
  }

  logout(): void {
    this.authService.logout();
  }
}