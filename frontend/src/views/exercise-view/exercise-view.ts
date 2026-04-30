import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Ejercicio, EjercicioOrderOptions } from '../../assets/models/ejercicio.interface';
import { ExerciseService } from '../../shared/data/exerciseService.service';
import { CommonModule } from '@angular/common';
import { IconButtonComponent } from '../../shared/ui/icon-button/icon-button.component';
import { OrderOptionComponent } from '../../shared/ui/order-option.component/order-option.component';
import { faPlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FormField } from '../../assets/models/form-field.interface';
import { ModalService } from '../../shared/data/modalService.service';
import { ModalConfig } from '../../assets/models/modal-config.interface';
import { PrimeraLetraPipe } from '../../shared/utils/pipes/primeraLetraPipe';
import { Categoria } from '../../assets/models/categoria.interface';
import { CategoryService } from '../../shared/data/categoryService.service';
import { catchError, EMPTY, from, of, switchMap, tap, throwError } from 'rxjs';
import {
  ItemLinkConfig,
  ItemLinkEvent,
  LinkItem,
  LinkOption,
} from '../../assets/models/item-linker.interface';
import { Video } from '../../assets/models/video.interface';
import { VideoService } from '../../shared/data/videoService.service';
import { ItemLinkerComponent } from '../../shared/ui/item-linker.component/item-linker.component';
import { mostrarMensajeTemporal } from '../../assets/scripts/pop-up';

@Component({
  selector: 'app-exercise-view',
  imports: [
    FontAwesomeModule,
    CommonModule,
    IconButtonComponent,
    OrderOptionComponent,
    PrimeraLetraPipe,
    ItemLinkerComponent,
  ],
  templateUrl: './exercise-view.html',
  styleUrl: './exercise-view.css',
})
export class ExerciseView implements OnInit {
  selectedExerciseId: number | null = null;
  orderOptionSelected: string = 'Nombre';
  ejercicioOrderOptions = EjercicioOrderOptions;
  listaCategorias: Categoria[] = [];
  listaVideos: Video[] = [];
  categoriasMap: Map<number, string> = new Map();
  listaEjercicios: (Ejercicio & { nombre_categoria?: string })[] = [];
  assignedItems: LinkItem[] = [];
  ejercicioFields: FormField[] = [
    {
      name: 'nombre_ejercicio',
      type: 'text',
      label: 'Nombre del ejercicio',
      validators: { required: true },
    },
  ];
  iconoAdd = faPlus;
  iconoModify = faEdit;
  iconoDelete = faTrash;

  linkerConfig: ItemLinkConfig = {
    listaItems: [],
    multipleLinkChoice: true,
    listaLinkChoices: ['Categoría', 'Vídeo'],
    assignedItems: [],
    selectionService: {
      assign: (data, choice) => {
        if (choice === 'Vídeo') {
          return this.exerciseService.crearAsignacionEjercicio_Video(data).pipe(
            switchMap((res) => from([res])),
            catchError((err) => {
              if (err.status === 409 || err.error?.statusCode === 409) {
                return from([window.confirm(err.error?.message)]).pipe(
                  switchMap((confirmado) => {
                    if (confirmado) {
                      return this.exerciseService.crearAsignacionEjercicio_Video({
                        ...data,
                        forceReplace: true,
                      });
                    } else {
                      return EMPTY;
                    }
                  }),
                );
              }
              return throwError(() => err);
            }),
          )
        } else if(choice === 'Categoría'){
          return this.exerciseService.crearAsignacionEjercicio_Categoria(data).pipe(
            switchMap((res) => from([res])),
            catchError((err) => {
              if (err.status === 409 || err.error?.statusCode === 409) {
                return from([window.confirm(err.error?.message)]).pipe(
                  switchMap((confirmado) => {
                    if (confirmado) {
                      return this.exerciseService.crearAsignacionEjercicio_Categoria({
                        ...data,
                        forceReplace: true,
                      });
                    } else {
                      return EMPTY;
                    }
                  }),
                );
              }
              return throwError(() => err);
            }),
          );
        }
        return EMPTY;
      },
      unassign: (data, choice) => {
        if (choice === 'Categoría') {
          return this.exerciseService.eliminarAsignacionEjercicio_Categoria(data);
        } else {
          return this.exerciseService.eliminarAsignacionEjercicio_Video(data.id_ejercicio);
        }
      },
    },
    parentType: 'Ejercicio',
  };

