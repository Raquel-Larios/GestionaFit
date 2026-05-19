import { ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { RutinaAdmin, RutinaAdminOrderOptions } from '../../assets/models/rutina-admin.interface';
import { RutinaAdminService } from '../../shared/data/rutina-adminService.service';
import { CommonModule } from '@angular/common';
import { IconButtonComponent } from '../../shared/ui/icon-button/icon-button.component';
import { OrderOptionComponent } from '../../shared/ui/order-option.component/order-option.component';
import { faPlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FormField } from '../../assets/models/form-field.interface';
import { ModalService } from '../../shared/data/modalService.service';
import { ModalConfig } from '../../assets/models/modal-config.interface';
import { PrimeraLetraPipe } from '../../shared/utils/pipes/primeraLetraPipe';
import { EMPTY, map, of, switchMap, tap } from 'rxjs';
import { ItemLinkerComponent } from "../../shared/ui/item-linker.component/item-linker.component";
import { UserService } from '../../shared/data/userService.service';
import { LinkItem, ItemLinkConfig, ItemLinkEvent, LinkOption } from '../../assets/models/item-linker.interface';
import { mostrarMensajeTemporal } from '../../assets/scripts/pop-up';
import { ExerciseService } from '../../shared/data/exerciseService.service';
import { LightboxComponent } from '../../shared/ui/lightbox.component/lightbox.component';
import { LightboxItem } from '../../assets/models/lightbox-item.interface';
import { Router } from '@angular/router';
import { Template } from '../../assets/models/template.interface';
import { TemplateService } from '../../shared/data/templateService.service';
import { ClienteOptionComponent } from '../../shared/ui/cliente-option.component/cliente-option.component';

@Component({
  selector: 'app-rutinas-clientes-view',
  imports: [
    FontAwesomeModule,
    CommonModule,
    IconButtonComponent,
    OrderOptionComponent,
    PrimeraLetraPipe,
    ItemLinkerComponent,
    LightboxComponent,
    ClienteOptionComponent
  ],
  templateUrl: './rutinas-clientes-view.html',
  styleUrl: './rutinas-clientes-view.css',
})
export class RutinasClientesView implements OnInit {

  selectedUsuarioId: number | null = null;
  orderOptionSelected: string = 'Nombre';
  rutinaOrderOptions = RutinaAdminOrderOptions;
  listaRutinas: RutinaAdmin[] = [];
  rutinaFields: FormField[] = [
    { name: 'nombre_plantilla',
      type: 'text',
      label: 'Nombre de la Rutina',
      visibility: {readonly: true}
    },
    {
      name: 'bloques',
      type: 'nested',
      label: 'Bloques',
      subFields: [
        {
          name: 'id_categoria',
          type: 'select',
          label: 'Categoría',
          validators: { required: true},
        },
        {
          name: 'variaciones',
          type: 'nested',
          label: 'Variaciones',
          subFields: [
            { name: 'id_ejercicio', type: 'select', label: 'Ejercicio', validators: { required: true } },
            { name: 'series', type: 'number', label: 'Series', value: 1 },
            { name: 'repeticiones', type: 'number', label: 'Repeticiones', value: 1 },
            { name: 'carga', type: 'number', label: 'Carga (kg)', value: 0 },
            { name: 'RPE', type: 'number', label: 'RPE', min: 1, max: 10, value: 1 }
          ]
        }
      ]
    },
  ];
  cliente: ({id_usuario: number, nombre: string}) = {id_usuario: 0, nombre: ""}; //Para que no chille
  listaPlantillas: Template[] = [];
  assignedItems: LinkItem[] = [];
  iconoAdd = faPlus;
  iconoModify = faEdit;
  iconoDelete = faTrash;
  dropdownOpen: { [key: string]: boolean } = {};
  @ViewChild(LightboxComponent) lightbox!: LightboxComponent;
  @ViewChild('dropdownMenu') dropdownMenuRef!: ElementRef;
  exerciseVideoItem: LightboxItem[] = [];
  hasVideo: boolean = false;

  linkerConfig: ItemLinkConfig = {
    listaItems: [],
    multipleLinkChoice: false,
    listaLinkChoices: ['Plantilla'],
    assignedItems: [],
    selectionService: {
      assign: (data) => this.rutinaAdminService.asignarRutina(data),
      unassign: (data) => {
                        return this.rutinaAdminService.getIdHistorial(data).pipe(
                          switchMap((datos: any) => {
                            let id_historial = datos[0].id; 
                            return this.rutinaAdminService.desasignarRutina(id_historial);
                          })
                        );
      }
    },
    parentType: 'Cliente'
  }

  constructor(
    private rutinaAdminService: RutinaAdminService,
    private templateService: TemplateService,
    private userService: UserService,
    private exerciseService: ExerciseService,
    private cd: ChangeDetectorRef,
    private modalService: ModalService,
    private router: Router
  ) {
    
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const clickedInside = (this.dropdownMenuRef && this.dropdownMenuRef.nativeElement.contains(event.target));
    if (!clickedInside) {
      Object.keys(this.dropdownOpen).forEach(key => {
        this.dropdownOpen[key] = false;
      });
    }
  }

  ngOnInit() {
    if(this.cliente.id_usuario === 0){
      this.userService.getClientes(false).subscribe({
      next: (data) => {
        this.cliente = {
          id_usuario: data[0].id,
          nombre: data[0].apellidos + ", " + data[0].nombre
        };
        this.cargarRutinas();
        this.selectedUsuarioId = this.cliente.id_usuario
      },
      error: (err) => {
        mostrarMensajeTemporal(err.error?.messagge);
      }
    });
    }

    this.templateService.getPlantillas(true).subscribe({
      next: (datos) => {
        this.listaPlantillas = this.toPlantillaFormat(datos);
        this.linkerConfig = { ...this.linkerConfig, listaItems: this.listaPlantillas.map((item: any) => ({ id: item.id_plantilla, nombre: item.nombre_plantilla}))};
        this.cd.detectChanges();
      },
      error: (err) => {
        mostrarMensajeTemporal(err.error?.message, 2000);
      },
    });
  }

  cargarRutinas(){
    if (this.orderOptionSelected === 'Nombre') {
      this.rutinaAdminService.getRutinas(this.cliente.id_usuario, false).subscribe({
        next: (datos) => {
          this.listaRutinas = this.toRutinaFormat(datos)
          this.cd.detectChanges();
        },
        error: (err) => {
          mostrarMensajeTemporal(err.error?.message, 2000);
        },
      });
    } else if (this.orderOptionSelected === 'Antigüedad') {
      this.rutinaAdminService.getRutinas(this.cliente.id_usuario, true).subscribe({
        next: (datos) => {
          this.listaRutinas = this.toRutinaFormat(datos)
          this.cd.detectChanges();
        },
        error: (err) => {
          mostrarMensajeTemporal(err.error?.message, 2000);
        },
      });
    }
  }

  onItemsReversed(reversed: RutinaAdmin[]) {
    this.listaRutinas = reversed;
  }

  onLoadForId(event: { id: number; choice?: LinkOption | null}) {
    this.onRutinaSelected(event.id);
  }

  onRutinaSelected(id:number) {
    this.selectedUsuarioId = id;
    this.rutinaAdminService.getRutinaByUsuarioId(this.selectedUsuarioId).subscribe({
      next: (datos) => {
        this.assignedItems = datos.map((item: any) => ({ id: item.id_plantilla, nombre: item.nombre_plantilla}));
        this.linkerConfig = {
        ...this.linkerConfig,
        assignedItems: datos.map((item: any) => ({ id: item.id_plantilla, nombre: item.nombre_plantilla})), 
        };
        this.cd.detectChanges();
      },
      error: (err) => { 
        const mensaje = err.error?.message;
        mostrarMensajeTemporal(mensaje, 2000)
      }
    });
  }

  onLinkAction(event: ItemLinkEvent) {
    const service = event.action === 'asignar' ? 
      this.linkerConfig.selectionService.assign : 
      this.linkerConfig.selectionService.unassign;
    
    service(event.data).subscribe({
      next: (res) => {
        mostrarMensajeTemporal(res.message, 2000);
        this.onRutinaSelected(event.data.id_usuario);
        this.refrescarRutinas();
      },
      error: (err) => { 
        const mensaje = err.error?.message;
        mostrarMensajeTemporal(mensaje, 2000);
      }
    });
  }

  abrirModal(option: 'create' | 'edit', idSelected?: number): void {
    this.modalService.setDataFields(this.rutinaFields);
    this.modalService.setMessages(null, null);

    const rutina$ =
      option === 'edit' && idSelected
        ? this.rutinaAdminService.getVariacionesById(idSelected)
        : of(null);

    rutina$
      .pipe(
        switchMap((rutina) => {
          const rutinaFormateada = rutina ? this.toRutinaFormat(rutina) : null;
          const config: ModalConfig = {
            action: option,
            service: {
              create:
                () => EMPTY,
              update:
                option === 'edit' && idSelected
                  ? (data) => this.rutinaAdminService.actualizarRutina(data).pipe(
                              tap(res => mostrarMensajeTemporal(res.message, 2000)))
                  : () => EMPTY,
            },
            id: idSelected,
            data: rutinaFormateada
          };
          this.modalService.openModal(config);

          return this.modalService.isOpen$;
        }),
      )
      .subscribe((isOpen) => {
        if (!isOpen) {
          this.refrescarRutinas();
        }
      });
  }

  deleteRutina(id: number): void {
    this.rutinaAdminService.desasignarRutina(id).subscribe({
      next: (res) => {
        const mensaje = res.message;
        mostrarMensajeTemporal(mensaje, 2000);
        this.refrescarRutinas();
        setTimeout(() => this.cd.detectChanges());
      },
      error: (err) => {
        const mensaje = err.error?.message;
        mostrarMensajeTemporal(mensaje, 2000);
      },
    });
  }

  onOrderSelected(order: string) {
    this.orderOptionSelected = order;
    this.refrescarRutinas();
  }

  refrescarRutinas(): void {
    this.rutinaAdminService.getRutinas(this.cliente.id_usuario, false).subscribe((data) => {
      this.listaRutinas = [...this.toRutinaFormat(data)];
      console.log("listaRutinas: ", this.listaRutinas)
      this.cd.detectChanges();
    });
  }

  toggleDropdown(id_historial: number, id_ejercicio: number, bloqueIndex: number) {
    const key = `${id_historial}-${id_ejercicio}-${bloqueIndex}`;
    Object.keys(this.dropdownOpen).forEach(key => {
      this.dropdownOpen[key] = false;
    });
    this.hasVideoValidation(id_ejercicio);
    this.dropdownOpen[key] = !this.dropdownOpen[key];
  }

  verVideo(id_historial: number, id_ejercicio: number, bloqueIndex: number) {
    const key = `${id_historial}-${id_ejercicio}-${bloqueIndex}`;
    this.lightbox.open(this.exerciseVideoItem[0].src)
    this.dropdownOpen[key] = false;
  }

  verMateriales(id_historial: number, id_ejercicio: number, bloqueIndex: number) {
    const key = `${id_historial}-${id_ejercicio}-${bloqueIndex}`;
    this.router.navigate(['/materiales'])
    this.dropdownOpen[key] = false;
  }

  hasVideoValidation(id: number){
    this.exerciseService.getAsignacionEjercicio_VideoById(id).subscribe({
      next: (data) => {
        this.exerciseVideoItem = [{
          src: data[0].enlace_video,
          thumb: data[0].enlace_video,
          title: data[0].nombre_video,
          type: 'video'
        }];
        this.hasVideo = true;
        this.cd.detectChanges();
      },
      error: () =>{
        this.hasVideo = false;
        this.cd.detectChanges();
      }
    }
    )
  }

  private toPlantillaFormat(data: any){

    if (Array.isArray(data)) {
      return data.map((item: any) => ({
        id_plantilla: item.result.id_plantilla,
        nombre_plantilla: item.result.nombre_plantilla,
        bloques: item.result.bloques
      }));
    }
  
    // Si data es un objeto único (caso de edición), envuélvelo en un array
    if (data) {
      return [{
        id_plantilla: data.id_plantilla,
        nombre_plantilla: data.nombre_plantilla,
        bloques: data.bloques
      }];
    }

  return [];
}

  private toRutinaFormat(data: any){

    if (Array.isArray(data)) {
      return data.map((item: any) => ({
        id_historial: item.result.id_historial,
        id_plantilla: item.result.id_plantilla,
        nombre_plantilla: item.result.nombre_plantilla,
        bloques: item.result.bloques
      }));
    }
  
    // Si data es un objeto único (caso de edición), envuélvelo en un array
    if (data) {
      return [{
        id_historial: data.id_historial,
        id_plantilla: data.id_plantilla,
        nombre_plantilla: data.nombre_plantilla,
        bloques: data.bloques
      }];
    }

  return [];
}
}
