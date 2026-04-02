import { Routes } from '@angular/router';
import { AuthGuard } from './gurds/auth-guard';
import { RoleGuard } from './gurds/role-guard';

export const routes: Routes = [
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' },  // Changed from landing

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
    path: 'admin',
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'ADMIN' },
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./admin/dashboard/dashboard').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./admin/users-list/users-list').then(m => m.UserListComponent)  // Fixed path
      },
      {
        path: 'tasks',
        loadComponent: () =>
          import('./admin/task-list/task-list').then(m => m.TaskListComponent)  // Fixed path
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },

  {
    path: 'user',
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'USER' },
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./user/dashboard/dashboard').then(m => m.DashboardComponent)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },

  { path: '**', redirectTo: '/auth/login' }
];