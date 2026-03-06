import { AfterViewInit, Component, ElementRef, Input} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, RouterLinkActive} from "@angular/router";

@Component({
  selector: 'app-menu-dinamico',
  imports: [CommonModule, RouterModule, RouterLinkActive],
  templateUrl: './menu-dinamico.html',
  styleUrl: './menu-dinamico.css',
})

export class MenuDinamico /*implements AfterViewInit*/{
@Input() userRol: number | null = null;
isOpen = false;
isHovered = false;

isAdmin(): boolean{
    return this.userRol === 1;
}

isUser(): boolean{
    return this.userRol === 0; //Separados de cara a extender
}

isGestionarActive(){
    return this.router.url.startsWith('/gestionar/');
}

toggleDropdown(){
    this.isOpen = !this.isOpen;
}

onMouseEnter(){
    this.isHovered = true;
}

onMouseLeave(){
    this.isHovered = false;
}

 
  constructor(private router: Router) {}
/* Reducir menú cuando la pantalla sea muy pequeña y no entre todo bien, en proceso

  ngAfterViewInit() {
    const nav = this.elementRef.nativeElement.querySelector('#gestionar-nav');
    const header = this.elementRef.nativeElement.closest('header');
    
    if (nav && header) {
      const toggle = document.createElement('div');
      toggle.className = 'menu-toggle';
      toggle.innerHTML = '☰';
      toggle.onclick = () => nav.classList.toggle('open');
      header.appendChild(toggle);
    }
  }*/
}
