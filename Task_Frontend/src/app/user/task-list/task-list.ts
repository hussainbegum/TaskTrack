import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task } from '../../Model/task';
import { TaskService } from '../../services/task';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-list.html',
  styleUrls: ['./task-list.css']
})
export class TaskListComponent implements OnInit {
  tasks: Task[] = [];
  loading = false;
  filter: 'all' | 'completed' | 'in-progress' | 'pending' = 'all';
  error: string | null = null;

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.loading = true;
    this.error = null;

    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        console.log('Tasks loaded:', tasks);
        this.tasks = [...tasks];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
        this.error = 'Failed to load tasks. Please try again.';
        this.loading = false;
      }
    });
  }

  get filteredTasks(): Task[] {
    if (!this.tasks || this.tasks.length === 0) {
      return [];
    }

    switch (this.filter) {
      case 'completed':
        return this.tasks.filter(task => task.status === 'completed');
      case 'in-progress':
        return this.tasks.filter(task => task.status === 'in-progress');
      case 'pending':
        return this.tasks.filter(task => task.status === 'pending');
      default:
        return this.tasks;
    }
  }

  getTaskCount(): number {
    return this.tasks.length;
  }

  getCompletedCount(): number {
    return this.tasks.filter(t => t.status === 'completed').length;
  }

  getInProgressCount(): number {
    return this.tasks.filter(t => t.status === 'in-progress').length;
  }

  getPendingCount(): number {
    return this.tasks.filter(t => t.status === 'pending').length;
  }

  updateTaskStatus(task: Task, newStatus: 'pending' | 'in-progress' | 'completed'): void {
    const updatedTask = { ...task, status: newStatus };

    this.taskService.updateTask(task.id, updatedTask).subscribe({
      next: () => {
        this.tasks = this.tasks.map(t =>
          t.id === task.id ? { ...t, status: newStatus } : t
        );
        console.log('Task updated');
      },
      error: (error) => {
        console.error('Error updating task:', error);
        this.error = 'Failed to update task. Please try again.';
      }
    });
  }

  deleteTask(id: number): void {
    if (confirm('Are you sure you want to delete this task?')) {
      this.loading = true;
      this.error = null;

      this.taskService.deleteTask(id).subscribe({
        next: () => {
          console.log('Task deleted successfully');
          this.loadTasks();
        },
        error: (error) => {
          console.error('Error deleting task:', error);
          this.error = 'Failed to delete task. Please try again.';
          this.loading = false;
        }
      });
    }
  }

  refreshTasks(): void {
    this.loadTasks();
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'completed': return 'status-completed';
      case 'in-progress': return 'status-in-progress';
      case 'pending': return 'status-pending';
      default: return '';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'completed': return 'Completed';
      case 'in-progress': return 'In Progress';
      case 'pending': return 'Pending';
      default: return status;
    }
  }

  trackById(index: number, task: Task): number {
    return task.id;
  }
}