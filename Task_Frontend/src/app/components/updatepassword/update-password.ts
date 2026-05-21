import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-update-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './update-password.html',
  styleUrls: ['./update-password.css']
})
export class UpdatePassword {
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  loading = false;
  email = '';

  constructor(
    public authService: AuthService, 
    public router: Router, 
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {
    const user = this.authService.getCurrentUser();
    this.email = user?.email || '';
  }

  updatePassword() {
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
    this.cdr.markForCheck();

    this.authService.verifyCredentials({ email: this.email, password: this.currentPassword }).subscribe({
      next: () => {
        this.authService.updatePassword(this.email, this.newPassword).subscribe({
          next: () => {
            this.loading = false;
            this.cdr.markForCheck();
            this.toastr.success('Password updated successfully', 'Success');
            this.authService.logout();
            this.router.navigate(['/auth/login']);
          },
          error: (err) => {
            this.loading = false;
            this.cdr.markForCheck();
            this.toastr.error(err.error?.error || err.message || 'Failed to update password', 'Error');
          }
        });
      },
      error: (err) => {
        this.loading = false;
        this.cdr.markForCheck();
        this.toastr.error('Current password is incorrect', 'Authentication Failed');
      }
    });
  }
}

