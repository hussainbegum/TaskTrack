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
    const currentUser = this.authService.getCurrentUser();
    
    let userRole = '';
    if (currentUser) {
      userRole = currentUser.role || '';
    }
    
    if (this.authService.isAuthenticated() && userRole === expectedRole) {
      return true;
    }
    
    this.router.navigate(['/dashboard']);
    return false;
  }
}