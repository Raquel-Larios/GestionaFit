import { Component, Input } from '@angular/core';
import { MenuDinamico} from '../../../shared/ui/menu-dinamico/menu-dinamico';
import { AuthService } from '../../../shared/data/authService.service';

@Component({
  selector: 'app-header',
  imports: [/*MenuDinamico*/],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
@Input() logoUrl: string = "";
showMenu = false;
userPhoto: string | null = null;

constructor(private authService: AuthService){}

ngOnInit(){
  if(!window.location.pathname.includes('welcome') && !window.location.pathname.includes('login')){
    this.authService.isLoggedIn$.subscribe(loggedIn => {
    this.showMenu = loggedIn;
    if (loggedIn) {
      const token = localStorage.getItem('token');
      if(token && !!this.authService.isTokenExpired){
        const decoded = this.authService.decodeToken(token);
        this.userPhoto = decoded.foto_perfil;
      }
    }
  });
  }
  
}
}
