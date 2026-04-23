import { Component, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { TallerService } from '../../../services/tallerService/taller.service';
import { Auth } from '../../../services/authService/auth.service';

@Component({
  selector: 'app-alta-taller',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './alta-taller.html',
  styleUrl: './alta-taller.css',
})
export class AltaTaller {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly tallerService = inject(TallerService);
  private readonly authService = inject(Auth);
  private readonly destroy$ = inject(DestroyRef);

  imagenTemporal = signal<string | null>(null);

  tallerForm = this.fb.nonNullable.group({
    workshopName: ['', Validators.required],
    address: ['', [Validators.required]],
    workshopPhone: ['', [Validators.required]],
    workshopEmail: ['', [Validators.email]],
    icon: [''],
  });

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    try {
      const compressedBase64 = await this.compressImage(file, 800, 600, 0.7);
      this.imagenTemporal.set(compressedBase64);
      this.tallerForm.patchValue({ icon: compressedBase64 });
    } catch (error) {
      console.error('Error al procesar la imagen:', error);
    }
  }

  compressImage(file: File, maxWidth: number, maxHeight: number, quality: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result !== 'string') return reject(new Error('Error al leer archivo'));
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
          } else if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject(new Error('No se pudo obtener el contexto 2D'));
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/webp', quality));
        };
      };
      reader.onerror = (err) => reject(new Error('Error al lerr la imagen'));
    });
  }

  eliminarImagen(): void {
    this.imagenTemporal.set(null);
    this.tallerForm.patchValue({ icon: '' });
  }

  onSubmit() {
    if (this.tallerForm.invalid) {
      this.tallerForm.markAllAsTouched();
      return;
    }

    this.tallerService
      .crearTaller(this.tallerForm.getRawValue())
      .pipe(takeUntilDestroyed(this.destroy$))
      .subscribe({
        next: (newWorkshop) => {
          const userJson = this.authService.getUserFromStorage();

          if (userJson) {
            const user = JSON.parse(userJson);

            user.workshop = newWorkshop;
            if (newWorkshop?.workshopId) {
              user.workShopId = newWorkshop.workshopId;
            }

            this.authService.saveUserToStorage(user);
          }

          this.router.navigate(['/dashboard']);
        },
        error: (err) => console.error('Error al crear el taller:', err),
      });
  }
}
