import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './change-password.html'
})
export class ChangePassword {
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  loading = false;
  email = '';

  constructor(private authService: AuthService, public router: Router, private toastr: ToastrService) {
    const user = this.authService.getCurrentUser();
    this.email = user?.email || '';
  }

  changePassword() {
    if (!this.currentPassword) {
      this.toastr.warning('Please enter current password', 'Missing field');
      return;
    }
    if (!this.newPassword) {
      this.toastr.warning('Please enter new password', 'Missing field');
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.toastr.error('Passwords do not match', 'Validation Error');
      return;
    }
    if (this.newPassword.length < 6) {
      this.toastr.warning('Password must be at least 6 characters', 'Weak Password');
      return;
    }

    this.loading = true;

    // Verify current password
    this.authService.verifyCredentials({ email: this.email, password: this.currentPassword }).subscribe({
      next: () => {
        // Now change password
        this.authService.changePassword(this.email, this.newPassword).subscribe({
          next: () => {
            this.loading = false;
            this.toastr.success('Password changed successfully', 'Success');
            this.router.navigate(['/auth/login']);
          },
          error: (err) => {
            this.loading = false;
            this.toastr.error(err.error?.error || err.message || 'Failed to change password', 'Error');
          }
        });
      },
      error: (err) => {
        this.loading = false;
        this.toastr.error('Current password is incorrect', 'Authentication Failed');
      }
    });
  }
}