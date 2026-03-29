// dashboard.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { TaskService } from '../../services/task';
import { User } from '../../Model/user';
import { Task } from '../../Model/task';
import { Subscription } from 'rxjs';
import { TaskListComponent } from '../task-list/task-list';
import { TaskFormComponent } from '../taskform/taskform';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TaskListComponent, TaskFormComponent],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  tasks: Task[] = [];
  private userSubscription?: Subscription;
  isMini = false;
  
  // Statistics
  totalTasks = 0;
  completedTasks = 0;
  pendingTasks = 0;
  inProgressTasks = 0;
  completionRate = 0;
  
  // UI State
  currentView = 'dashboard';
  showNotifications = false;
  showUserMenu = false;
  notificationsCount = 3;
  
  // Sidebar menu items
  menuItems = [
    { path: 'dashboard', name: 'Dashboard', icon: 'dashboard', active: true },
    { path: 'tasks', name: 'My Tasks', icon: 'assignment', active: false },
    { path: 'create-task', name: 'Create Task', icon: 'add', active: false },
    { path: 'profile', name: 'Profile', icon: 'person', active: false }
  ];

  constructor(
    private authService: AuthService,
    private taskService: TaskService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Subscribe to user changes
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (!user) {
        this.router.navigate(['/login']);
      }
    });
    
    // Check for view in query params
    this.route.queryParams.subscribe(params => {
      if (params['view']) {
        this.setView(params['view']);
      }
    });
    
    this.loadTasks();
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  loadTasks(): void {
    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.updateStatistics();
      },
      error: (error) => console.error('Error loading tasks:', error)
    });
  }

  updateStatistics(): void {
    this.totalTasks = this.tasks.length;
    this.completedTasks = this.tasks.filter(t => t.status === 'completed').length;
    this.pendingTasks = this.tasks.filter(t => t.status === 'pending').length;
    this.inProgressTasks = this.tasks.filter(t => t.status === 'in-progress').length;
    this.completionRate = this.totalTasks > 0 
      ? Math.round((this.completedTasks / this.totalTasks) * 100) 
      : 0;
  }

  setView(view: string): void {
    this.currentView = view;
    this.menuItems.forEach(item => {
      item.active = item.path === view;
    });
    
    // Update URL without reloading
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { view: view },
      queryParamsHandling: 'merge'
    });
  }

  logout(): void {
    this.authService.logout();
  }

  toggleSidebar(): void {
    this.isMini = !this.isMini;
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
    if (this.showUserMenu) this.showUserMenu = false;
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
    if (this.showNotifications) this.showNotifications = false;
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }

  getPageTitle(): string {
    switch(this.currentView) {
      case 'dashboard': return 'Dashboard';
      case 'tasks': return 'My Tasks';
      case 'create-task': return 'Create Task';
      case 'profile': return 'Profile';
      default: return 'Dashboard';
    }
  }

  getPageSubtitle(): string {
    switch(this.currentView) {
      case 'dashboard': return 'Welcome back! Here\'s an overview of your tasks';
      case 'tasks': return 'Manage and organize your tasks';
      case 'create-task': return 'Add a new task to your list';
      case 'profile': return 'Manage your account settings';
      default: return '';
    }
  }

  getStatusBadgeClass(status: string): string {
    switch(status) {
      case 'completed': return 'badge-success';
      case 'in-progress': return 'badge-warning';
      case 'pending': return 'badge-danger';
      default: return 'badge-info';
    }
  }

  getStatusText(status: string): string {
    switch(status) {
      case 'completed': return 'Completed';
      case 'in-progress': return 'In Progress';
      case 'pending': return 'Pending';
      default: return status;
    }
  }

  editTask(taskId: number): void {
    this.router.navigate(['/user/dashboard/edit-task', taskId]);
  }
}