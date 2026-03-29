import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TaskService } from '../../services/task';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-create-task',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './taskform.html',
  styleUrls: ['./taskform.css']
})
export class TaskFormComponent implements OnInit {
  taskForm: FormGroup;
  submitting = false;
  successMessage = '';
  errorMessage = '';
  isEditMode = false;
  loading = false;
  error = '';
  taskId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private authService: AuthService,
    public router: Router,
    private route: ActivatedRoute
  ) {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      status: ['pending']
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.taskId = +params['id'];
        this.loadTask();
      }
    });
  }

  loadTask(): void {
    if (!this.taskId) return;
    
    this.loading = true;
    this.taskService.getTaskById(this.taskId).subscribe({
      next: (task) => {
        this.taskForm.patchValue({
          title: task.title,
          description: task.description,
          status: task.status
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading task:', error);
        this.error = 'Failed to load task';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.taskForm.invalid) {
      this.errorMessage = 'Please fill in all required fields correctly.';
      return;
    }

    this.submitting = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.error = '';

    if (this.isEditMode && this.taskId) {
      // Update existing task
      this.taskService.updateTask(this.taskId, this.taskForm.value).subscribe({
        next: () => {
          this.successMessage = 'Task updated successfully!';
          this.submitting = false;
          
          setTimeout(() => {
            this.router.navigate(['/user/dashboard'], { queryParams: { view: 'tasks' } });
          }, 2000);
        },
        error: (error) => {
          console.error('Error updating task:', error);
          this.errorMessage = 'Failed to update task. Please try again.';
          this.submitting = false;
        }
      });
    } else {
      // Create new task
      const currentUser = this.authService.getCurrentUser();
      const taskData = {
        ...this.taskForm.value,
        userId: currentUser?.id || 1,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.taskService.createTask(taskData).subscribe({
        next: () => {
          this.successMessage = 'Task created successfully!';
          this.submitting = false;
          this.taskForm.reset({ status: 'pending' });
          
          setTimeout(() => {
            this.router.navigate(['/user/dashboard'], { queryParams: { view: 'tasks' } });
          }, 2000);
        },
        error: (error) => {
          console.error('Error creating task:', error);
          this.errorMessage = 'Failed to create task. Please try again.';
          this.submitting = false;
        }
      });
    }
  }

  resetForm(): void {
    this.taskForm.reset({ status: 'pending' });
    this.errorMessage = '';
    this.successMessage = '';
    this.error = '';
  }

  cancel(): void {
    this.router.navigate(['/user/dashboard']);
  }

  get title() { return this.taskForm.get('title'); }
  get description() { return this.taskForm.get('description'); }
}