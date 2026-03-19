import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TallerService } from '../../../services/tallerService/tallerService';
@Component({
  selector: 'app-alta-taller',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './alta-taller.html',
  styleUrl: './alta-taller.css',
})
export class AltaTaller {
  tallerForm: FormGroup;

  constructor(private fb: FormBuilder, private router: Router, private tallerService: TallerService){
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

          let userJson = localStorage.getItem('user');

          if(userJson){
            let user = JSON.parse(userJson);

            user.workshop = {
              workshopName: this.tallerForm.get('nombreTaller')?.value || 'Mi taller'
            };

            localStorage.setItem('user', JSON.stringify(user));
          }

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
