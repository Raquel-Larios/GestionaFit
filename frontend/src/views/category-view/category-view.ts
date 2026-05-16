import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Categoria, CategoriaOrderOptions } from '../../assets/models/categoria.interface';
import { CategoryService } from '../../shared/data/categoryService.service';
import { CommonModule } from '@angular/common';
import { IconButtonComponent } from '../../shared/ui/icon-button/icon-button.component';
import { OrderOptionComponent } from '../../shared/ui/order-option.component/order-option.component';
import { faPlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FormField } from '../../assets/models/form-field.interface';
import { ModalService } from '../../shared/data/modalService.service';
import { ModalConfig } from '../../assets/models/modal-config.interface';
import { PrimeraLetraPipe } from '../../shared/utils/pipes/primeraLetraPipe';
import { catchError, EMPTY, from, of, switchMap, tap, throwError } from 'rxjs';
import { ItemLinkerComponent } from "../../shared/ui/item-linker.component/item-linker.component";
import { Ejercicio } from '../../assets/models/ejercicio.interface';
import { ExerciseService } from '../../shared/data/exerciseService.service';
import { LinkItem, ItemLinkConfig, ItemLinkEvent, LinkOption } from '../../assets/models/item-linker.interface';
import { mostrarMensajeTemporal } from '../../assets/scripts/pop-up';

@Component({
  selector: 'app-category-view',
  imports: [
    FontAwesomeModule,
    CommonModule,
    IconButtonComponent,
    OrderOptionComponent,
    PrimeraLetraPipe,
    ItemLinkerComponent
  ],
  templateUrl: './category-view.html',
  styleUrl: './category-view.css',
})
export class CategoryView implements OnInit {
  selectedCategoryId: number | null = null;
  categoriaOrderOptions = CategoriaOrderOptions;
  listaCategorias: Categoria[] = [];
  categoriaFields: FormField[] = [
    {
      name: 'nombre_categoria',
      type: 'text',
      label: 'Nombre de la categoría',
      validators: { required: true },
    },
  ];
  listaEjercicios: Ejercicio[] = [];
  assignedItems: LinkItem[] = [];
  iconoAdd = faPlus;
  iconoModify = faEdit;
  iconoDelete = faTrash;

  linkerConfig: ItemLinkConfig = {
    listaItems: [],
    multipleLinkChoice: false,
    listaLinkChoices: ['Ejercicio'],
    assignedItems: [],
    selectionService: {
      assign: (data) => this.categoryService.crearAsignacionCategoria_Ejercicio(data).pipe(
              switchMap(res => from([res])),
              catchError(err => {
                if (err.status === 409 || err.error?.statusCode === 409) {
                  return from([window.confirm(err.error?.message)]).pipe(
                    switchMap(confirmado => {
                      if (confirmado) {
                        return this.exerciseService.crearAsignacionEjercicio_Categoria({
                          ...data,
                          forceReplace: true
                        });
                      } else {
                        return EMPTY;
                      }
                    })
                  );
                }
                return throwError(() => err);
              })
              ),
      unassign: (data) => this.categoryService.eliminarAsignacionCategoria_Ejercicio(data)
    },
    parentType: 'Categoría'
  }

  constructor(
    private categoryService: CategoryService,
    private exerciseService: ExerciseService,
    private cd: ChangeDetectorRef,
    private modalService: ModalService,
  ) {}

  ngOnInit() {
    this.categoryService.getCategorias().subscribe({
      next: (datos) => {
        this.listaCategorias = datos.filter((cat: Categoria) => cat.id !== 0);
        this.cd.detectChanges();
      },
      error: (err) => {
        mostrarMensajeTemporal(err.error?.message, 2000);
      },
    });
    this.exerciseService.getEjercicios(false).subscribe({
      next: (datos) => {
        this.listaEjercicios = datos;
        this.linkerConfig = { ...this.linkerConfig, listaItems: this.listaEjercicios.map((item: any) => ({ id: item.id, nombre: item.nombre_ejercicio }))};
        this.cd.detectChanges();
      },
      error: (err) => {
        mostrarMensajeTemporal(err.error?.message, 2000);
      },
    });
  }

  onItemsReversed(reversed: Categoria[]) {
    this.listaCategorias = reversed;
  }

  onLoadForId(event: { id: number; choice?: LinkOption | null}) {
    this.onCategorySelected(event.id);
  }

  onCategorySelected(id:number) {
    this.selectedCategoryId = id;
    this.categoryService.getAsignacionCategoria_EjercicioById(id).subscribe({
      next: (datos) => {
        this.assignedItems = datos.map((item: any) => ({ id: item.id, nombre: item.nombre_ejercicio }));
        this.linkerConfig = {
        ...this.linkerConfig,
        assignedItems: datos.map((item: any) => ({ id: item.id, nombre: item.nombre_ejercicio })), 
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
        this.onCategorySelected(event.data.id_categoria);
      },
      error: (err) => { 
        const mensaje = err.error?.message;
        mostrarMensajeTemporal(mensaje, 2000);
      }
    });
  }

  abrirModal(option: 'create' | 'edit', idSelected?: number): void {
    this.modalService.setDataFields(this.categoriaFields);
    this.modalService.setMessages(null, null);

    const categoria$ =
      option === 'edit' && idSelected
        ? this.categoryService.getCategoriaById(idSelected)
        : of(null);

    categoria$
      .pipe(
        switchMap((categoria) => {
          const config: ModalConfig = {
            action: option,
            service: {
              create:
                option === 'create'
                  ? (data) => this.categoryService.crearCategoria(data).pipe(
                              tap(res => mostrarMensajeTemporal(res.message, 2000)))
                  : () => EMPTY,
              update:
                option === 'edit' && idSelected
                  ? (data) => this.categoryService.actualizarCategoria(data).pipe(
                              tap(res => mostrarMensajeTemporal(res.message, 2000)))
                  : () => EMPTY,
            },
            id: idSelected,
            data: categoria,
          };
          this.modalService.openModal(config);

          return this.modalService.isOpen$;
        }),
      )
      .subscribe((isOpen) => {
        if (!isOpen) {
          this.refrescarCategorias();
        }
      });
  }

  deleteCategoria(id: number): void {
    this.categoryService.borrarCategoria(id).subscribe({
      next: (res) => {
        const mensaje = res.message;
        mostrarMensajeTemporal(mensaje, 2000);
        this.refrescarCategorias();
        setTimeout(() => this.cd.detectChanges());
      },
      error: (err) => {
        const mensaje = err.error?.message;
        mostrarMensajeTemporal(mensaje, 2000);
      },
    });
  }

  refrescarCategorias(): void {
    this.categoryService.getCategorias().subscribe((data) => {
      this.listaCategorias = [...data];
      this.cd.detectChanges();
    });
  }
}
