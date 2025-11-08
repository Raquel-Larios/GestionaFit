import { Component, Input } from '@angular/core';
import { MenuDinamico} from '../../../shared/ui/menu-dinamico/menu-dinamico';

@Component({
  selector: 'app-header',
  imports: [/*MenuDinamico*/],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
@Input() logoUrl: string = "";
}
