import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User } from '../../Model/user';
import { Task } from '../../Model/task';
import { AdminService } from '../../services/admin';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users-list.html',
  styleUrls: ['./users-list.css']
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  selectedUser: User | null = null;
  userTasks: Task[] = [];
  showTasksModal = false;
  showUserModal = false;
  editingUser: User | null = null;
  
  userForm = {
    name: '',
    email: '',
    password: '',
    role: 'USER' as 'USER' | 'ADMIN'
  };

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.adminService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
      },
      error: (error) => console.error('Error loading users:', error)
    });
  }

  viewUserTasks(user: User): void {
    this.selectedUser = user;
    this.adminService.getUserTasks(user.id).subscribe({
      next: (tasks) => {
        this.userTasks = tasks;
        this.showTasksModal = true;
      },
      error: (error) => console.error('Error loading user tasks:', error)
    });
  }

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
      alert('Please fill in all required fields');
      return;
    }

    const userData: User = {
      id: this.editingUser?.id || 0,
      name: this.userForm.name,
      email: this.userForm.email,
      role: this.userForm.role
    };

    if (this.editingUser) {
      // Update user
      this.adminService.updateUser(this.editingUser.id, userData).subscribe({
        next: () => {
          this.loadUsers();
          this.closeUserModal();
          alert('User updated successfully');
        },
        error: (error) => console.error('Error updating user:', error)
      });
    } else {
      // Create new user
      if (!this.userForm.password) {
        alert('Please enter a password');
        return;
      }
      userData.password = this.userForm.password;
      this.adminService.createUser(userData).subscribe({
        next: () => {
          this.loadUsers();
          this.closeUserModal();
          alert('User created successfully');
        },
        error: (error) => console.error('Error creating user:', error)
      });
    }
  }

  deleteUser(userId: number): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.adminService.deleteUser(userId).subscribe({
        next: () => {
          this.loadUsers();
          alert('User deleted successfully');
        },
        error: (error) => console.error('Error deleting user:', error)
      });
    }
  }

  closeUserModal(): void {
    this.showUserModal = false;
    this.editingUser = null;
  }

  closeTasksModal(): void {
    this.showTasksModal = false;
    this.selectedUser = null;
    this.userTasks = [];
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