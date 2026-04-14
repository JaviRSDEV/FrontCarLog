import { Workshop } from './../../../models/workshop';
import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TallerService } from '../../../services/tallerService/taller.service';

@Component({
  selector: 'app-alta-taller',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './alta-taller.html',
  styleUrl: './alta-taller.css',
})
export class AltaTaller {
  tallerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private tallerService: TallerService,
  ) {
    this.tallerForm = this.fb.group({
      workshopName: ['', Validators.required],
      address: ['', [Validators.required]],
      workshopPhone: ['', [Validators.required]],
      workshopEmail: [''],
      icon: [''],
    });
  }

  onSubmit() {
    if (this.tallerForm.valid) {
      this.tallerService.crearTaller(this.tallerForm.value).subscribe({
        next: (newWorkshop) => {
          const isLocal = localStorage.getItem('user') !== null;
          const userJson = isLocal ? localStorage.getItem('user') : sessionStorage.getItem('user');

          if (userJson) {
            let user = JSON.parse(userJson);

            user.workshop = newWorkshop;

            if (newWorkshop && newWorkshop.workshopId) {
              user.workShopId = newWorkshop.workshopId;
            }

            if (isLocal) {
              localStorage.setItem('user', JSON.stringify(user));
            } else {
              sessionStorage.setItem('user', JSON.stringify(user));
            }
          }

          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          console.error('Error al crear el taller:', err);
        },
      });
    } else {
      this.tallerForm.markAllAsTouched();
    }
  }
}
