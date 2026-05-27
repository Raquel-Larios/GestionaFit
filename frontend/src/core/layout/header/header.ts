import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { MenuDinamico} from '../../../shared/ui/menu-dinamico/menu-dinamico';
import { MenuUsuarioComponent } from '../../../shared/ui/menu-usuario.component/menu-usuario.component';
import { AuthService } from '../../../shared/data/authService.service';
import { UserService } from '../../../shared/data/userService.service';
import { Subscription, filter, takeUntil, Subject } from 'rxjs';
import { generateInitialUserPhoto } from '../../../assets/scripts/userPhotoGenerator';


@Component({
  selector: 'app-header',
  imports: [MenuDinamico, CommonModule, MenuUsuarioComponent],
  templateUrl: './header.html',
  styleUrl: './header.css',
})

export class Header implements OnInit{
@Input() logoUrl: string = "";
showMenu = false;
userPhoto: string | null = null;
userRol: number | null = null;
userFullName: string | null = null;
userId: number = -1;
private subscriptions: Subscription[] = [];
private isInitialized = false;

constructor(private authService: AuthService, private userService: UserService, private cdRef: ChangeDetectorRef, private router: Router){}

  ngOnInit(){
    this.showMenu= false;

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(new Subject<void>())
    ).subscribe(() => {
      this.initializeMenuSubscriptions();
    });

    this.initializeMenuSubscriptions();
  }

  private initializeMenuSubscriptions() {
    const isAuthPage = window.location.pathname.includes('welcome') || window.location.pathname.includes('auth');

    if(!isAuthPage && !this.isInitialized){
      this.isInitialized = true;

      const rolSub = this.userService.userRol$.subscribe(rol => {
        this.userRol = rol;
        this.showMenu = rol !== null;
        this.cdRef.markForCheck();
      });
      
      const userSub = this.authService.currentUser$.subscribe(user => {
        if (user) {
          this.userFullName = user.username;
          this.userId = user.id;
          const fotoBD = user.foto_perfil;

          if (user.foto_perfil && user.foto_perfil.trim() !== '') {
            if (fotoBD.startsWith('http') || fotoBD.startsWith('/')) {
              this.userPhoto = `${fotoBD}?t=${Date.now()}`;
            } 
            else {
              //Añadir prefijo si viene el base64 crudo
              if (!fotoBD.startsWith('data:image')) {
                this.userPhoto = `data:image/png;base64,${fotoBD}`;
              } 
              //En el caso poco probable de que ya tenga el prefijo
              else {
                this.userPhoto = fotoBD;
              }
            }
          }
          else if (this.userFullName) {
            //Se borra la foto o está metido a piñón
            this.userPhoto = generateInitialUserPhoto(this.userFullName);
            this.userService.actualizarFotoPerfil(user.id, this.userPhoto).subscribe();
          } else {
            this.userPhoto = null;
          }
          
        } else {
          this.userRol = null;
          this.showMenu = false;
        }
        this.cdRef.markForCheck();
      });

      this.subscriptions.push(rolSub, userSub);
    }

    else if (isAuthPage) {
      this.isInitialized = false;
      this.subscriptions.forEach(sub => sub.unsubscribe());
      this.subscriptions = [];
      this.showMenu = false;
      this.userPhoto = null;
      this.userRol = null;
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  cerrarSesion() {
  this.authService.logout();
  this.router.navigate(['/login']);
  }
}
