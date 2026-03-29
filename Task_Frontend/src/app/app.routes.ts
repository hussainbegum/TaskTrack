import { Routes } from '@angular/router';
import { AuthGuard } from './gurds/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: '/landing', pathMatch: 'full' },

  {
    path: 'landing',
    loadComponent: () =>
      import('./landing/landing').then(m => m.LandingComponent)
  },

  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./authentication/login/login').then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./authentication/register/register').then(m => m.RegisterComponent)
      }
    ]
  },

  {
    path: 'user',
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./user/dashboard/dashboard').then(m => m.DashboardComponent)
      }
    ]
  },

  { path: '**', redirectTo: '/landing' }
];