import { Component } from '@angular/core';
import { Register } from '../register/register';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink,Register],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

}