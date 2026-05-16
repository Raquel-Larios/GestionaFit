import { ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Template, TemplateOrderOptions } from '../../assets/models/template.interface';
import { TemplateService } from '../../shared/data/templateService.service';
import { CommonModule } from '@angular/common';
import { IconButtonComponent } from '../../shared/ui/icon-button/icon-button.component';
import { OrderOptionComponent } from '../../shared/ui/order-option.component/order-option.component';
import { faPlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FormField } from '../../assets/models/form-field.interface';
import { ModalService } from '../../shared/data/modalService.service';
import { ModalConfig } from '../../assets/models/modal-config.interface';
import { PrimeraLetraPipe } from '../../shared/utils/pipes/primeraLetraPipe';
import { EMPTY, of, switchMap, tap } from 'rxjs';
import { ItemLinkerComponent } from "../../shared/ui/item-linker.component/item-linker.component";
import { Usuario } from '../../assets/models/usuario.interface';
import { UserService } from '../../shared/data/userService.service';
import { LinkItem, ItemLinkConfig, ItemLinkEvent, LinkOption } from '../../assets/models/item-linker.interface';
import { mostrarMensajeTemporal } from '../../assets/scripts/pop-up';
import { RutinaAdminService } from '../../shared/data/rutina-admin.service';
import { ExerciseService } from '../../shared/data/exerciseService.service';
import { LightboxComponent } from '../../shared/ui/lightbox.component/lightbox.component';
import { LightboxItem } from '../../assets/models/lightbox-item.interface';
import { Router } from '@angular/router';

