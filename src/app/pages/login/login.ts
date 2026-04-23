import { Component, inject, signal, DestroyRef } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { switchMap, catchError, of } from 'rxjs';

import { UserService } from '../../services/userService/user.service';
import { Auth } from '../../services/authService/auth.service';
import { User } from '../../models/user';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(Auth);
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);
  private readonly destroy$ = inject(DestroyRef);

  showLogin = signal(false);
  showRegister = signal(false);

  loginError = signal('');
  registerError = signal('');

  isLoggingIn = signal(false);
  isRegistering = signal(false);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [false],
  });

  registerForm = this.fb.group({
    dni: ['', [Validators.required, Validators.pattern(/^\d{8}[a-zA-Z]$/)]],
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['', Validators.required],
  });

  openLogin(): void {
    this.showLogin.set(true);
  }

  closeLogin(): void {
    this.showLogin.set(false);
    this.loginForm.reset();
    this.loginError.set('');
    this.isLoggingIn.set(false);
  }

  openRegister(): void {
    this.showRegister.set(true);
  }

  closeRegister(): void {
    this.showRegister.set(false);
    this.registerForm.reset();
    this.registerError.set('');
    this.isRegistering.set(false);
  }

  onLoginSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoggingIn.set(true);
    this.loginError.set('');

    const rawValues = this.loginForm.getRawValue();
    const loginData: any = {
      email: rawValues.email!,
      password: rawValues.password!,
      rememberMe: rawValues.rememberMe ?? false,
    };

    this.authService
      .login(loginData)
      .pipe(
        switchMap((basicUser: User) => {
          return this.userService.getUserByDni().pipe(
            catchError((err: HttpErrorResponse) => {
              console.error('Error al obtener datos completos', err);
              return of(basicUser);
            }),
          );
        }),
        takeUntilDestroyed(this.destroy$),
      )
      .subscribe({
        next: (finalUser: User) => {
          const rememberMe = loginData.rememberMe;
          const storage = rememberMe ? localStorage : sessionStorage;

          localStorage.removeItem('user');
          sessionStorage.removeItem('user');
          storage.setItem('user', JSON.stringify(finalUser));

          this.closeLogin();
          this.router.navigate(['/dashboard']);
        },
        error: (backendError: HttpErrorResponse) => {
          console.error('Error al iniciar sesión:', backendError);
          this.isLoggingIn.set(false);

          if (backendError.status === 429) {
            this.loginError.set(
              backendError.error?.message || 'Demasiados intentos. Espera 1 minuto.',
            );
          } else if (
            backendError.status === 401 ||
            backendError.status === 403 ||
            backendError.error?.message === 'Bad credentials'
          ) {
            this.loginError.set('Correo o contraseña incorrectos. Inténtalo de nuevo.');
          } else {
            this.loginError.set('Ha ocurrido un error al conectar con el servidor.');
          }
        },
      });
  }

  onRegisterSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isRegistering.set(true);
    this.registerError.set('');

    const rawValues = this.registerForm.getRawValue();
    const registerData: any = {
      dni: rawValues.dni!,
      name: rawValues.name!,
      email: rawValues.email!,
      phone: rawValues.phone!,
      password: rawValues.password!,
      role: rawValues.role!,
    };

    this.authService
      .register(registerData)
      .pipe(takeUntilDestroyed(this.destroy$))
      .subscribe({
        next: (user: User) => {
          localStorage.removeItem('user');
          sessionStorage.setItem('user', JSON.stringify(user));

          this.closeRegister();

          const rolElegido = (user.role || '').toString().toUpperCase();
          if (rolElegido === 'MANAGER') {
            this.router.navigate(['/dashboard/alta-taller']);
          } else {
            this.router.navigate(['/dashboard']);
          }
        },
        error: (errorBackend: HttpErrorResponse) => {
          console.error('Error al registrar usuario', errorBackend);
          this.isRegistering.set(false);

          if (errorBackend.status === 429) {
            this.registerError.set(
              errorBackend.error?.message || 'Demasiados intentos. Por favor, espera 1 minuto.',
            );
          } else {
            this.registerError.set(
              errorBackend.error?.message ||
                'Error al registrarse. Comprueba los datos o si el correo ya existe.',
            );
          }
        },
      });
  }
}
