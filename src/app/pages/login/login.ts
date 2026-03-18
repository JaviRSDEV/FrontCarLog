import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Auth } from '../../services/auth';
import { Router } from '@angular/router';
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

  constructor(private fb: FormBuilder, private authService: Auth, private router: Router){
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });

    this.registerForm = this.fb.group({
      dni: ['', [Validators.required, Validators.pattern(/^\d{8}[a-zA-Z]$/)]],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['', Validators.required],
      rememberMe: [false]
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

          sessionStorage.setItem('token', JSON.stringify(backendResponse));

          const token = backendResponse.token;
          const rememberMe = this.loginForm.get('rememberMe')?.value

          if(rememberMe){
            const expirationDate = new Date();
            expirationDate.setDate(expirationDate.getDate() + 7);

            document.cookie = `auth_token=${token}; expires=${expirationDate.toUTCString()}; path=/; SameSite=Strict; Secure`;
            console.log("Token almacenado en una Cookie (Recordar sesión)");
          }else{
            sessionStorage.setItem('auth_token', token);
            console.log("Token almacenado en la session storage (Sesión temporal)");
          }

          this.closeLogin();
          this.router.navigate(['/dashboard'])
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

          sessionStorage.setItem('token', JSON.stringify(backendResponse));

          const token =  backendResponse.token;
          const rememberMe = this.registerForm.get('rememberMe')?.value;
          sessionStorage.setItem('role', this.registerForm.get('role')?.value);
          const rolElegido = this.registerForm.get('role')?.value;

          const usuarioConstruido = {
            token: token,
            role: rolElegido,
            workshop: null
          };

          sessionStorage.setItem('user', JSON.stringify(usuarioConstruido));

          if(rememberMe){
            const expirationDate = new Date();
            expirationDate.setDate(expirationDate.getDate() + 7);
            document.cookie = `auth_token=${token}; expires=${expirationDate.toUTCString()}; path=/; SameSite=Strict; Secure`;
            console.log("Auto-login: Token en cookie");
          }else{
            sessionStorage.setItem('auth_token', token);
            console.log("Auto-login: Token en SessionStorage");
          }


          this.closeRegister();

          console.log(rolElegido);
          if(rolElegido === 'MANAGER'){
            console.log("Dueño de taller, redirigiendo a la creación del taller...");
            this.router.navigate(['/dashboard/alta-taller']);
          }else{
            console.log("Redirigiendo al dashboard...")
            this.router.navigate(['/dashboard']);
          }
        },
          error: (errorBackend) => {
            console.error('Error al registrar usuario', errorBackend)
        }
      });
    }else {
      console.log("El formulario de registro contiene errores");
      this.registerForm.markAllAsTouched();
    }
  }
}
