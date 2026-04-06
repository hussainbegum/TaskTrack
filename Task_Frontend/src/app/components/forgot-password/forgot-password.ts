import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword {
  email: string = '';
  loading = false;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private toastr: ToastrService
  ) {}

  sendOtp() {
    if (!this.email) {
      this.toastr.error("Please enter your email", "Email Required");
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.toastr.error("Please enter a valid email address", "Invalid Email");
      return;
    }

    this.loading = true;

    this.authService.forgotPassword(this.email).subscribe({
      next: () => {
        this.loading = false;
        this.toastr.success("OTP sent to your email", "Check Your Inbox");
        this.router.navigate(['/auth/reset-password'], { 
          state: { email: this.email } 
        });
      },
      error: (err) => {
        this.loading = false;
        this.toastr.error(err.error?.message || err.message || "Failed to send OTP", "Error");
      }
    });
  }
}