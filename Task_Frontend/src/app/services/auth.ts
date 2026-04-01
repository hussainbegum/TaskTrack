import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { User, UserLogin, UserRegister, AuthResponse } from '../Model/user';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private readonly TOKEN_KEY = 'token';
  private readonly USER_KEY = 'user';
  private readonly ROLE_KEY = 'role';

  constructor(private http: HttpClient, private router: Router) {
    this.loadStoredUser();
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getUserRole(): string | null {
    return localStorage.getItem(this.ROLE_KEY);
  }

  isAdmin(): boolean {
    return this.getUserRole() === 'ADMIN';
  }

  isUser(): boolean {
    return this.getUserRole() === 'USER';
  }

  private loadStoredUser(): void {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(this.TOKEN_KEY);
      const userStr = localStorage.getItem(this.USER_KEY);
      const role = localStorage.getItem(this.ROLE_KEY);
      
      if (token && userStr && role) {
        try {
          const user = JSON.parse(userStr);
          this.currentUserSubject.next(user);
          
          // Auto-redirect if already logged in
          if (role === 'ADMIN') {
            this.router.navigate(['/admin/dashboard']);
          } else if (role === 'USER') {
            this.router.navigate(['/user/dashboard']);
          }
        } catch (e) {
          this.clearAllStorage();
        }
      }
    }
  }

  register(userData: UserRegister): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/signup`, userData).pipe(
      catchError(this.handleError)
    );
  }

  login(credentials: UserLogin): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: AuthResponse) => {
        console.log('Login response:', response);
        if (response && response.token) {
          this.handleAuthResponse(response);
        }
      }),
      catchError(this.handleError)
    );
  }

  private handleAuthResponse(response: AuthResponse): void {
    if (typeof window !== 'undefined') {
      // Store token and role
      localStorage.setItem(this.TOKEN_KEY, response.token);
      localStorage.setItem(this.ROLE_KEY, response.role);
      
      // Create user object
      const user: User = {
        id: 0,
        name: response.username,
        email: response.email,
        role: response.role
      };
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      this.currentUserSubject.next(user);
      
      console.log('User stored, role:', response.role);
      
      // Force navigation after a small delay to ensure storage is complete
      setTimeout(() => {
        if (response.role === 'ADMIN') {
          console.log('Navigating to admin dashboard');
          this.router.navigate(['/admin/dashboard']).then(success => {
            console.log('Navigation to admin dashboard:', success);
          }).catch(err => {
            console.error('Navigation error:', err);
          });
        } else if (response.role === 'USER') {
          console.log('Navigating to user dashboard');
          this.router.navigate(['/user/dashboard']).then(success => {
            console.log('Navigation to user dashboard:', success);
          }).catch(err => {
            console.error('Navigation error:', err);
          });
        }
      }, 100);
    }
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
      localStorage.removeItem(this.ROLE_KEY);
    }
    this.currentUserSubject.next(null);
    console.log('Logging out, navigating to login');
    this.router.navigate(['/auth/login']).then(success => {
      console.log('Navigation to login:', success);
    });
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }

  private clearAllStorage(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
      localStorage.removeItem(this.ROLE_KEY);
    }
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';
    
    console.error('Login error:', error);
    
    if (error.status === 0) {
      errorMessage = 'Cannot connect to server. Please make sure backend is running on port 8080';
    } else if (error.status === 401) {
      errorMessage = error.error?.error || 'Invalid email or password';
    } else if (error.status === 400) {
      errorMessage = error.error?.error || 'Bad request';
    } else if (error.error?.error) {
      errorMessage = error.error.error;
    }
    
    return throwError(() => new Error(errorMessage));
  }
}