import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FaIconComponent } from "@fortawesome/angular-fontawesome";

@Component({
  selector: 'app-icon-button',
  imports: [FaIconComponent],
  templateUrl: './icon-button.component.html',
  styleUrl: './icon-button.component.css',
})
export class IconButtonComponent {
  @Input() estilo = '';
  @Input() icon: any;
  @Input() deshabilitado = false;
  @Output() accion = new EventEmitter<void>();

  onClick() {
    this.accion.emit();
  }
}