import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl, ValidationErrors, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-register',
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class RegisterComponent {
  registerForm: FormGroup;
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
    
    this.registerForm = new FormGroup({
      name: new FormControl('', [
        Validators.required, 
        Validators.minLength(3),
        Validators.maxLength(50)
      ]),
      email: new FormControl('', [
        Validators.required, 
        Validators.email
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(6)
      ]),
      confirmPassword: new FormControl('', [
        Validators.required
      ])
    }, {
      validators: this.passwordMatchValidator
    });
  }

  // Custom validator to check if passwords match
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  // This is the main submit method called when form is submitted
  onSubmit() {
    // First check if form is valid
    if (this.registerForm.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.registerForm.controls).forEach(key => {
        this.registerForm.get(key)?.markAsTouched();
      });
      return;
    }

    // If form is valid, proceed with registration
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';
    
    // Prepare user data (excluding confirmPassword)
    const userData = {
      name: this.registerForm.get('name')?.value,
      email: this.registerForm.get('email')?.value,
      password: this.registerForm.get('password')?.value
    };
    
    console.log('Sending registration data:', userData);
    
    // Call the registration API
    this.authService.register(userData).subscribe({
      next: (response) => {
        this.loading = false;
        console.log('Registration successful:', response);
        
        // Show success message
        this.successMessage = `Welcome ${response.name}! Registration successful. Redirecting to dashboard...`;
        
        // Navigate to dashboard after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/user/dashboard']);
        }, 2000);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.message || 'Registration failed. Please try again.';
        console.error('Registration error:', error);
      }
    });
  }

  onLogin() {
    console.log('Navigate to login clicked');
    this.router.navigate(['/auth/login']);
  }
}