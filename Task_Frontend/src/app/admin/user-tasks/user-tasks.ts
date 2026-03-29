import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { User } from '../../Model/user';

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  dueDate: Date;
}

@Component({
  selector: 'app-user-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-tasks.html',
  styleUrls: ['./user-tasks.css']
})
export class UserTasksComponent implements OnInit {
  user: User | null = null;
  tasks: Task[] = [];

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    const userId = this.route.snapshot.params['id'];
    this.loadUser(userId);
    this.loadTasks(userId);
  }

  loadUser(userId: number) {
    // Sample user - replace with API call
    this.user = {
      id: userId,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'USER'
    };
  }

  loadTasks(userId: number) {
    // Sample tasks - replace with API call
    this.tasks = [
      { id: 1, title: 'Complete project', description: 'Finish the project proposal', status: 'In Progress', dueDate: new Date() },
      { id: 2, title: 'Team meeting', description: 'Attend weekly sync', status: 'Completed', dueDate: new Date() }
    ];
  }
}