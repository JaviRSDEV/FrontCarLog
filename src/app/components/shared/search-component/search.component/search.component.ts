import { Component, inject, input, output, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css',
})
export class SearchComponent implements OnInit {
  placeholder = input<string>('Buscar...');
  busquedaLista = output<string>();

  private destroy$ = inject(DestroyRef);
  private buscadorSubject = new Subject<string>();

  ngOnInit(): void {
    this.buscadorSubject
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntilDestroyed(this.destroy$))
      .subscribe((texto: string) => {
        this.busquedaLista.emit(texto);
      });
  }

  onInput(event: Event): void {
    const element = event.target as HTMLInputElement;
    this.buscadorSubject.next(element.value);
  }
}
