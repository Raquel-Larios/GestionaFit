import { Component } from '@angular/core';
import { IconButtonComponent } from '../../shared/ui/icon-button/icon-button.component';
import { RouterModule, RouterLinkActive} from "@angular/router";
import { faUserEdit, faClipboardUser, faImage, faVideo, faChartPie, faTags, faDumbbell, faClipboardList } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-home-view',
  imports: [IconButtonComponent, RouterModule, RouterLinkActive],
  templateUrl: './home-view.html',
  styleUrl: './home-view.css',
})
export class HomeView {
  iconoUser = faUserEdit;
  iconoCategoria = faTags;
  iconoEjercicio = faDumbbell;
  iconoPlantilla = faClipboardList;
  iconoRutinasClientes = faClipboardUser;
  iconoEstadisticas = faChartPie;
  iconoMateriales = faImage;
  iconoVideos = faVideo;

  constructor(){}

}
