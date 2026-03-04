import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  showLogin = false;
  showRegister = false;

  openLogin(){this.showLogin = true; }
  closeLogin(){this.showLogin = false; }

  openRegister(){this.showRegister = true; }
  closeRegister(){this.showRegister = false; }
}
