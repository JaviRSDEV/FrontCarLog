import { Component, OnInit, inject, input, output, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Vehicle } from '../../../models/vehicle';
import { VehicleService } from '../../../services/vehicleService/vehicle.service';

@Component({
  selector: 'app-vehicle-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './vehicle-form.component.html',
  styleUrl: './vehicle-form.component.css',
})
export class VehicleFormComponent implements OnInit {
  vehiculoEdicion = input<Vehicle | null>(null);
  userDni = input<string>('');
  workshopId = input<number>(0);
  isEditing = input<boolean>(false);

  guardado = output<void>();
  cerrar = output<void>();

  private fb = inject(FormBuilder);
  private vehicleService = inject(VehicleService);
  private destroy$ = inject(DestroyRef);

  imagenesTemporales = signal<string[]>([]);
  vehiculoForm = this.fb.nonNullable.group({
    plate: ['', [Validators.required]],
    brand: ['', Validators.required],
    model: ['', Validators.required],
    kilometers: [0, [Validators.required, Validators.min(0)]],
    engine: [''],
    horsePower: [0],
    torque: [0],
    tires: [''],
    lastMaintenance: [null as string | null],
    images: [[] as string[]],
    ownerId: [''],
  });

  ngOnInit(): void {
    const editMode = this.isEditing();
    const vehiculo = this.vehiculoEdicion();

    if (editMode && vehiculo) {
      const images = vehiculo.images ? [...vehiculo.images] : [];
      this.imagenesTemporales.set(images);

      this.vehiculoForm.patchValue({
        ...vehiculo,
        images: images,
      });
    }
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const files = Array.from(input.files);
    const nuevasImagenes: string[] = [];

    for (let file of files) {
      try {
        const compressedBase64 = await this.compressImage(file, 800, 600, 0.7);
        nuevasImagenes.push(compressedBase64);
      } catch (error) {
        console.error('Error al comprimir la imagen', error);
      }
    }

    this.imagenesTemporales.update((imgs) => [...imgs, ...nuevasImagenes]);
    this.vehiculoForm.patchValue({ images: this.imagenesTemporales() });
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
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  }

  eliminarImagenPrevia(index: number): void {
    this.imagenesTemporales.update((imgs) => {
      const newImgs = [...imgs];
      newImgs.splice(index, 1);
      return newImgs;
    });
    this.vehiculoForm.patchValue({ images: this.imagenesTemporales() });
  }

  guardarVehiculo(): void {
    if (this.vehiculoForm.valid) {
      const formValue = this.vehiculoForm.getRawValue();
      const vehiculoData: Vehicle = {
        ...formValue,
        workshopId: this.workshopId(),
        ownerId: formValue.ownerId || this.userDni(),
      };

      const vehiculoOriginal = this.vehiculoEdicion();
      const operacion: Observable<Vehicle> =
        this.isEditing() && vehiculoOriginal
          ? this.vehicleService.updateVehicle(vehiculoOriginal.plate, vehiculoData)
          : this.vehicleService.createVehicle(vehiculoData);

      operacion.pipe(takeUntilDestroyed(this.destroy$)).subscribe({
        next: () => this.guardado.emit(),
        error: (err: HttpErrorResponse) => console.error('Error en la operación:', err),
      });
    } else {
      this.vehiculoForm.markAllAsTouched();
    }
  }
}