@Component({
  selector: 'app-template-view',
  imports: [
    FontAwesomeModule,
    CommonModule,
    IconButtonComponent,
    OrderOptionComponent,
    PrimeraLetraPipe,
    ItemLinkerComponent,
    LightboxComponent
],
  templateUrl: './template-view.html',
  styleUrl: './template-view.css',
})
export class TemplateView implements OnInit {
  selectedTemplateId: number | null = null;
  orderOptionSelected: string = 'Nombre';
  plantillaOrderOptions = TemplateOrderOptions;
  listaPlantillas: (Template)[] = [];
  plantillaFields: FormField[] = [
    {
      name: 'nombre_plantilla',
      type: 'text',
      label: 'Nombre de la plantilla',
      validators: { required: true },
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
          name: 'defectos',
          type: 'nested',
          label: 'Defectos',
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
  listaUsuarios: Usuario[] = [];
  assignedItems: LinkItem[] = [];
  iconoAdd = faPlus;
  iconoModify = faEdit;
  iconoDelete = faTrash;
  dropdownOpen: { [key: number]: boolean } = {};
  @ViewChild(LightboxComponent) lightbox!: LightboxComponent;
  @ViewChild('dropdownMenu') dropdownMenuRef!: ElementRef;
  exerciseVideoItem: LightboxItem[] = [];
  hasVideo: boolean = false;

  linkerConfig: ItemLinkConfig = {
    listaItems: [],
    multipleLinkChoice: false,
    listaLinkChoices: ['Cliente'],
    assignedItems: [],
    selectionService: {
      assign: (data) => this.rutinaAdminService.asignarRutina(data),
      unassign: (data) => this.rutinaAdminService.desasignarRutina(data)
    },
    parentType: 'Plantilla'
  }

  constructor(
    private rutinaAdminService: RutinaAdminService,
    private templateService: TemplateService,
    private userService: UserService,
    private exerciseService: ExerciseService,
    private cd: ChangeDetectorRef,
    private modalService: ModalService,
    private router: Router
  ) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const clickedInside = (this.dropdownMenuRef && this.dropdownMenuRef.nativeElement.contains(event.target));
    if (!clickedInside) {
      Object.keys(this.dropdownOpen).forEach(key => {
        this.dropdownOpen[Number(key)] = false;
      });
    }
  }

  ngOnInit() {
    if (this.orderOptionSelected === 'Nombre') {
      this.templateService.getPlantillas(false).subscribe({
        next: (datos) => {
          this.listaPlantillas = this.toPlantillaFormat(datos)
          this.cd.detectChanges();
        },
        error: (err) => {
          mostrarMensajeTemporal(err.error?.message, 2000);
        },
      });
    } else if (this.orderOptionSelected === 'Antigüedad') {
      this.templateService.getPlantillas(true).subscribe({
        next: (datos) => {
          this.listaPlantillas = this.toPlantillaFormat(datos)
          this.cd.detectChanges();
        },
        error: (err) => {
          mostrarMensajeTemporal(err.error?.message, 2000);
        },
      });
    }

    this.userService.getClientes(true).subscribe({
      next: (datos) => {
        this.listaUsuarios = datos;
        this.linkerConfig = { ...this.linkerConfig, listaItems: this.listaUsuarios.map((item: any) => ({ id: item.id, nombre: item.nombre+" "+item.apellidos }))};
        this.cd.detectChanges();
      },
      error: (err) => {
        mostrarMensajeTemporal(err.error?.message, 2000);
      },
    });
  }

  onItemsReversed(reversed: Template[]) {
    this.listaPlantillas = reversed;
  }

  onLoadForId(event: { id: number; choice?: LinkOption | null}) {
    this.onTemplateSelected(event.id);
  }

  onTemplateSelected(id:number) {
    this.selectedTemplateId = id;
    this.rutinaAdminService.getRutinaByPlantillaId(id).subscribe({
      next: (datos) => {
        this.assignedItems = datos.map((item: any) => ({ id: item.id, nombre: item.nombre+" "+item.apellidos}));
        this.linkerConfig = {
        ...this.linkerConfig,
        assignedItems: datos.map((item: any) => ({ id: item.id, nombre: item.nombre+" "+item.apellidos})), 
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
        this.onTemplateSelected(event.data.id_plantilla);
      },
      error: (err) => { 
        const mensaje = err.error?.message;
        mostrarMensajeTemporal(mensaje, 2000);
      }
    });
  }

  abrirModal(option: 'create' | 'edit', idSelected?: number): void {
    this.modalService.setDataFields(this.plantillaFields);
    this.modalService.setMessages(null, null);

    const plantilla$ =
      option === 'edit' && idSelected
        ? this.templateService.getPlantillaById(idSelected)
        : of(null);

    plantilla$
      .pipe(
        switchMap((plantilla) => {
          const plantillaFormateada = plantilla ? this.toPlantillaFormat(plantilla) : null;
          const config: ModalConfig = {
            action: option,
            service: {
              create:
                option === 'create'
                  ? (data) => this.templateService.crearPlantilla(data).pipe(
                              tap(res => mostrarMensajeTemporal(res.message, 2000)))
                  : () => EMPTY,
              update:
                option === 'edit' && idSelected
                  ? (data) => this.templateService.actualizarPlantilla(data).pipe(
                              tap(res => mostrarMensajeTemporal(res.message, 2000)))
                  : () => EMPTY,
            },
            id: idSelected,
            data: plantillaFormateada,
          };
          this.modalService.openModal(config);

          return this.modalService.isOpen$;
        }),
      )
      .subscribe((isOpen) => {
        if (!isOpen) {
          this.refrescarPlantillas();
        }
      });
  }

  deletePlantilla(id: number): void {
    this.templateService.borrarPlantilla(id).subscribe({
      next: (res) => {
        const mensaje = res.message;
        mostrarMensajeTemporal(mensaje, 2000);
        this.refrescarPlantillas();
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
    this.refrescarPlantillas();
  }

  refrescarPlantillas(): void {
    this.templateService.getPlantillas(false).subscribe((data) => {
      this.listaPlantillas = [...this.toPlantillaFormat(data)];
      this.cd.detectChanges();
    });
  }

  toggleDropdown(id: number) {
    Object.keys(this.dropdownOpen).forEach(key => {
      this.dropdownOpen[Number(key)] = false;
    });
    this.hasVideoValidation(id);
    this.dropdownOpen[id] = !this.dropdownOpen[id];
  }

  verVideo(id: number) {
    this.lightbox.open(this.exerciseVideoItem[0].src)
    this.dropdownOpen[id] = false;
  }

  verMateriales(id: number) {
    this.router.navigate(['/materiales'])
    this.dropdownOpen[id] = false;
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
      error: (err) =>{
        this.hasVideo = false;
        console.log(err.message);
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
}

