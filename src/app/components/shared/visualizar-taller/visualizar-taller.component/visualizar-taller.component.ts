import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TallerService } from '../../../../services/tallerService/taller.service';

@Component({
  selector: 'app-visualizar-taller',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './visualizar-taller.component.html',
  styleUrl: './visualizar-taller.component.css',
})
export class VisualizarTallerComponent implements OnInit {
  workshopData: any = null;
  cargando: boolean = true;
  mensajeError: string = '';

  modoEdicion: boolean = false;
  datosEdicion: any = {};
  guardando: boolean = false;

  imagenTemporal: string | null = null;

  constructor(
    private tallerService: TallerService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.cargarDatosDelTaller();
  }

  cargarDatosDelTaller() {
    const userJson = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (!userJson) return;
    const user = JSON.parse(userJson);
    const idTaller = user.workShopId;

    if (idTaller) {
      this.tallerService.getTallerPorId(idTaller).subscribe({
        next: (data) => {
          this.workshopData = data;
          this.cargando = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.mensajeError = 'Error al cargar los datos.';
          this.cargando = false;
          this.cdr.detectChanges();
        },
      });
    }
  }

  activarEdicion() {
    this.modoEdicion = true;
    this.datosEdicion = { ...this.workshopData };
    this.imagenTemporal = this.workshopData.icon;
    this.cdr.detectChanges();
  }

  cancelarEdicion() {
    this.modoEdicion = false;
    this.imagenTemporal = null;
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    try {
      const compressedBase64 = await this.compressImage(file, 800, 600, 0.7);
      this.imagenTemporal = compressedBase64;
      this.datosEdicion.icon = compressedBase64;
    } catch (error) {
      console.error('Error al comprimir la imagen', error);
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
          if (!ctx) return reject('No ctx');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/webp', quality));
        };
      };
    });
  }

  eliminarLogoEdicion(): void {
    this.imagenTemporal = null;
    this.datosEdicion.icon = '';
    this.cdr.detectChanges();
  }

  async guardarEdicion() {
    this.guardando = true;

    const formData = new FormData();
    const { icon, ...datosSinIcono } = this.datosEdicion;

    formData.append('workshopData', JSON.stringify(datosSinIcono));

    if (this.imagenTemporal && this.imagenTemporal.startsWith('data:image')) {
      const blob = await (await fetch(this.imagenTemporal)).blob();
      const fileName = `${this.workshopData.workshopName.replace(/\s+/g, '_')}_icon.webp`;
      formData.append('file', blob, fileName);
    }

    this.tallerService.actualizarTallerConFoto(this.workshopData.workshopId, formData).subscribe({
      next: (res: any) => {
        this.workshopData = res;
        this.modoEdicion = false;
        this.guardando = false;
        this.imagenTemporal = null;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al guardar:', err);
        this.guardando = false;
        this.cdr.detectChanges();
      },
    });
  }
}
