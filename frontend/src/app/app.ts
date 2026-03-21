import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '../core/layout/header/header';
import { Footer } from '../core/layout/footer/footer';
import { CommonModule } from '@angular/common';
import { ModalComponent } from "../shared/ui/modal.component/modal.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, CommonModule, ModalComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App{
  protected readonly title = signal('gestionaFit');
  logoUrl = "assets/img/logo-gestionaFit.png";
}
