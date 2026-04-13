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
      .subscribe((texto) => {
        this.busquedaLista.emit(texto);
      });
  }

  onInput(event: any) {
    this.buscadorSubject.next(event.target.value);
  }

  ngOnDestroy(): void {
    if (this.subscripcion) {
      this.subscripcion.unsubscribe();
    }
  }
}
