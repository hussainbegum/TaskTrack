import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../Model/user';
import { Task } from '../Model/task';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:8080/api/admin';

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/${id}`);
  }

  updateUserRole(id: number, role: 'user' | 'admin'): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/users/${id}/role`, { role });
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${id}`);
  }

  getUserTasks(userId: number): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/users/${userId}/tasks`);
  }
}