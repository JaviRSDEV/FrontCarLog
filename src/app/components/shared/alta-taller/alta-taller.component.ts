import { Component, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TallerService } from '../../../services/tallerService/taller.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-alta-taller',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './alta-taller.html',
  styleUrl: './alta-taller.css',
})
export class AltaTaller {
  tallerForm: FormGroup;
  imagenTemporal: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private tallerService: TallerService,
    private cdr: ChangeDetectorRef,
  ) {
    this.tallerForm = this.fb.group({
      workshopName: ['', Validators.required],
      address: ['', [Validators.required]],
      workshopPhone: ['', [Validators.required]],
      workshopEmail: ['', [Validators.email]],
      icon: [''],
    });
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    try {
      const compressedBase64 = await this.compressImage(file, 800, 600, 0.7);
      this.imagenTemporal = compressedBase64;
      this.tallerForm.patchValue({ icon: compressedBase64 });
    } catch (error) {
      console.error('Error al procesar la imagen:', error);
    }
    this.cdr.detectChanges();
  }

  compressImage(file: File, maxWidth: number, maxHeight: number, quality: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result !== 'string') return reject('Error al leer archivo');
        const img = new Image();
        img.src = result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject('No se pudo obtener el contexto 2D');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/webp', quality));
        };
      };
      reader.onerror = (err) => reject(err);
    });
  }

  eliminarImagen(): void {
    this.imagenTemporal = null;
    this.tallerForm.patchValue({ icon: '' });
    this.cdr.detectChanges();
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