  constructor(
    private exerciseService: ExerciseService,
    private cd: ChangeDetectorRef,
    private modalService: ModalService,
    private categoryService: CategoryService,
    private videoService: VideoService,
  ) {}

  ngOnInit() {
    if (this.orderOptionSelected === 'Nombre') {
      this.exerciseService.getEjerciciosNombre().subscribe({
        next: (datos) => {
          this.listaEjercicios = datos;
          this.cd.detectChanges();
        },
        error: (err) => {
          mostrarMensajeTemporal(err.error?.message, 2000);
        },
      });
    } else if (this.orderOptionSelected === 'Categoría') {
      this.exerciseService.getEjerciciosByCategoria().subscribe({
        next: (datos) => {
          this.listaEjercicios = datos;
          this.cd.detectChanges();
        },
        error: (err) => {
          mostrarMensajeTemporal(err.error?.message, 2000);
        },
      });
    }

    this.categoryService.getCategorias().subscribe({
      next: (datos) => {
        this.listaCategorias = datos;
        this.crearMapaCategorias();
        this.ejercicioFields = [
          ...this.ejercicioFields,
          {
            name: 'id_categoria',
            type: 'select',
            label: 'Añadir a categoría (opcional)',
            options: datos.map((cat: Categoria) => ({
              value: cat.id,
              label: cat.nombre_categoria,
            })),
            validators: { required: false },
          },
        ];
        this.cd.detectChanges();
      },
      error: (err) => {
        mostrarMensajeTemporal(err.error?.message, 2000);
      },
    });

    this.videoService.getVideosNombre().subscribe({
      next: (datos) => {
        this.listaVideos = datos;
        this.cd.detectChanges();
      },
      error: (err) => {
        mostrarMensajeTemporal(err.error?.message, 2000);
      },
    });
  }

  crearMapaCategorias() {
    if (this.listaCategorias && this.listaCategorias.length > 0) {
      this.categoriasMap = new Map(
        this.listaCategorias.map((cat) => [cat.id, cat.nombre_categoria]),
      );
    }
  }

  onItemsReversed(reversed: Ejercicio[]) {
    this.listaEjercicios = reversed;
  }

  onLoadForId(event: { id: number; choice?: LinkOption | null }) {
    if (event.choice) {
      this.onExerciseSelected(event.id, event.choice);
    } else {
      mostrarMensajeTemporal(
        'No se han podido cargar los datos de asignaciones relacionados con el ejercicio.',
        2000,
      );
    }
  }

  onExerciseSelected(id: number, choice: LinkOption) {
    this.selectedExerciseId = id;

    if (choice === this.linkerConfig.listaLinkChoices[0]) {
      this.exerciseService.getAsignacionEjercicio_CategoriaById(id).subscribe({
        next: (datos) => {
          this.assignedItems = datos.map((item: any) => ({
            id: item.id,
            nombre: item.nombre_categoria,
          }));
          this.linkerConfig = {
            ...this.linkerConfig,
            listaItems: this.listaCategorias.map((item: any) => ({
              id: item.id,
              nombre: item.nombre_categoria,
            })),
            assignedItems: datos.map((item: any) => ({
              id: item.id,
              nombre: item.nombre_categoria,
            })),
          };
          this.cd.detectChanges();
        },
        error: (err) => {
          const mensaje = err.error?.message;
          mostrarMensajeTemporal(mensaje, 2000);
          const isDefault = err.error?.code === 'DEFAULT_ERROR';
        },
      });
    } else if (choice === this.linkerConfig.listaLinkChoices[1]) {
      this.exerciseService.getAsignacionEjercicio_VideoById(id).subscribe({
        next: (datos) => {
          this.assignedItems = datos.map((item: any) => ({
            id: item.id_video,
            nombre: item.nombre_video,
          }));
          this.linkerConfig = {
            ...this.linkerConfig,
            listaItems: this.listaVideos.map((item: any) => ({
              id: item.id,
              nombre: item.nombre_video,
            })),
            assignedItems: datos.map((item: any) => ({
              id: item.id_video,
              nombre: item.nombre_video,
            })),
          };
          this.cd.detectChanges();
        },
        error: (err) => {
          const mensaje = err.error?.message;
          mostrarMensajeTemporal(mensaje, 2000);
          const isDefault = err.error?.code === 'DEFAULT_ERROR';
        },
      });
    }
  }

