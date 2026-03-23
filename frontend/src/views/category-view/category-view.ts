import { ChangeDetectorRef, Component, OnInit } from '@angular/core';  
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Categoria, CategoriaOrderOptions } from '../../assets/models/categoria.interface';
import { CategoryService } from '../../shared/data/categoryService.service';
import { CommonModule } from '@angular/common';
import { IconButtonComponent } from "../../shared/ui/icon-button/icon-button.component";
import { OrderOptionComponent } from '../../shared/ui/order-option.component/order-option.component';
import { faPlus, faEdit, faTrash} from "@fortawesome/free-solid-svg-icons";
import { FormField } from '../../assets/models/form-field.interface';
import { ModalService } from '../../shared/data/modalService.service';
import { ModalConfig } from '../../assets/models/modal-config.interface';
import { PrimeraLetraPipe } from '../../shared/utils/primeraLetraPipe';

@Component({
  selector: 'app-category-view',
  imports: [FontAwesomeModule, CommonModule, IconButtonComponent, OrderOptionComponent, PrimeraLetraPipe],
  templateUrl: './category-view.html',
  styleUrl: './category-view.css',
})
export class CategoryView implements OnInit{

 categoriaOrderOptions = CategoriaOrderOptions;
 listaCategorias: Categoria[] = [];
 categoriaFields: FormField[] = [{
  name: 'nombre_categoria', type: 'text', label: "Nombre de la categoría", validators:{required: true}
 }]
 iconoAdd = faPlus;
 iconoModify = faEdit;
 iconoDelete = faTrash;

 constructor(private categoryService: CategoryService, private cd: ChangeDetectorRef, private modalService: ModalService){}

  ngOnInit(){
    this.categoryService.getCategorias().subscribe({
      next: (datos) => {
        this.listaCategorias = datos;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Error al obtener las categorias.', err);
      }
    });
  }

  onItemsReversed(reversed: Categoria[]){
    this.listaCategorias = reversed;
  }


  abrirModal(option: 'create' | 'edit', idSelected?: number): void {
    if (option === 'edit' && idSelected) {
      this.categoryService.getCategoriaById(idSelected).subscribe(categoria => {
        this.modalService.setDataFields(this.categoriaFields);
        this.modalService.setMessages(null, null);

        const config: ModalConfig = {
          action: option,
          service: {
            create: (data) => this.categoryService.crearCategoria(data),
            update: (data) => this.categoryService.actualizarCategoria(data),
          },
          id: idSelected,
          data: categoria 
        };
        this.modalService.openModal(config); 
      });

    } else {
      this.modalService.setDataFields(this.categoriaFields);
      const config: ModalConfig = {
          action: option,
          service: {
            create: (data) => this.categoryService.crearCategoria(data),
            update: (data) => this.categoryService.actualizarCategoria(data),
          },
          id: idSelected,
      };
      this.modalService.openModal(config);
    }


    this.modalService.isOpen$.subscribe(isOpen => {
      if (!isOpen) {
        this.refrescarCategorias();
      }
    });
  }

  deleteCategoria(id: number): void{
    this.categoryService.borrarCategoria(id).subscribe({
      next: (res) => {
        const mensaje = res.message;
        console.log(mensaje)
        this.refrescarCategorias();
        setTimeout(() => this.cd.detectChanges());
      },
      error: (err) => {
        const mensaje = err.error?.message;
        console.log(mensaje)
        const isDefault = err.error?.code === 'DEFAULT_ERROR';
      }
    })
  }

  refrescarCategorias(): void {
    this.categoryService.getCategorias().subscribe(data => {
      this.listaCategorias = [...data];
      this.cd.detectChanges();
  });
}
}
