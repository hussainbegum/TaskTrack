import { Routes } from '@angular/router';
import { Register } from './authentication/register/register';
import { Login } from './authentication/login/login';

export const routes: Routes = [
    { path: 'login', component: Login },
    { path: 'register', component: Register },
    { path: '', redirectTo: 'login', pathMatch: 'full' }
];
