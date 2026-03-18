import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Taller } from '../../../services/taller';
@Component({
  selector: 'app-alta-taller',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './alta-taller.html',
  styleUrl: './alta-taller.css',
})
export class AltaTaller {
  tallerForm: FormGroup;

  constructor(private fb: FormBuilder, private router: Router, private tallerService: Taller){
    this.tallerForm = this.fb.group({
      workshopName: ['', Validators.required],
      address: ['', [Validators.required]],
      workshopPhone: ['', [Validators.required]],
      workshopEmail: [''],
      icon: ['']
    });
  }

  onSubmit(){
    if(this.tallerForm.valid){
      console.log("Datos introducidos:", this.tallerForm.value);

      this.tallerService.crearTaller(this.tallerForm.value).subscribe({
        next: (newWorkshop) => {
          const user = JSON.parse(sessionStorage.getItem('user') || '{}');

          user.workshop = newWorkshop;

          sessionStorage.setItem('user', JSON.stringify(user));

          window.location.href = '/dashboard';
        },
        error: (err) => {
          console.error(err);
        }
      });

    }else{
      this.tallerForm.markAllAsTouched();
    }
  }
}
