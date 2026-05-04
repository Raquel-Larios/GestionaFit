import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Material, MaterialOrderOptions } from '../../assets/models/material.interface';
import { MaterialService } from '../../shared/data/materialService.service';
import { CommonModule } from '@angular/common';
import { IconButtonComponent } from '../../shared/ui/icon-button/icon-button.component';
import { OrderOptionComponent } from '../../shared/ui/order-option.component/order-option.component';
import { faPlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FormField } from '../../assets/models/form-field.interface';
import { ModalService } from '../../shared/data/modalService.service';
import { ModalConfig } from '../../assets/models/modal-config.interface';
import { PrimeraLetraPipe } from '../../shared/utils/pipes/primeraLetraPipe';
import { EMPTY, of, switchMap, tap } from 'rxjs';
import { UserService } from '../../shared/data/userService.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ImgFallbackDirective } from "../../shared/utils/directives/imgFallback.directive";
import { LightboxComponent } from "../../shared/ui/lightbox.component/lightbox.component";
import { mostrarMensajeTemporal } from '../../assets/scripts/pop-up';


@Component({
  selector: 'app-material-view',
  imports: [FontAwesomeModule,
    CommonModule,
    IconButtonComponent,
    OrderOptionComponent,
    PrimeraLetraPipe, ImgFallbackDirective, LightboxComponent],
  templateUrl: './material-view.html',
  styleUrl: './material-view.css',
})
export class MaterialView implements OnInit {
  @ViewChild(LightboxComponent) lightbox!: LightboxComponent;
  isAdmin: boolean = false;
  materialOrderOptions = MaterialOrderOptions;
  orderOptionSelected: string = 'Antigüedad';
  listaMateriales: Material[] = [];
  materialFields: FormField[] = [
    {
      name: 'nombre_material',
      type: 'text',
      label: 'Nombre del material',
      validators: { required: true },
    },
    {
      name: 'contenido', type: 'link', label: 'Contenido (imagen)', validators: {required: true},
    }
  ];
  iconoAdd = faPlus;
  iconoModify = faEdit;
  iconoDelete = faTrash;

  constructor(
    private materialService: MaterialService,
    private cd: ChangeDetectorRef,
    private modalService: ModalService,
    private userService: UserService,
    private sanitizer: DomSanitizer
  ) {}

  get lightboxItems() {
    return this.listaMateriales.map(mat => ({
      src: mat.contenido,
      thumb: mat.contenido,
      title: mat.nombre_material,
      type: 'image' as const
    }));
  }

  ngOnInit() {
    this.isAdminUser()
    if (this.orderOptionSelected === 'Antigüedad') {
      this.materialService.getMateriales(false).subscribe({
        next: (datos) => {
          this.listaMateriales = datos;
          this.cd.detectChanges();
        },
        error: (err) => {
          mostrarMensajeTemporal(err.error?.message, 2000);
        },
      });
    } else if (this.orderOptionSelected === 'Nombre') {
      this.materialService.getMateriales(true).subscribe({
        next: (datos) => {
          this.listaMateriales = datos;
          this.cd.detectChanges();
        },
        error: (err) => {
          mostrarMensajeTemporal(err.error?.message, 2000);
        },
      });
    }
  }

  onItemsReversed(reversed: Material[]) {
    this.listaMateriales = reversed;
  }

  abrirModal(option: 'create' | 'edit', idSelected?: number): void {
    this.modalService.setDataFields(this.materialFields);
    this.modalService.setMessages(null, null);

    const material$ =
      option === 'edit' && idSelected
        ? this.materialService.getMaterialById(idSelected)
        : of(null);

    material$
      .pipe(
        switchMap((material) => {
          const config: ModalConfig = {
            action: option,
            service: {
              create:
                option === 'create'
                  ? (data) => this.materialService.crearMaterial(data).pipe(tap(res => mostrarMensajeTemporal(res.message, 2000)))
                  : () => EMPTY,
              update:
                option === 'edit' && idSelected
                  ? (data) => this.materialService.actualizarMaterial(data).pipe(tap(res => mostrarMensajeTemporal(res.message, 2000)))
                  : () => EMPTY,
            },
            id: idSelected,
            data: material,
          };
          this.modalService.openModal(config);

          return this.modalService.isOpen$;
        }),
      )
      .subscribe((isOpen) => {
        if (!isOpen) {
          this.refrescarMateriales();
        }
      });
  }

  deleteMaterial(id: number): void {
    this.materialService.borrarMaterial(id).subscribe({
      next: (res) => {
        const mensaje = res.message;
        mostrarMensajeTemporal(mensaje, 2000);
        this.refrescarMateriales();
        setTimeout(() => this.cd.detectChanges());
      },
      error: (err) => {
        const mensaje = err.error?.message;
        mostrarMensajeTemporal(mensaje, 2000);
      },
    });
  }

  refrescarMateriales(): void {
    if (this.orderOptionSelected === 'Antigüedad') {
      this.materialService.getMateriales(false).subscribe((data) => {
        this.listaMateriales = [...data];
        this.cd.detectChanges();
      });
    } else if (this.orderOptionSelected === 'Nombre') {
      this.materialService.getMateriales(true).subscribe((data) => {
        this.listaMateriales = [...data];
        this.cd.detectChanges();
      });
    }
  }

  onOrderSelected(order: string) {
    this.orderOptionSelected = order;
    this.refrescarMateriales();
  }

  abrirLightbox(src: string) {
    this.lightbox.open(src);
  }

  isAdminUser(){
    this.isAdmin = this.userService.currentUserRol === 1
  }

  trackByMaterial(material: any): number {
    return material.id;
  }

  getSafeUrl(contenido: string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(contenido);
  }
}
