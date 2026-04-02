import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task, TaskCreate, TaskUpdate } from '../../Model/task';
import { User } from '../../Model/user';
import { AdminService } from '../../services/admin';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-list.html',  // Fixed: was './user-tasks.html'
  styleUrls: ['./task-list.css']
})
export class TaskListComponent implements OnInit {
  tasks: Task[] = [];
  users: User[] = [];
  filteredTasks: Task[] = [];
  showTaskModal = false;
  editingTask: Task | null = null;
  
  // Filters
  filterStatus = 'all';
  filterUser = 'all';
  searchTerm = '';
  
  taskForm: TaskCreate = {
    title: '',
    description: '',
    userId: 0,
    status: 'pending',
    dueDate: undefined,
    priority: 'medium'
  };

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadTasks();
    this.loadUsers();
  }

  loadTasks(): void {
    this.adminService.getAllTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.applyFilters();
      },
      error: (error) => console.error('Error loading tasks:', error)
    });
  }

  loadUsers(): void {
    this.adminService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
      },
      error: (error) => console.error('Error loading users:', error)
    });
  }

  applyFilters(): void {
    this.filteredTasks = this.tasks.filter(task => {
      let matches = true;
      
      if (this.filterStatus !== 'all' && task.status !== this.filterStatus) {
        matches = false;
      }
      
      if (this.filterUser !== 'all' && task.userId !== +this.filterUser) {
        matches = false;
      }
      
      if (this.searchTerm && !task.title.toLowerCase().includes(this.searchTerm.toLowerCase()) &&
          !task.description.toLowerCase().includes(this.searchTerm.toLowerCase())) {
        matches = false;
      }
      
      return matches;
    });
  }

  openCreateTaskModal(): void {
    this.editingTask = null;
    this.taskForm = {
      title: '',
      description: '',
      userId: 0,
      status: 'pending',
      dueDate: undefined,
      priority: 'medium'
    };
    this.showTaskModal = true;
  }

  editTask(task: Task): void {
    this.editingTask = task;
    this.taskForm = {
      title: task.title,
      description: task.description,
      userId: task.userId,
      status: task.status,
      dueDate: task.dueDate,
      priority: task.priority || 'medium'
    };
    this.showTaskModal = true;
  }

  saveTask(): void {
    if (!this.taskForm.title || !this.taskForm.userId) {
      alert('Please fill in all required fields');
      return;
    }

    if (this.editingTask) {
      const updateData: TaskUpdate = {
        title: this.taskForm.title,
        description: this.taskForm.description,
        status: this.taskForm.status,
        userId: this.taskForm.userId,
        dueDate: this.taskForm.dueDate,
        priority: this.taskForm.priority
      };
      this.adminService.updateTask(this.editingTask.id, updateData).subscribe({
        next: () => {
          this.loadTasks();
          this.closeTaskModal();
          alert('Task updated successfully');
        },
        error: (error) => console.error('Error updating task:', error)
      });
    } else {
      // Create task
      this.adminService.createTask(this.taskForm).subscribe({
        next: () => {
          this.loadTasks();
          this.closeTaskModal();
          alert('Task created successfully');
        },
        error: (error) => console.error('Error creating task:', error)
      });
    }
  }

  deleteTask(taskId: number): void {
    if (confirm('Are you sure you want to delete this task?')) {
      this.adminService.deleteTask(taskId).subscribe({
        next: () => {
          this.loadTasks();
          alert('Task deleted successfully');
        },
        error: (error) => console.error('Error deleting task:', error)
      });
    }
  }

  updateTaskStatus(task: Task, status: string): void {
    const updateData: TaskUpdate = { status: status as any };
    this.adminService.updateTask(task.id, updateData).subscribe({
      next: () => {
        this.loadTasks();
        alert('Task status updated');
      },
      error: (error) => console.error('Error updating task status:', error)
    });
  }

  closeTaskModal(): void {
    this.showTaskModal = false;
    this.editingTask = null;
  }

  getUserName(userId: number): string {
    const user = this.users.find(u => u.id === userId);
    return user ? user.name : 'Unassigned';
  }

  getStatusText(status: string): string {
    switch(status) {
      case 'completed': return 'Completed';
      case 'in-progress': return 'In Progress';
      default: return 'Pending';
    }
  }

  getStatusClass(status: string): string {
    switch(status) {
      case 'completed': return 'badge-success';
      case 'in-progress': return 'badge-warning';
      default: return 'badge-danger';
    }
  }
}