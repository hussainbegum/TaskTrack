import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../Model/user';
import { Task } from '../Model/task';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:8080/admin';

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  createUser(user: User): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/add-user`, user);
  }

  deleteUser(id: number): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/users/${id}`);
  }

  getUserTasks(userId: number): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/users/${userId}/tasks`);
  }
}