import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { debounceTime, distinctUntilChanged, Subject, Subscription } from 'rxjs';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css',
})
export class SearchComponent implements OnInit, OnDestroy {
  @Input() placeholder: string = 'Buscar...';

  @Output() busquedaLista = new EventEmitter<string>();

  private buscadorSubject = new Subject<string>();
  private subscripcion!: Subscription;

  ngOnInit(): void {
    this.subscripcion = this.buscadorSubject
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe((texto: string) => {
        this.busquedaLista.emit(texto);
      });
  }

  onInput(event: Event): void {
    const element = event.target as HTMLInputElement;
    this.buscadorSubject.next(element.value);
  }

  ngOnDestroy(): void {
    if (this.subscripcion) {
      this.subscripcion.unsubscribe();
    }
  }
}
