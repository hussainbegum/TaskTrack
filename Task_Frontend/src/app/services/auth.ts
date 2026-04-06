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
  private readonly TOKEN_EXPIRY_KEY = 'token_expiry';
  private readonly SESSION_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

  private sessionCheckInterval: any;

  constructor(private http: HttpClient, private router: Router) {
    this.loadStoredUser();
    this.startSessionCheck();
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
    const tokenExpiry = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
    
    // Check if token is expired
    if (tokenExpiry && this.isTokenExpired(tokenExpiry)) {
      console.log('Token expired on load');
      this.clearAllStorage();
      return; // ✅ Just clear, don't navigate
    }
    
    if (token && userStr && role) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
        
        // ✅ Only auto-navigate if NOT already on an auth page
        const currentPath = window.location.pathname;
        if (currentPath.startsWith('/auth/')) {
          return; // User is on login/forgot/reset — don't redirect
        }
        
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

  private startSessionCheck(): void {
    // Check session every minute
    this.sessionCheckInterval = setInterval(() => {
      this.checkSessionExpiration();
    }, 60000); // Check every minute
  }

  private checkSessionExpiration(): void {
    const tokenExpiry = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
    
    if (tokenExpiry && this.isTokenExpired(tokenExpiry)) {
      console.log('Session expired');
      this.logoutWithMessage('Your session has expired. Please login again.');
    }
  }

  private isTokenExpired(expiryTime: string): boolean {
    const expiry = parseInt(expiryTime, 10);
    return Date.now() > expiry;
  }

  private setSessionExpiry(): void {
    const expiryTime = Date.now() + this.SESSION_DURATION;
    localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiryTime.toString());
    
    // Set a timeout to auto logout exactly at expiration
    setTimeout(() => {
      this.checkSessionExpiration();
    }, this.SESSION_DURATION);
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
      
      // Set session expiration (1 hour from now)
      this.setSessionExpiry();
      
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
      console.log('Session will expire at:', new Date(Date.now() + this.SESSION_DURATION).toLocaleString());
      
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
    this.stopSessionCheck();
    this.clearAllStorage();
    this.currentUserSubject.next(null);
    console.log('Logging out, navigating to login');
    this.router.navigate(['/auth/login']).then(success => {
      console.log('Navigation to login:', success);
    });
  }

  logoutWithMessage(message: string): void {
    this.stopSessionCheck();
    this.clearAllStorage();
    this.currentUserSubject.next(null);
    console.log(message);
    // You can show a toast message here if you have ToastrService injected
    // this.toastr.warning(message, 'Session Expired');
    this.router.navigate(['/auth/login'], { queryParams: { expired: 'true' } });
  }

 getToken(): string | null {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const tokenExpiry = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
    
    if (token && tokenExpiry && !this.isTokenExpired(tokenExpiry)) {
      return token;
    } else if (token && tokenExpiry && this.isTokenExpired(tokenExpiry)) {
      // ✅ Just clear storage, don't navigate (interceptor handles this)
      this.clearAllStorage();
      return null;
    }
  }
  return null;
}

  isAuthenticated(): boolean {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const tokenExpiry = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
    
    if (!token || !tokenExpiry) {
      return false;
    }
    
    return !this.isTokenExpired(tokenExpiry);
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }

  getSessionTimeRemaining(): number | null {
    const tokenExpiry = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
    if (!tokenExpiry) return null;
    
    const expiry = parseInt(tokenExpiry, 10);
    const remaining = expiry - Date.now();
    
    return remaining > 0 ? remaining : 0;
  }

  getFormattedSessionTimeRemaining(): string {
    const remaining = this.getSessionTimeRemaining();
    if (!remaining || remaining <= 0) return 'Expired';
    
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    
    return `${minutes}m ${seconds}s`;
  }

  private stopSessionCheck(): void {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
      this.sessionCheckInterval = null;
    }
  }

  private clearAllStorage(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
      localStorage.removeItem(this.ROLE_KEY);
      localStorage.removeItem(this.TOKEN_EXPIRY_KEY);
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
 
// Forgot Password API
forgotPassword(email: string): Observable<any> {
  return this.http.post(`${this.apiUrl}/forgot-password`, { email })
  .pipe(
    catchError(this.handleError)
  );
}

// Reset Password API
resetPassword(data: any): Observable<any> {
  return this.http.post(`${this.apiUrl}/reset-password`, data)
  .pipe(
    catchError(this.handleError)
  );
}

}