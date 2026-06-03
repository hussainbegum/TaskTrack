import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule]
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  errorMessage = '';
  isInvalid: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {
    if (this.authService.isLoggedIn()) {
      const role = this.authService.getUserRole();
      if (role === 'ADMIN') {
        this.router.navigate(['/admin/dashboard']);
      } else if (role === 'USER') {
        this.router.navigate(['/user/dashboard']);
      }
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
      this.triggerShake();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    
    const credentials = {
      email: this.loginForm.get('email')?.value,
      password: this.loginForm.get('password')?.value
    };
    
    this.authService.login(credentials)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (response) => {
          console.log('Login successful, role:', response.role);
        },
        error: (error) => {
          console.error('Catching login error:', error);
          this.errorMessage = error?.message || error?.error?.message || 'Login failed. Please try again.';
          
          try {
            this.toastr.error(this.errorMessage, 'Login Failed');
          } catch (toastrError) {
            console.error('Toastr failed to display:', toastrError);
          }
          
          this.triggerShake();
        }
      });
  }

  triggerShake() {
    this.isInvalid = true;
    this.cdr.markForCheck(); 

    setTimeout(() => {
      this.isInvalid = false;
      this.cdr.markForCheck(); 
    }, 400);
  }

  onForgotPassword(){
    this.router.navigate(['/auth/forgot-password']);
  }
}