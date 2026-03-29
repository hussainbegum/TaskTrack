import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { User } from '../../Model/user';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users-list.html',
  styleUrls: ['./users-list.css']
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  loading = false;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    // Sample users - replace with API call
    this.users = [
      { id: 1, name: 'John Doe', email: 'john@example.com', role: 'ADMIN', createdAt: new Date().toISOString() },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'USER', createdAt: new Date().toISOString() },
      { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'USER', createdAt: new Date().toISOString() }
    ];
    this.loading = false;
  }

  changeUserRole(userId: number, role: string) {
    console.log(`Changing user ${userId} role to ${role}`);
    // Implement API call
  }

  deleteUser(userId: number) {
    if (confirm('Are you sure you want to delete this user?')) {
      console.log(`Deleting user ${userId}`);
      // Implement API call
    }
  }
}