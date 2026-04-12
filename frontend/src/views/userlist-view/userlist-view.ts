import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Usuario, UsuarioOrderOptions } from '../../assets/models/usuario.interface';
import { UserService } from '../../shared/data/userService.service';
import { CommonModule } from '@angular/common';
import { IconButtonComponent } from '../../shared/ui/icon-button/icon-button.component';
import { OrderOptionComponent } from '../../shared/ui/order-option.component/order-option.component';
import { faPlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FormField } from '../../assets/models/form-field.interface';
import { ModalService } from '../../shared/data/modalService.service';
import { ModalConfig } from '../../assets/models/modal-config.interface';
import { PrimeraLetraPipe } from '../../shared/utils/pipes/primeraLetraPipe';
import { generateInitialUserPhoto } from '../../assets/scripts/userPhotoGenerator';
import { concatMap } from 'rxjs/internal/operators/concatMap';
import { EMPTY, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-userlist-view',
  imports: [
    FontAwesomeModule,
    CommonModule,
    IconButtonComponent,
    OrderOptionComponent,
    PrimeraLetraPipe,
  ],
  templateUrl: './userlist-view.html',
  styleUrl: './userlist-view.css',
})
export class UserlistView implements OnInit {
  orderOptionSelected: string = 'Apellidos';
  clienteOrderOptions = UsuarioOrderOptions;
  listaClientes: Usuario[] = [];
  clienteFields: FormField[] = [
    { name: 'email', type: 'email', label: 'Correo electrónico', validators: { required: true } },
    { name: 'nombre', type: 'text', label: 'Nombre', validators: { required: true } },
    { name: 'apellidos', type: 'text', label: 'Apellidos', validators: { required: true } },
  ];
  iconoAdd = faPlus;
  iconoModify = faEdit;
  iconoDelete = faTrash;

  constructor(
    private userService: UserService,
    private cd: ChangeDetectorRef,
    private modalService: ModalService,
  ) {}

  ngOnInit() {
    if (this.orderOptionSelected === 'Apellidos') {
      this.userService.getClientesApellidos().subscribe({
        next: (datos) => {
          this.listaClientes = datos;
          this.cd.detectChanges();
        },
        error: (err) => {
          console.error('Error al obtener los clientes.', err);
        },
      });
    } else if (this.orderOptionSelected === 'Nombre') {
      this.userService.getClientesNombre().subscribe({
        next: (datos) => {
          this.listaClientes = datos;
          this.cd.detectChanges();
        },
        error: (err) => {
          console.error('Error al obtener los clientes.', err);
        },
      });
    }
  }

  onItemsReversed(reversed: Usuario[]) {
    this.listaClientes = reversed;
  }

  abrirModal(option: 'create' | 'edit', idSelected?: number): void {
    this.modalService.setDataFields(this.clienteFields);
    this.modalService.setMessages(null, null);

    const cliente$ =
      option === 'edit' && idSelected ? this.userService.getClienteById(idSelected) : of(null);

    cliente$
      .pipe(
        switchMap((cliente) => {
          const config: ModalConfig = {
            action: option,
            service: {
              create:
                option === 'create'
                  ? (data) =>
                      this.userService.crearCliente(data).pipe(
                        concatMap((clienteCreado) => {
                          const nuevoCliente = {
                            id: clienteCreado.data.insertId,
                            nombre: data.nombre,
                          };
                          const generatedPhoto = generateInitialUserPhoto(nuevoCliente.nombre);
                          return this.userService.actualizarFotoPerfil(
                            nuevoCliente.id,
                            generatedPhoto,
                          );
                        }),
                      )
                  : () => EMPTY,
              update:
                option === 'edit' && idSelected
                  ? (data) => this.userService.actualizarCliente(data)
                  : () => EMPTY,
            },
            id: idSelected,
            data: cliente,
          };
          this.modalService.openModal(config);

          return this.modalService.isOpen$;
        }),
      )
      .subscribe((isOpen) => {
        if (!isOpen) {
          this.refrescarClientes();
        }
      });
  }

  deleteCliente(id: number): void {
    this.userService.borrarCliente(id).subscribe({
      next: (res) => {
        const mensaje = res.message;
        console.log(mensaje);
        this.refrescarClientes();
        setTimeout(() => this.cd.detectChanges());
      },
      error: (err) => {
        const mensaje = err.error?.message;
        console.log(mensaje);
        const isDefault = err.error?.code === 'DEFAULT_ERROR';
      },
    });
  }

  refrescarClientes(): void {
    if (this.orderOptionSelected === 'Apellidos') {
      this.userService.getClientesApellidos().subscribe((data) => {
        this.listaClientes = [...data];
        this.cd.detectChanges();
      });
    } else if (this.orderOptionSelected === 'Nombre') {
      this.userService.getClientesNombre().subscribe((data) => {
        this.listaClientes = [...data];
        this.cd.detectChanges();
      });
    }
  }
}
