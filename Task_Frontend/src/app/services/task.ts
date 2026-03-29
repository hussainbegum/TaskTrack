import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task, TaskCreate, TaskUpdate } from '../Model/task';
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = 'http://localhost:8080/tasks';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/all`, { headers: this.getHeaders() });
  }

  getTaskById(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  createTask(task: TaskCreate): Observable<Task> {
    return this.http.post<Task>(`${this.apiUrl}/create`, task, { headers: this.getHeaders() });
  }

  updateTask(id: number, task: TaskUpdate): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/update/${id}`, task, { headers: this.getHeaders() });
  }

  deleteTask(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${id}`, { headers: this.getHeaders() });
  }
}