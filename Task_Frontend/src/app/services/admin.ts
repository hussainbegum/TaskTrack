import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../Model/user';
import { Task, TaskCreate, TaskUpdate } from '../Model/task';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:8080/admin';

  constructor(private http: HttpClient) {}


  getUsersPage(page: number, size: number): Observable<any> {
  return this.http.get<any>(
    `${this.apiUrl}/userspage?page=${page}&size=${size}`
  );
}

  // User Management
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  

  createUser(user: User): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/users`, user);
  }

  updateUser(id: number, user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/users/${id}`, user);
  }

 

// In admin.service.ts
// In admin.service.ts
deleteUser(userId: number, newUserName?: string) {
  const body: any = {};
  if (newUserName && newUserName.trim()) {
    body.newUserName = newUserName;
  }
  
  console.log('DELETE Request - URL:', `${this.apiUrl}/users/${userId}`);
  console.log('DELETE Request - Body:', body);
  
  return this.http.delete(
    `${this.apiUrl}/users/${userId}`,
    { 
      body: body,
      responseType: 'text' 
    }
  );
}


  getUserTasks(userId: number): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/users/${userId}/tasks`);
  }

  // Task Management
  getAllTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/tasks`);
  }

  createTask(task: TaskCreate): Observable<Task> {
    return this.http.post<Task>(`${this.apiUrl}/tasks`, task);
  }

  updateTask(id: number, task: TaskUpdate): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/tasks/${id}`, task);
  }

  updateTaskStatus(id: number, status: string): Observable<Task> {
    return this.http.patch<Task>(`${this.apiUrl}/tasks/${id}/status`, { status });
  } 

  deleteTask(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/tasks/${id}`, { responseType: 'text' });
  }
}