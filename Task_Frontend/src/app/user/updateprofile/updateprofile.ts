import { ChangeDetectorRef, Component } from '@angular/core';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { User } from '../../Model/user';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-updateprofile',
  imports: [FormsModule],
  templateUrl: './updateprofile.html',
  styleUrl: './updateprofile.css',
})
export class Updateprofile {
  name: string = '';
  email: string = '';
  currentUser: User | null = null;

  constructor(
    public authService: AuthService, 
    public router: Router, 
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {
    const user = this.authService.getCurrentUser();
    this.name = user?.name || '';
    this.email = user?.email || '';
  }

  updateProfile() {
    if (!this.name || !this.name.trim()) {
      this.toastr.warning('Please enter your name', 'Missing field');
      return;
    }
    if (!this.email || !this.email.trim()) {
      this.toastr.warning('Please enter your email', 'Missing field');
      return;
    }

    this.authService.updateProfile(this.name, this.email).subscribe({
      next: (response: any) => {
        this.toastr.success('Profile updated successfully', 'Success');
        
        if (typeof window !== 'undefined') {
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            const userObj = JSON.parse(storedUser);
            userObj.name = response.name;
            userObj.email = response.email;
            
            // FIX: Use the public service method we added to broadcast the state change safely
            this.authService.updateCurrentUserState(userObj);
          }
        }

        this.router.navigate(['/user/dashboard']);
      },
      error: (err) => {
        console.error('Error updating profile:', err);
        this.toastr.error(err.error?.error || 'Failed to update profile', 'Error');
      }
    });
  }
}