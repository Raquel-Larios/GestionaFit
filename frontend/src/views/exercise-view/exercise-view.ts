import { ChangeDetectorRef, Component, OnInit } from '@angular/core';  
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Ejercicio, EjercicioOrderOptions } from '../../assets/models/ejercicio.interface';
import { ExerciseService } from '../../shared/data/exerciseService.service';
import { CommonModule } from '@angular/common';
import { IconButtonComponent } from "../../shared/ui/icon-button/icon-button.component";
import { OrderOptionComponent } from '../../shared/ui/order-option.component/order-option.component';
import { faPlus, faEdit, faTrash} from "@fortawesome/free-solid-svg-icons";
import { FormField } from '../../assets/models/form-field.interface';
import { ModalService } from '../../shared/data/modalService.service';
import { ModalConfig } from '../../assets/models/modal-config.interface';
import { PrimeraLetraPipe } from '../../shared/utils/pipes/primeraLetraPipe';
import { Categoria } from '../../assets/models/categoria.interface';
import { CategoryService } from '../../shared/data/categoryService.service';
import { EMPTY, of, switchMap } from 'rxjs';
import { ItemLinkConfig, ItemLinkEvent, LinkItem, LinkOption } from '../../assets/models/item-linker.interface';
import { Video } from '../../assets/models/video.interface';
import { VideoService } from '../../shared/data/videoService.service';
import { ItemLinkerComponent } from '../../shared/ui/item-linker.component/item-linker.component';

@Component({
  selector: 'app-exercise-view',
  imports: [FontAwesomeModule, CommonModule, IconButtonComponent, OrderOptionComponent, PrimeraLetraPipe, ItemLinkerComponent],
  templateUrl: './exercise-view.html',
  styleUrl: './exercise-view.css',
})

export class ExerciseView implements OnInit{
  selectedExerciseId: number | null = null;
  orderOptionSelected: string = 'Nombre';
  ejercicioOrderOptions = EjercicioOrderOptions;
  listaCategorias: Categoria[] = [];
  listaVideos: Video[] = [];
  categoriasMap: Map<number, string> = new Map();
  listaEjercicios: (Ejercicio & { nombre_categoria?: string })[] = [];
  assignedItems: LinkItem[] = [];
  ejercicioFields: FormField[] = [
    { name: 'nombre_ejercicio', type: 'text', label: "Nombre del ejercicio", validators:{required: true}}]
  iconoAdd = faPlus;
  iconoModify = faEdit;
  iconoDelete = faTrash;

  linkerConfig: ItemLinkConfig = {
    listaItems: [],
    multipleLinkChoice: true,
    listaLinkChoices: ['Categoría', 'Vídeo'],
    assignedItems: [],
    selectionService: {
      assign: (data, choice) => choice === 'Categoría' 
      ? this.exerciseService.crearAsignacionEjercicio_Categoria(data) 
      : this.exerciseService.crearAsignacionEjercicio_Video(data),
      unassign: (data, choice) => choice === 'Categoría'
      ? this.exerciseService.eliminarAsignacionEjercicio_Categoria(data)
      : this.exerciseService.eliminarAsignacionEjercicio_Video(data)
    }
  }

  constructor(private exerciseService: ExerciseService, private cd: ChangeDetectorRef, private modalService: ModalService, private categoryService: CategoryService, private videoService: VideoService){}

  ngOnInit(){
    if (this.orderOptionSelected === 'Nombre') {
      this.exerciseService.getEjerciciosNombre().subscribe({
        next: (datos) => {
          this.listaEjercicios = datos;
          this.cd.detectChanges();
        },
        error: (err) => {
          console.error('Error al obtener los ejercicios.', err);
        },
      });
    } else if (this.orderOptionSelected === 'Categoría') {
      this.exerciseService.getEjerciciosByCategoria().subscribe({
        next: (datos) => {
          this.listaEjercicios = datos;
          this.cd.detectChanges();
        },
        error: (err) => {
          console.error('Error al obtener los ejercicios.', err);
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
          label: "Añadir a categoría (opcional)", 
          options: datos.map((cat: Categoria) => ({
            value: cat.id,
            label: cat.nombre_categoria
          })),
          validators: { required: false }
        }
      ];
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Error al obtener las categorias.', err);
      }
    });

