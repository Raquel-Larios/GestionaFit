import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthView } from '../views/auth-view/auth-view';
import { Header } from '../core/layout/header/header';
import { Footer } from '../core/layout/footer/footer';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, /*AuthView, */Header, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App{
  protected readonly title = signal('gestionaFit');
  logoUrl = "assets/img/logo-gestionaFit.png";
}
