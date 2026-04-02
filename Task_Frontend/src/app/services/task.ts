import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task, TaskCreate, TaskUpdate } from '../Model/task';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = 'http://localhost:8080/user/tasks';

  constructor(private http: HttpClient) { }

  // Get user's own tasks
  getMyTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/my-tasks`);
  }

  getTaskById(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/${id}`);
  }

  createTask(task: TaskCreate): Observable<Task> {
    return this.http.post<Task>(`${this.apiUrl}/create`, task);
  }

  updateTask(id: number, task: TaskUpdate): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/update/${id}`, task);
  }

  updateTaskStatus(id: number, status: string): Observable<Task> {
    return this.http.patch<Task>(`${this.apiUrl}/${id}/status`, { status });
  }

  deleteTask(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${id}`);
  }
}