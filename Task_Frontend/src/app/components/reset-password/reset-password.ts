import { Component } from '@angular/core';
import { AuthService } from '../../services/auth';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPassword {
  email = "";
  otp = "";
  newPassword = "";
  toastr: any;

  constructor(private authService: AuthService, private router: Router) {
    // Auto-fill email passed from forgot-password page
    const nav = this.router.getCurrentNavigation();
    if (nav?.extras?.state) {
      this.email = nav.extras.state['email'] || '';
    }
  }

  resetPassword() {
    const data = { email: this.email, otp: this.otp, newPassword: this.newPassword };

    this.authService.resetPassword(data).subscribe({
      next: () => {
         alert("OTP sent to your email");
       alert("Password updated successfully");
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        alert(err.message);
      }
    });
  }
}
