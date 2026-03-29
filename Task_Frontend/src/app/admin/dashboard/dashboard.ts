import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { User } from '../../Model/user';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class AdminDashboardComponent implements OnInit {
  currentUser: User | null = null;
  totalUsers = 0;
  totalTasks = 0;
  completedTasks = 0;
  pendingTasks = 0;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.loadStats();
  }

  loadStats() {
    this.totalUsers = 25;
    this.totalTasks = 150;
    this.completedTasks = 98;
    this.pendingTasks = 52;
  }
}