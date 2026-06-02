import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { TaskService } from '../../services/task';
import { ToastrService } from 'ngx-toastr';
import { User } from '../../Model/user';
import { Task } from '../../Model/task';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  
  isMini = false;
  currentView = 'dashboard';
  showUserMenu = false;

  tasksLoaded = false;
  isSaving = false;

  totalTasks: number | null = null;
  completedTasks: number | null = null;
  pendingTasks: number | null = null;
  inProgressTasks: number | null = null;
  completionRate: number | null = null;

  showNotifications = false;
  notifications: any[] = [];
  notificationsCount  = 0;

  filterStatus = 'all';
  searchTerm = '';

  menuItems = [
    { path: 'dashboard', name: 'Dashboard', icon: 'dashboard', active: true },
    { path: 'tasks', name: 'My Tasks', icon: 'assignment', active: false },
    { path: 'profile', name: 'Profile', icon: 'person', active: false }
  ];

  constructor(
    private authService: AuthService,
    private taskService: TaskService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadTasks(); 
    this.initNotifications();
  }

  loadTasks(): void {
    this.tasksLoaded = false;

    this.taskService.getMyTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.tasksLoaded = true;
        this.updateStatistics();
        this.applyFilters();
        
        // Manually trigger local UI component validation inside change detection lifecycle
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
        this.tasksLoaded = true;
        
        // Hand off third party toast animations gracefully outside angular tick zone
        this.ngZone.runOutsideAngular(() => {
          this.toastr.error('Failed to load tasks.', 'Error');
        });
      }
    });
  }

  updateStatistics(): void {
    if (this.tasksLoaded) {
      this.totalTasks = this.tasks.length;
      this.completedTasks = this.tasks.filter(t => t.status === 'completed').length;
      this.pendingTasks = this.tasks.filter(t => t.status === 'pending').length;
      this.inProgressTasks = this.tasks.filter(t => t.status === 'in-progress').length;
      
      this.completionRate = this.totalTasks > 0 
        ? Math.round((this.completedTasks / this.totalTasks) * 100) 
        : 0;
    }
  }

  // Dynamic template text filters when data is missing or fetching
  statDisplay(value: number | null): string {
    return value === null || !this.tasksLoaded ? '—' : value.toString();
  }

  rateDisplay(value: number | null): string {
    return value === null || !this.tasksLoaded ? '—' : `${value}%`;
  }

  applyFilters(): void {
    this.filteredTasks = this.tasks.filter(task => {
      const matchesStatus = this.filterStatus === 'all' || task.status === this.filterStatus;
      
      const matchesSearch = !this.searchTerm || 
        task.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      return matchesStatus && matchesSearch;
    });
  }

  filterTasks(): void {
    this.applyFilters();
  }

  setView(view: string): void {
    this.currentView = view;
    this.menuItems.forEach(item => item.active = item.path === view);
    
    if (view === 'tasks') {
      this.filterStatus = 'all';
      this.searchTerm = '';
      this.applyFilters();
    }
    if (view === 'dashboard') {
      this.loadTasks();
    }
    
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { view: view },
      queryParamsHandling: 'merge'
    });
  }

  updateTaskStatus(task: Task, status: string): void {
    this.taskService.updateTaskStatus(task.id, status as any).subscribe({
      next: () => {
        // Safe asynchronous UI synchronization running back inside NgZone
        this.ngZone.run(() => {
          this.loadTasks(); 
          this.addNotification(`Task "${task.title}" status updated to ${this.getStatusText(status)}`);
        });

        this.ngZone.runOutsideAngular(() => {
          this.toastr.success(`Task status updated to ${this.getStatusText(status)}`, 'Status Updated');
        });
      },
      error: (error) => {
        console.error('Error updating task status:', error);
        this.ngZone.runOutsideAngular(() => {
          this.toastr.error('Failed to update status.', 'Error');
        });
      }
    });
  }

  private initNotifications(): void {
    this.notifications = [{
      id: '1',
      message: 'Welcome to your Dashboard',
      icon: 'info',
      timeAgo: 'Just now',
      read: false
    }];
    this.notificationsCount = 1;
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

  markAllNotificationsRead(): void {
    this.notifications.forEach(n => n.read = true);
    this.notificationsCount = 0;
    this.showNotifications = false;
  }
  updatepassword(): void {
    this.router.navigate(['/auth/update-password']);
  }
  
  updateprofile(): void {
    this.router.navigate(['/auth/update-profile']);
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
    if (hour < 16) return 'Good afternoon';
    return 'Good evening';
  }

  getPageTitle(): string {
    switch(this.currentView) {
      case 'dashboard': return 'Dashboard';
      case 'tasks': return 'My Tasks';
      case 'profile': return 'Profile';
      default: return 'Dashboard';
    }
  }

  getPageSubtitle(): string {
    switch(this.currentView) {
      case 'dashboard': return "Welcome back! Here's an overview of your assigned tasks";
      case 'tasks': return 'Track and update your task progression';
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
}