  onLinkAction(event: ItemLinkEvent) {
    const service =
      event.action === 'asignar'
        ? this.linkerConfig.selectionService.assign
        : this.linkerConfig.selectionService.unassign;

    service(event.data, event.choice).subscribe({
      next: (res) => {
        mostrarMensajeTemporal(res.message, 2000);
        this.onExerciseSelected(event.data.id_ejercicio, event.choice);
      },
      error: (err) => {
        const mensaje = err.error?.message;
        mostrarMensajeTemporal(mensaje, 2000);
        const isDefault = err.error?.code === 'DEFAULT_ERROR';
      },
    });
  }

  abrirModal(option: 'create' | 'edit', idSelected?: number): void {
    this.modalService.setDataFields(this.ejercicioFields);
    this.modalService.setMessages(null, null);

    const ejercicio$ =
      option === 'edit' && idSelected
        ? this.exerciseService.getEjercicioById(idSelected)
        : of(null);

    ejercicio$
      .pipe(
        switchMap((ejercicio) => {
          const config: ModalConfig = {
            action: option,
            service: {
              create:
                option === 'create'
                  ? (data) =>
                      this.exerciseService
                        .crearEjercicio(data)
                        .pipe(tap((res) => mostrarMensajeTemporal(res.message, 2000)))
                  : () => EMPTY,
              update:
                option === 'edit' && idSelected
                  ? (data) =>
                      this.exerciseService
                        .actualizarEjercicio(data)
                        .pipe(tap((res) => mostrarMensajeTemporal(res.message, 2000)))
                  : () => EMPTY,
            },
            id: idSelected,
            data: ejercicio,
          };
          this.modalService.openModal(config);

          return this.modalService.isOpen$;
        }),
      )
      .subscribe((isOpen) => {
        if (!isOpen) {
          this.refrescarEjercicios();
        }
      });
  }

  deleteEjercicio(id: number): void {
    this.exerciseService.borrarEjercicio(id).subscribe({
      next: (res) => {
        const mensaje = res.message;
        mostrarMensajeTemporal(mensaje, 2000);
        this.refrescarEjercicios();
        setTimeout(() => this.cd.detectChanges());
      },
      error: (err) => {
        const mensaje = err.error?.message;
        mostrarMensajeTemporal(mensaje, 2000);
        const isDefault = err.error?.code === 'DEFAULT_ERROR';
      },
    });
  }

  onOrderSelected(order: string) {
    this.orderOptionSelected = order;
    this.refrescarEjercicios();
  }

  //Para que se vean los nombres de las categorías bien al ordenar los ejercicios por categoría

  onCategoriaSelected(id: number | undefined): String {
    if (id === undefined || id === null) {
      return 'Sin asignar';
    }

    const nombre_grupo = this.categoriasMap.get(id);

    return nombre_grupo ? `${nombre_grupo}` : 'Categoría desconocida';
  }

  refrescarEjercicios(): void {
    if (this.orderOptionSelected === 'Nombre') {
      this.exerciseService.getEjerciciosNombre().subscribe((data) => {
        this.listaEjercicios = [...data];
        this.cd.detectChanges();
      });
    } else if (this.orderOptionSelected === 'Categoría') {
      this.exerciseService.getEjerciciosByCategoria().subscribe((data) => {
        this.listaEjercicios = [...data];
        this.cd.detectChanges();
      });
    }
  }
}