    this.videoService.getVideosNombre().subscribe({
      next: (datos) => {
        this.listaVideos = datos;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Error al obtener los vídeos.', err);
      }
    })
  }

  crearMapaCategorias(){
      if (this.listaCategorias && this.listaCategorias.length > 0) {
      this.categoriasMap = new Map(
      this.listaCategorias.map(cat => [cat.id, cat.nombre_categoria])
      );
    }
  }

  onItemsReversed(reversed: Ejercicio[]){
    this.listaEjercicios = reversed;
  }

  onLoadForId(event: { id: number; choice?: LinkOption | null}) {
    if (event.choice) {
      this.onExerciseSelected(event.id, event.choice);
    }
    else{
      console.log("No se ha podido cargar los datos de asignaciones relacionados con el ejercicio.")
    }
  }

  onExerciseSelected(id:number, choice: LinkOption) {
      this.selectedExerciseId = id;

      if(choice === this.linkerConfig.listaLinkChoices[0]){
        this.exerciseService.getAsignacionEjercicio_CategoriaById(id).subscribe({
          next: (datos) => {
            this.assignedItems = datos.map((item: any) => ({ id: item.id, nombre: item.nombre_categoria }));
            this.linkerConfig = {
            ...this.linkerConfig, listaItems: this.listaCategorias.map((item: any) => ({ id: item.id, nombre: item.nombre_categoria})),
            assignedItems: datos.map((item: any) => ({ id: item.id, nombre: item.nombre_categoria })), 
            };
            this.cd.detectChanges();
          },
          error: (err) => { 
            const mensaje = err.error?.message;
            console.log(mensaje);
            const isDefault = err.error?.code === 'DEFAULT_ERROR'; 
          }
        });
      }
      else if(choice === this.linkerConfig.listaLinkChoices[1]){
        this.exerciseService.getAsignacionEjercicio_VideoById(id).subscribe({
          next: (datos) => {
            this.assignedItems = datos.map((item: any) => ({ id: item.id_video, nombre: item.nombre_video }));
            this.linkerConfig = {
            ...this.linkerConfig, listaItems: this.listaVideos.map((item: any) => ({ id: item.id, nombre: item.nombre_video})),
            assignedItems: datos.map((item: any) => ({ id: item.id_video, nombre: item.nombre_video })), 
            };
            this.cd.detectChanges();
          },
          error: (err) => { 
            const mensaje = err.error?.message;
            console.log(mensaje);
            const isDefault = err.error?.code === 'DEFAULT_ERROR'; 
          }
        });
      }
    }
  
    onLinkAction(event: ItemLinkEvent) {
      const service = event.action === 'asignar' ? 
        this.linkerConfig.selectionService.assign : 
        this.linkerConfig.selectionService.unassign;
      
      service(event.data, event.choice).subscribe({
        next: () => {
          this.onExerciseSelected(event.data.id_ejercicio, event.choice); 
        },
        error: (err) => { 
          const mensaje = err.error?.message;
          console.log(mensaje);
          const isDefault = err.error?.code === 'DEFAULT_ERROR';
        }
      });
    }

  abrirModal(option: 'create' | 'edit', idSelected?: number): void {

    this.modalService.setDataFields(this.ejercicioFields);
    this.modalService.setMessages(null, null);

    const ejercicio$ =
          option === 'edit' && idSelected ? this.exerciseService.getEjercicioById(idSelected) : of(null);
    
    ejercicio$.pipe(
            switchMap((ejercicio) => {
              const config: ModalConfig = {
                action: option,
                service: {
                  create:
                    option === 'create'
                      ? (data) => this.exerciseService.crearEjercicio(data)
                      : () => EMPTY,
                  update:
                    option === 'edit' && idSelected
                      ? (data) => this.exerciseService.actualizarEjercicio(data)
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

  deleteEjercicio(id: number): void{
    this.exerciseService.borrarEjercicio(id).subscribe({
      next: (res) => {
        const mensaje = res.message;
        console.log(mensaje)
        this.refrescarEjercicios();
        setTimeout(() => this.cd.detectChanges());
      },
      error: (err) => {
        const mensaje = err.error?.message;
        console.log(mensaje)
        const isDefault = err.error?.code === 'DEFAULT_ERROR';
      }
    })
  }

  onOrderSelected(order: string) {
    this.orderOptionSelected = order;
    this.refrescarEjercicios();
  }

  //Para que se vean los nombres de las categorías bien al ordenar los ejercicios por categoría

  onCategoriaSelected(id:number | undefined): String{

    if(id === undefined || id === null){
      return "Sin asignar"
    }

    const nombre_grupo = this.categoriasMap.get(id);

    return nombre_grupo ? `${nombre_grupo}` : "Categoría desconocida";
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
