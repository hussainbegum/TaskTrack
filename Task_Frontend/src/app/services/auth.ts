import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { User, UserLogin, UserRegister } from '../Model/user';
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
  private readonly EXPIRY_KEY = 'token_expiry';
  private readonly TOKEN_EXPIRY_SECONDS = 50*60;
  private logoutTimer: any;

  constructor(private http: HttpClient, private router: Router) {
    this.loadStoredUser();
    setInterval(() => {
      if (this.isLoggedIn() && this.isTokenExpired()) {
        this.logout();
      }
    }, 10000);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  private loadStoredUser(): void {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(this.TOKEN_KEY);
      const user = localStorage.getItem(this.USER_KEY);
      if (token && !this.isTokenExpired() && user) {
        try {
          this.currentUserSubject.next(JSON.parse(user));
          const expiry = localStorage.getItem(this.EXPIRY_KEY);
          if (expiry) this.setAutoLogout(parseInt(expiry, 10) - new Date().getTime());
        } catch (e) {
          this.clearAllStorage();
        }
      } else if (token) {
        this.clearAllStorage();
      }
    }
  }

  register(userData: UserRegister): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/signup`, userData, { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }).pipe(
      tap(() => this.login({ email: userData.email, password: userData.password }).subscribe()),
      catchError(this.handleError)
    );
  }

  login(credentials: UserLogin): Observable<string> {
    return this.http.post(`${this.apiUrl}/login`, credentials, { headers: new HttpHeaders({ 'Content-Type': 'application/json' }), responseType: 'text' }).pipe(
      tap((token: string) => {
        if (token && token !== 'Invalid Credentials') {
          this.handleAuthResponse(token, {
            id: Date.now(),
            name: credentials.email.split('@')[0],
            email: credentials.email,
            role: 'USER'
          });
        } else if (token === 'Invalid Credentials') throw new Error('Invalid email or password');
      }),
      catchError(this.handleError)
    );
  }

  logout(): void {
    if (this.logoutTimer) clearTimeout(this.logoutTimer);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
      localStorage.removeItem(this.EXPIRY_KEY);
    }
    this.currentUserSubject.next(null);
    this.router.navigate(['/landing']);
  }

  private handleAuthResponse(token: string, user: User): void {
    if (typeof window !== 'undefined') {
      const expiryTime = new Date().getTime() + (this.TOKEN_EXPIRY_SECONDS * 1000);
      localStorage.setItem(this.TOKEN_KEY, token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      localStorage.setItem(this.EXPIRY_KEY, expiryTime.toString());
      this.setAutoLogout(this.TOKEN_EXPIRY_SECONDS * 1000);
    }
    this.currentUserSubject.next(user);
  }

  private setAutoLogout(duration: number): void {
    if (this.logoutTimer) clearTimeout(this.logoutTimer);
    if (duration > 0) {
      this.logoutTimer = setTimeout(() => this.logout(), duration);
    }
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      // Remove the logout call here - just return null if expired
      if (this.isTokenExpired()) return null;
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  isTokenExpired(): boolean {
    if (typeof window !== 'undefined') {
      const expiry = localStorage.getItem(this.EXPIRY_KEY);
      if (!expiry) return true;
      return new Date().getTime() > parseInt(expiry, 10);
    }
    return true;
  }

  isAuthenticated(): boolean {
    return !this.isTokenExpired() && !!localStorage.getItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }

  private clearAllStorage(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
      localStorage.removeItem(this.EXPIRY_KEY);
    }
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';
    if (error.status === 0) errorMessage = 'Cannot connect to server';
    else if (error.status === 401) errorMessage = 'Invalid credentials or session expired';
    else if (error.status === 400) errorMessage = error.error?.message || 'Bad request';
    else if (error.status === 409) errorMessage = 'User already exists';
    else if (typeof error.error === 'string') errorMessage = error.error;
    else if (error.message) errorMessage = error.message;
    
    if (error.status === 401) this.logout();
    return throwError(() => new Error(errorMessage));
  }
}