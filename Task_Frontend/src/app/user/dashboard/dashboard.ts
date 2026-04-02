import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { User } from '../../Model/user';
import { Task, TaskCreate } from '../../Model/task';
import { Subscription } from 'rxjs';
import { TaskService } from '../../services/task';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  tasks: Task[] = [];
  filteredTasks: Task[] = []; // Add this for filtered tasks
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
  notificationsCount = 0;
  showTaskModal = false;
  editingTask: Task | null = null;
  
  // Filters - Add these properties
  filterStatus = 'all';
  searchTerm = '';
  
  taskForm: TaskCreate = {
    title: '',
    description: '',
    userId: 0,
    status: 'pending',
    dueDate: undefined,
    priority: 'medium'
  };
  
  // Sidebar menu items
  menuItems = [
    { path: 'dashboard', name: 'Dashboard', icon: 'dashboard', active: true },
    { path: 'tasks', name: 'My Tasks', icon: 'assignment', active: false },
    { path: 'profile', name: 'Profile', icon: 'person', active: false }
  ];

  constructor(
    private authService: AuthService,
    private taskService: TaskService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (!user) {
        this.router.navigate(['/auth/login']);
      } else {
        this.loadTasks();
      }
    });
    
    this.route.queryParams.subscribe(params => {
      if (params['view']) {
        this.setView(params['view']);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  loadTasks(): void {
    this.taskService.getMyTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.filteredTasks = [...tasks]; // Initialize filtered tasks
        this.updateStatistics();
        this.applyFilters(); // Apply any existing filters
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

  // Add filter methods
  applyFilters(): void {
    this.filteredTasks = this.tasks.filter(task => {
      let matches = true;
      
      if (this.filterStatus !== 'all' && task.status !== this.filterStatus) {
        matches = false;
      }
      
      if (this.searchTerm && !task.title.toLowerCase().includes(this.searchTerm.toLowerCase()) &&
          !task.description.toLowerCase().includes(this.searchTerm.toLowerCase())) {
        matches = false;
      }
      
      return matches;
    });
  }

  filterTasks(): void {
    this.applyFilters();
  }

  setView(view: string): void {
    this.currentView = view;
    this.menuItems.forEach(item => {
      item.active = item.path === view;
    });
    
    // Reset filters when switching to tasks view
    if (view === 'tasks') {
      this.filterStatus = 'all';
      this.searchTerm = '';
      this.applyFilters();
    }
    
    if (view === 'create-task') {
      this.openCreateTaskModal();
    }
    
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { view: view },
      queryParamsHandling: 'merge'
    });
  }

  openCreateTaskModal(): void {
    this.editingTask = null;
    this.taskForm = {
      title: '',
      description: '',
      userId: this.currentUser?.id || 0,
      status: 'pending',
      dueDate: undefined,
      priority: 'medium'
    };
    this.showTaskModal = true;
  }


  updateTaskStatus(task: Task, status: string): void {
    this.taskService.updateTaskStatus(task.id, status as any).subscribe({
      next: () => {
        this.loadTasks();
        alert('Task status updated to ' + this.getStatusText(status));
      },
      error: (error) => console.error('Error updating task status:', error)
    });
  }
  
  closeTaskModal(): void {
    this.showTaskModal = false;
    this.editingTask = null;
    if (this.currentView === 'create-task') {
      this.setView('tasks');
    }
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
}