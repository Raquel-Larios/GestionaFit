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

@Component({
  selector: 'app-exercise-view',
  imports: [FontAwesomeModule, CommonModule, IconButtonComponent, OrderOptionComponent, PrimeraLetraPipe],
  templateUrl: './exercise-view.html',
  styleUrl: './exercise-view.css',
})
export class ExerciseView implements OnInit{
  ejercicioOrderOptions = EjercicioOrderOptions;
  listaCategorias: Categoria[] = [];
  listaEjercicios: Ejercicio[] = [];
  ejercicioFields: FormField[] = [
    { name: 'nombre_ejercicio', type: 'text', label: "Nombre del ejercicio", validators:{required: true}}]
  iconoAdd = faPlus;
  iconoModify = faEdit;
  iconoDelete = faTrash;

  constructor(private exerciseService: ExerciseService, private cd: ChangeDetectorRef, private modalService: ModalService, private categoryService: CategoryService){}

  ngOnInit(){
    this.exerciseService.getEjercicios().subscribe({
      next: (datos) => {
        this.listaEjercicios = datos;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Error al obtener los ejercicios.', err);
      }
    });

    this.categoryService.getCategorias().subscribe({
      next: (datos) => {
        this.listaCategorias = datos;
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
  }

  onItemsReversed(reversed: Ejercicio[]){
    this.listaEjercicios = reversed;
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

  refrescarEjercicios(): void {
    this.exerciseService.getEjercicios().subscribe(data => {
      this.listaEjercicios = [...data];
      this.cd.detectChanges();
  });
}
}
