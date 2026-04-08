import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Input, Output} from '@angular/core';
import { CheckButtonComponent } from '../check-button.component/check-button.component';
import { ModalService } from '../../data/modalService.service';
import { UserService } from '../../data/userService.service';
import { FormField } from '../../../assets/models/form-field.interface';
import { EMPTY, switchMap } from 'rxjs';
import { ModalConfig } from '../../../assets/models/modal-config.interface';


@Component({
  selector: 'app-menu-usuario',
  imports: [CommonModule, CheckButtonComponent],
  templateUrl: './menu-usuario.component.html',
  styleUrl: './menu-usuario.component.css',
})

export class MenuUsuarioComponent {
  @Input() userFullName: string | null = null;
  @Input() userId: number = -1;
  @Input() userPhoto: string | null = null;
  @Output() logout = new EventEmitter<void>();
  menuDesplegado = false;
  perfilFields: FormField[] = [
    { name: 'email', type: 'email', label: 'Correo electrónico', validators: { required: true } },
    { name: 'contraseña', type : 'password', label: 'Nueva Contraseña', validators: { required: false, pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)\S{8,}$", minlength: 8}, },
    { name: 'nombre', type: 'text', label: 'Nombre', validators: { required: true } },
    { name: 'apellidos', type: 'text', label: 'Apellidos', validators: { required: true } },
    { name: 'peso', type: 'number', label: 'Peso (en Kg)', min: 0, max: 999, step: 0.01, validators: { required: false}},
    { name: 'foto_perfil', type: 'text', label: 'Foto de Perfil', validators: { required: false}},
  ]

  constructor(private elementRef: ElementRef, private cd: ChangeDetectorRef, private modalService: ModalService, private userService: UserService) {}

  ngAfterViewInit() {
    this.updateNombreAncho();
  }

  ngOnChanges() {
    this.cd.detectChanges();
    this.updateNombreAncho();
  }

  private updateNombreAncho() {
    setTimeout(() => {
      const nombreElement = this.elementRef.nativeElement.querySelector('.user-name');
      if (nombreElement) {
        const ancho = nombreElement.offsetWidth + 'px';
        this.elementRef.nativeElement.style.setProperty('--nombre-ancho', ancho);
      }
    }, 0);
  }

  toggleMenu(event: Event) {
    event.stopPropagation();
    this.menuDesplegado = !this.menuDesplegado;
  }

  @HostListener('document:click')
  onClickOutside() {
    if (this.menuDesplegado) {
      this.menuDesplegado = false;
    }
  }

  cerrarSesion() {
    this.logout.emit();
  }

  abrirModal(option: 'edit', idSelected: number): void {
    if(idSelected !== -1){
      this.modalService.setDataFields(this.perfilFields);
      this.modalService.setMessages(null, null);
  
      const perfil$ = this.userService.getUserById(idSelected)
  
      perfil$
        .pipe(
          switchMap((perfil) => {
            const config: ModalConfig = {
              action: option,
              service: {
                create: () => EMPTY,
                update:
                  option === 'edit'
                    ? (data) => this.userService.actualizarPerfil(data)
                    : () => EMPTY,
              },
              id: idSelected,
              data: perfil,
            };
              this.modalService.openModal(config);

            return this.modalService.isOpen$;
          })
        )
        .subscribe();
    }
    else {
      console.log("No se encuentra el usuario.")
    }
  }

  onClick(){
    this.abrirModal('edit', this.userId);
  }
}
