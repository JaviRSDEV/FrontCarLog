import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Auth } from '../../services/auth';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  showLogin = false;
  showRegister = false;

  loginForm: FormGroup;
  registerForm: FormGroup;

  constructor(private fb: FormBuilder, private authService: Auth){
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.registerForm = this.fb.group({
      dni: ['', [Validators.required, Validators.pattern(/^\d{8}[a-zA-Z]$/)]],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['', Validators.required]
    });
  }

  openLogin(){ this.showLogin = true; }
  closeLogin(){
    this.showLogin = false;
    this.loginForm.reset();
  }

  openRegister(){ this.showRegister = true; }
  closeRegister(){
    this.showRegister = false;
    this.registerForm.reset();
  }

  onLoginSubmit(){
    if(this.loginForm.valid){
      this.authService.login(this.loginForm.value).subscribe({
        next: (backendResponse) => {
          console.log("Funciona", backendResponse);
        },
        error: (backendError) => {
          console.error("Error al iniciar sesión:", backendError)
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  onRegisterSubmit(){
    if(this.registerForm.valid){
      this.authService.register(this.registerForm.value).subscribe({
        next: (backendResponse) => {
          console.log("Usuario registrado con exito", backendResponse);
          this.closeRegister()
        },
        error: (errorBackend) => {
          console.error('Error al registrar usuario', errorBackend)
        }
      });
    } else {
      console.log("El formulario de registro contiene errores");
      this.registerForm.markAllAsTouched();
    }
  }
}
