import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav-button',
  imports: [],
  templateUrl: './nav-button.component.html',
  styleUrl: './nav-button.component.css',
})

export class NavButtonComponent {
  @Input() estilo = '';
  @Input() texto = '';
  @Input() ruta = '';

  constructor(private router: Router){}

  irARuta() {
    this.router.navigate([this.ruta])
  }
}
