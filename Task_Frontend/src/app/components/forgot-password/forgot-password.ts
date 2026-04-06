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

  constructor(private authService: AuthService, private router: Router,

  private toastr: ToastrService
) {}
 
 

  sendOtp() {
    if (!this.email) {
      this.toastr.error("Please enter your email");
      return;
    }

    this.authService.forgotPassword(this.email).subscribe({
      next: () => {
         this.toastr.success("OTP sent to your email");
        //alert("OTP sent to your email");
        // Navigate to reset page and pass email via state
        this.router.navigate(['/auth/reset-password'], { 
          state: { email: this.email } 
        });
      },
      error: (err) => {
        alert(err.message);
      }
    });
  }
}