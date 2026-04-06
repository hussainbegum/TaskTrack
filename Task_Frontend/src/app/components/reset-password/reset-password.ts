import { Component, ViewChildren, ElementRef, QueryList } from '@angular/core';
import { AuthService } from '../../services/auth';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-reset-password',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPassword {
  email = "";
  otp1 = "";
  otp2 = "";
  otp3 = "";
  otp4 = "";
  otp5 = "";
  otp6 = "";
  newPassword = "";
  confirmPassword = "";
  loading = false;

  @ViewChildren('box1, box2, box3, box4, box5, box6')
  otpBoxes!: QueryList<ElementRef<HTMLInputElement>>;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private toastr: ToastrService  // ✅ Inject Toastr
  ) {
    const nav = this.router.getCurrentNavigation();
    if (nav?.extras?.state) {
      this.email = nav.extras.state['email'] || '';
    }
  }

  // Get full OTP as string
  getFullOtp(): string {
    return `${this.otp1}${this.otp2}${this.otp3}${this.otp4}${this.otp5}${this.otp6}`;
  }

  // Auto-move to next box when typing
  onOtpInput(index: number, event: any): void {
    const value = event.target.value;
    
    if (value.length === 1 && index < 6) {
      const nextBox = this.otpBoxes.get(index);
      if (nextBox) {
        nextBox.nativeElement.focus();
      }
    }
  }

  // Handle backspace to move to previous box
  onOtpKeydown(index: number, event: any): void {
    const currentValue = event.target.value;
    
    if (event.key === 'Backspace' && !currentValue && index > 1) {
      const prevBox = this.otpBoxes.get(index - 2);
      if (prevBox) {
        prevBox.nativeElement.focus();
      }
    }
  }

  resetPassword() {
    const otp = this.getFullOtp();
    
    // Validation with toastr instead of alert
    if (otp.length !== 6) {
      this.toastr.warning('Please enter complete 6-digit OTP', 'Incomplete OTP');
      return;
    }
    
    if (!this.newPassword) {
      this.toastr.warning('Please enter new password', 'Missing Password');
      return;
    }
    
    if (this.newPassword !== this.confirmPassword) {
      this.toastr.error('Passwords do not match', 'Password Mismatch');
      return;
    }
    
    if (this.newPassword.length < 6) {
      this.toastr.warning('Password must be at least 6 characters', 'Weak Password');
      return;
    }

    this.loading = true;
    
    const data = { 
      email: this.email, 
      otp: otp, 
      newPassword: this.newPassword 
    };

    this.authService.resetPassword(data).subscribe({
      next: () => {
        this.loading = false;
        // ✅ Success toastr
        this.toastr.success('Password updated successfully! Please login with your new password.', 'Success!');
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.loading = false;
        // ✅ Error toastr
        const errorMsg = err.error?.message || err.message || "Invalid OTP or expired. Please try again.";
        this.toastr.error(errorMsg, 'Reset Failed');
      }
    });
  }
}