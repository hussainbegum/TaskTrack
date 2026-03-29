import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    // Check if already logged in
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/user/dashboard']);
    }
    
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required])
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
      
      alert('Please fill in all required fields correctly.');
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';
    
    const credentials = {
      email: this.loginForm.get('email')?.value,
      password: this.loginForm.get('password')?.value
    };
    
    console.log('Attempting login for:', credentials.email);
    
    this.authService.login(credentials).subscribe({
      next: (response) => {
        this.loading = false;
        
        if (typeof response === 'string') {
          if (response === 'Invalid Credentials') {
            alert('Invalid Credentials! Please check your email and password.');
            this.errorMessage = 'Invalid email or password. Please try again.';
             this.router.navigate(['/auth/sign']);
            return;
          }
          
          console.log('Login successful');
          this.successMessage = 'Login successful! Redirecting to dashboard...';
          
          setTimeout(() => {
            this.router.navigate(['/user/dashboard']);
          });
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('Login error:', error);
        
        if (error.status === 401) {
          this.errorMessage = 'Invalid email or password. Please try again.';
          alert('Invalid Credentials! Please check your email and password.');
        } else if (error.status === 0) {
          this.errorMessage = 'Cannot connect to server. Please check if backend is running.';
          alert('Connection Error! Unable to connect to the server. Please try again later.');
        } else if (error.error === 'Invalid Credentials') {
          this.errorMessage = 'Invalid email or password. Please try again.';
          alert('Invalid Credentials! Please check your email and password.');
        } else {
          this.errorMessage = error.message || 'Login failed. Please try again.';
          alert('Login Failed! ' + (error.message || 'Please try again.'));
        }
      }
    });
  }

  onForgotPassword() {
    console.log('Forgot password clicked');
    alert('Password reset link will be sent to your email');
  }

  onRegistration() {
    console.log('Registration clicked');
    this.router.navigate(['/auth/register']);
  }
}