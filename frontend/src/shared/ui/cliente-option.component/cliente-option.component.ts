import { ChangeDetectorRef, Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Usuario } from '../../../assets/models/usuario.interface';
import { UserService } from '../../data/userService.service';
import { mostrarMensajeTemporal } from '../../../assets/scripts/pop-up';

@Component({
  selector: 'app-cliente-option',
  imports: [CommonModule, FormsModule],
  templateUrl: './cliente-option.component.html',
  styleUrl: './cliente-option.component.css',
})
export class ClienteOptionComponent {
  @Output() clienteSelectedEvent = new EventEmitter<Usuario>();
  listaClientes: readonly Usuario[] = [];
  clienteSelected!: Usuario;

  constructor(private userService: UserService, private cd: ChangeDetectorRef){}

ngOnInit() {
  this.userService.getClientes(false).subscribe({
      next: (datos) => {
                this.listaClientes = datos.map((item: any) => ({id: item.id, nombre: item.apellidos+", "+item.nombre}));
                if (this.listaClientes.length > 0) {
                this.clienteSelected = this.listaClientes[0];
                }
                this.cd.detectChanges();
              },
              error: (err) => {
                mostrarMensajeTemporal(err.error?.message, 2000);
              },
    });
}

onClienteChange() {
  this.clienteSelectedEvent.emit(this.clienteSelected);
}
}
