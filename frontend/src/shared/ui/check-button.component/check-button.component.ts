import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-check-button',
  imports: [],
  templateUrl: './check-button.component.html',
  styleUrl: './check-button.component.css',
})
export class CheckButtonComponent {
  @Input() estilo = '';
  @Input() texto = '';
  @Input() deshabilitado = false;
  @Output() accion = new EventEmitter<void>();

  onClick() {
    this.accion.emit();
  }
}
