import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expectedRole = route.data['role'];
    const userRole = this.authService.getUserRole();
    
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return false;
    }
    
    if (userRole === expectedRole) {
      return true;
    }
    if (userRole === 'ADMIN') {
      this.router.navigate(['/admin/dashboard']);
    } else if (userRole === 'USER') {
      this.router.navigate(['/user/dashboard']);
    } else {
      this.router.navigate(['/auth/login']);
    }
    
    return false;
  }
}