import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'; // Usamos ReactiveFormsModule
import Swal from 'sweetalert2';

import { TallerService } from '../../../../services/tallerService/taller.service';
import { Auth } from '../../../../services/authService/auth.service';
import { Workshop } from '../../../../models/workshop';

@Component({
  selector: 'app-visualizar-taller',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './visualizar-taller.component.html',
  styleUrl: './visualizar-taller.component.css',
})
export class VisualizarTallerComponent implements OnInit {
  private tallerService = inject(TallerService);
  private authService = inject(Auth);
  private fb = inject(FormBuilder);
  private destroy$ = inject(DestroyRef);

  workshopData = signal<any>(null);
  cargando = signal<boolean>(true);
  mensajeError = signal<string>('');

  modoEdicion = signal<boolean>(false);
  guardando = signal<boolean>(false);
  imagenTemporal = signal<string | null>(null);

  tallerForm = this.fb.nonNullable.group({
    workshopName: ['', Validators.required],
    address: ['', Validators.required],
    workshopPhone: ['', Validators.required],
    workshopEmail: ['', [Validators.required, Validators.email]],
  });

  ngOnInit(): void {
    this.cargarDatosDelTaller();
  }

  cargarDatosDelTaller() {
    const userJson = this.authService.getUserFromStorage();
    if (!userJson) {
      this.mensajeError.set('No hay sesión activa.');
      this.cargando.set(false);
      return;
    }

    try {
      const user = JSON.parse(userJson);
      const idTaller = user.workShopId || (user.workshop as Workshop)?.workshopId;

      if (idTaller) {
        this.tallerService
          .getTallerPorId(idTaller)
          .pipe(takeUntilDestroyed(this.destroy$))
          .subscribe({
            next: (data) => {
              this.workshopData.set(data);
              this.cargando.set(false);
            },
            error: () => {
              this.mensajeError.set('Error al cargar los datos del taller.');
              this.cargando.set(false);
            },
          });
      } else {
        this.mensajeError.set('Tu cuenta no tiene un taller asignado.');
        this.cargando.set(false);
      }
    } catch (error) {
      this.mensajeError.set('Error al leer la sesión.');
      this.cargando.set(false);
    }
  }

  activarEdicion() {
    const data = this.workshopData();
    if (!data) return;

    this.modoEdicion.set(true);
    this.imagenTemporal.set(data.icon);
    this.tallerForm.patchValue({
      workshopName: data.workshopName,
      address: data.address,
      workshopPhone: data.workshopPhone,
      workshopEmail: data.workshopEmail,
    });
  }

  cancelarEdicion() {
    this.modoEdicion.set(false);
    this.imagenTemporal.set(null);
    this.tallerForm.reset();
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    try {
      const compressedBase64 = await this.compressImage(file, 800, 600, 0.7);
      this.imagenTemporal.set(compressedBase64);
    } catch (error) {
      console.error('Error al comprimir la imagen', error);
      Swal.fire({
        icon: 'error',
        title: 'Error de imagen',
        text: 'No se pudo procesar el logo seleccionado.',
        background: '#1e1e1e',
        color: '#fff',
      });
    }
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
          if (!ctx) return reject('No ctx');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/webp', quality));
        };
      };
    });
  }

  eliminarLogoEdicion(): void {
    this.imagenTemporal.set(null);
  }

  async guardarEdicion() {
    if (this.tallerForm.invalid) return;

    Swal.fire({
      title: 'Guardando cambios...',
      text: 'Estamos actualizando la información de tu taller.',
      allowOutsideClick: false,
      showConfirmButton: false,
      background: '#1e1e1e',
      color: '#fff',
      didOpen: () => {
        Swal.showLoading();
      },
    });

    this.guardando.set(true);

    const formData = new FormData();
    const currentData = this.workshopData();
    const formValues = this.tallerForm.getRawValue();
    const payload = { ...currentData, ...formValues };
    delete payload.icon;

    const jsonBlob = new Blob([JSON.stringify(payload)], {
      type: 'application/json',
    });
    formData.append('workshopData', jsonBlob);

    const imgTemp = this.imagenTemporal();
    if (imgTemp && imgTemp.startsWith('data:image')) {
      const blob = await (await fetch(imgTemp)).blob();
      const fileName = `${payload.workshopName.replace(/\s+/g, '_')}_icon.webp`;
      formData.append('file', blob, fileName);
    } else if (imgTemp === null) {
      formData.append('deleteIcon', 'true');
    }

    this.tallerService
      .actualizarTallerConFoto(currentData.workshopId, formData)
      .pipe(takeUntilDestroyed(this.destroy$))
      .subscribe({
        next: (res: Workshop) => {
          this.workshopData.set(res);
          this.modoEdicion.set(false);
          this.guardando.set(false);
          this.imagenTemporal.set(null);

          Swal.fire({
            icon: 'success',
            title: '¡Actualizado!',
            text: 'Los datos del taller se han guardado correctamente.',
            timer: 2000,
            showConfirmButton: false,
            background: '#1e1e1e',
            color: '#fff',
          });
        },
        error: (err) => {
          console.error('Error al guardar:', err);
          this.guardando.set(false);

          Swal.fire({
            icon: 'error',
            title: 'Error al guardar',
            text: 'No se han podido actualizar los datos. Por favor, inténtalo de nuevo.',
            background: '#1e1e1e',
            color: '#fff',
            confirmButtonColor: '#00AEEF',
          });
        },
      });
  }
}
