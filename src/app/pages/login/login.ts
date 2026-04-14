import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Auth } from '../../services/authService/auth.service';
import { Router } from '@angular/router';
import { User } from '../../models/user';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login {
  showLogin = false;
  showRegister = false;

  loginForm: FormGroup;
  registerForm: FormGroup;

  loginError: string = '';
  registerError: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: Auth,
    private router: Router,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false],
    });

    this.registerForm = this.fb.group({
      dni: ['', [Validators.required, Validators.pattern(/^\d{8}[a-zA-Z]$/)]],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['', Validators.required],
      rememberMe: [false],
    });
  }

  openLogin(): void {
    this.showLogin = true;
  }
  closeLogin(): void {
    this.showLogin = false;
    this.loginForm.reset();
  }

  openRegister(): void {
    this.showRegister = true;
  }
  closeRegister(): void {
    this.showRegister = false;
    this.registerForm.reset();
  }

  onLoginSubmit(): void {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: (backendResponse: User) => {
          sessionStorage.setItem('token', JSON.stringify(backendResponse));
          localStorage.setItem('user', JSON.stringify(backendResponse));

          const token = backendResponse.token;
          const rememberMe = this.loginForm.get('rememberMe')?.value;

          if (rememberMe && token) {
            const expirationDate = new Date();
            expirationDate.setDate(expirationDate.getDate() + 7);
            document.cookie = `auth_token=${token}; expires=${expirationDate.toUTCString()}; path=/; SameSite=Strict; Secure`;
          } else if (token) {
            sessionStorage.setItem('auth_token', token);
          }

          this.closeLogin();
          this.router.navigate(['/dashboard']);
        },
        error: (backendError: HttpErrorResponse) => {
          console.error('Error al iniciar sesión:', backendError);
          this.loginError = 'Correo o contraseña incorrectos. Inténtalo de nuevo.';
        },
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  onRegisterSubmit(): void {
    if (this.registerForm.valid) {
      this.authService.register(this.registerForm.value).subscribe({
        next: (backendResponse: User) => {
          localStorage.setItem('user', JSON.stringify(backendResponse));

          const token = backendResponse.token;
          const rememberMe = this.registerForm.get('rememberMe')?.value;

          if (rememberMe && token) {
            const expirationDate = new Date();
            expirationDate.setDate(expirationDate.getDate() + 7);
            document.cookie = `auth_token=${token}; expires=${expirationDate.toUTCString()}; path=/; SameSite=Strict; Secure`;
          } else if (token) {
            sessionStorage.setItem('auth_token', token);
          }

          this.closeRegister();

          const rolElegido = backendResponse.role;
          if (rolElegido === 'MANAGER') {
            this.router.navigate(['/dashboard/alta-taller']);
          } else {
            this.router.navigate(['/dashboard']);
          }
        },
        error: (errorBackend: HttpErrorResponse) => {
          console.error('Error al registrar usuario', errorBackend);
          this.registerError =
            errorBackend.error?.message ||
            'Error al registrarse. Comprueba los datos o si el correo ya existe';
        },
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}
