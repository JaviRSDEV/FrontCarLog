import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, Form } from '@angular/forms';

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

  constructor(private fb: FormBuilder){
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }
  openLogin(){this.showLogin = true; }
  closeLogin(){
    this.showLogin = false;
    this.loginForm.reset()
  }

  openRegister(){this.showRegister = true; }
  closeRegister(){this.showRegister = false; }

  onLoginSubmit(){
    if(this.loginForm.valid){
      console.log("Datos listos para su envio al backend:", this.loginForm.value);
    }else{
      console.log("El formulario contiene errores");
      this.loginForm.markAllAsTouched();
    }
  }
}
