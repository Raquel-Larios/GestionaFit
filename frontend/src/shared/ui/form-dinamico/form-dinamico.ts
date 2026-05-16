import { Component, Input, Output, EventEmitter, OnChanges, ChangeDetectorRef} from '@angular/core';
import { CommonModule, TitleCasePipe} from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray} from '@angular/forms';
import { FormField } from '../../../assets/models/form-field.interface';
import { CheckButtonComponent } from "../check-button.component/check-button.component";
import { NavButtonComponent } from "../nav-button.component/nav-button.component";
import { ModalService } from '../../data/modalService.service';
import { PrimeraLetraPipe } from '../../utils/pipes/primeraLetraPipe';
import { Categoria } from '../../../assets/models/categoria.interface';
import { Ejercicio } from '../../../assets/models/ejercicio.interface';
import { CategoryService } from '../../data/categoryService.service';
import { ExerciseService } from '../../data/exerciseService.service';
import { Defecto } from '../../../assets/models/template.interface';
import { merge, take } from 'rxjs';

@Component({
  selector: 'app-form-dinamico',
  imports: [CommonModule, ReactiveFormsModule, CheckButtonComponent, NavButtonComponent, PrimeraLetraPipe],
  templateUrl: './form-dinamico.html',
  styleUrl: './form-dinamico.css',
})

export class FormDinamico implements OnChanges{
  @Input() backBtnOpt: boolean = false;
  @Input() cancelBtnOpt: boolean = false;
  @Input() btnStyle: string = "";
  @Input() fields: FormField[] = [];
  @Input() data: any[] = [];
  @Input() btnText: string = "";
  @Input() divBtnStyle: string = "";
  @Output() formSubmit = new EventEmitter<void>();
  @Input() errorMessage: string | null= "";
  @Input() successMessage: string | null= "";
  @Input() token: string = "";
  private titleCasePipe = new TitleCasePipe()
  categorias: Categoria[] = []
  ejercicios: Ejercicio[] = []
  defectos: Defecto[] = []
  private inicializado = false;

  get hasSuccessMessage(): boolean {
    return !!this.successMessage;
  }
  get hasErrorMessage(): boolean {
    return !!this.errorMessage;
  }

  get bloquesControls() {
  return (this.form.get('bloques') as FormArray).controls;
}

  form: FormGroup;


  constructor(private fb: FormBuilder, private cd: ChangeDetectorRef, private modalService: ModalService, private primeraLetraPipe: PrimeraLetraPipe, private categoryService: CategoryService, private exerciseService: ExerciseService){
    this.form = this.fb.group({});
  };

  trackByControl(index: number) {
  return index;
  }

  trackByEjercicio(ejercicio: any) {
    return ejercicio.id;
  }

  ngOnInit(): void {
    this.modalService.errorMessage$.subscribe(msg => this.errorMessage = msg);
    this.modalService.successMessage$.subscribe(msg => this.successMessage = msg);

    this.categoryService.getCategorias().subscribe(categorias => {
      this.categorias = categorias.filter((cat: Categoria) => cat.id !== 0);
    });

    this.exerciseService.getEjercicios(true).subscribe(ejercicios => {
      this.ejercicios = ejercicios;
    });

  }

  getValidators(validatorsConfig: any) {
    const fieldValidators = [];

    if (validatorsConfig.required){
      fieldValidators.push(Validators.required);
    }

    if (validatorsConfig.minlength){
      fieldValidators.push(Validators.minLength(validatorsConfig.minlength));
    }

    if (validatorsConfig.pattern){
      fieldValidators.push(Validators.pattern(validatorsConfig.pattern));
    }

    return fieldValidators;
}

  ngOnChanges() {
    if (this.inicializado) return;
    this.inicializado = true;
    const group: any = {};
    this.fields.forEach(field => {
    if (field.type === 'nested') {
      group[field.name] = this.fb.array([]);
    } else {
      group[field.name] = ['', this.getValidators(field.validators || {})];
    }
  });

  this.form = this.fb.group(group);

  const cargarDatos = () => {
    if (this.data && this.data.length > 0) {
      this.patchFormData(this.data[0]);
    } else if (this.fields.some(f => f.name === 'bloques')) {
      const bloquesArray = this.form.get('bloques') as FormArray;
      if (bloquesArray.length === 0) {
        this.agregarBloque();
      }
    }
    this.setupDynamicListeners();
  };

  if (this.categorias.length > 0 && this.ejercicios.length > 0) {
    cargarDatos();
  } else {
    const subscription = merge(
      this.categoryService.getCategorias(),
      this.exerciseService.getEjercicios(true)
    ).pipe(take(2)).subscribe(() => {
      cargarDatos();
      subscription.unsubscribe();
    });
  }
}

  getLabel(fieldName: string): string {
  const findLabel = (fields: FormField[]): string => {
    for (const field of fields) {
      if (field.name === fieldName) {
        return field.label;
      }
      if (field.subFields) {
        const label = findLabel(field.subFields);
        if (label) return label;
      }
    }
    return '';
  };

  return findLabel(this.fields) || fieldName;
}

  patchFormData(data: any): void {
  const formattedData = { ...data };

  Object.keys(formattedData).forEach(key => {
    const field = this.fields.find(f => f.name === key);
    const value = formattedData[key];

    if (field?.type === 'nested' && Array.isArray(value)) {
      const formArray = this.form.get(key) as FormArray;
      formArray.clear();

      value.forEach((item: any) => {
        const group = this.fb.group({});
        Object.keys(item).forEach(subKey => {
          const subField = field.subFields?.find(sf => sf.name === subKey);
          let subValue = item[subKey];

          if (subKey === 'defectos' && Array.isArray(subValue)) {
            const defectosArray = this.fb.array([]) as FormArray;
            subValue.forEach((defecto: any) => {
              const defectoGroup = this.fb.group({});
              Object.keys(defecto).forEach(defKey => {
                defectoGroup.addControl(defKey, this.fb.control(defecto[defKey]));
              });
              defectosArray.push(defectoGroup);
            });
            group.addControl(subKey, defectosArray);
          } else if (subKey !== 'nombre_categoria') {
            group.addControl(subKey, this.fb.control(subValue));
          }
        });
        formArray.push(group);
      });
    } else if (this.form.get(key)) {
      if (field?.type === 'text' && value) {
        formattedData[key] = this.primeraLetraPipe.transform(value);
      } else if (field?.name === 'apellidos' && value) {
        formattedData[key] = this.titleCasePipe.transform(value);
      }
    }
  });

  this.form.patchValue(formattedData);
  this.cd.detectChanges()
}

  setupDynamicListeners() {
  const bloquesArray = this.form.get('bloques') as FormArray;
  if (bloquesArray) {
    bloquesArray.valueChanges.subscribe(() => {
      bloquesArray.controls.forEach((bloqueGroup) => {
        const defectosArray = (bloqueGroup as FormGroup).get('defectos') as FormArray;
        
        defectosArray.controls.forEach(defectoGroup => {
          const idEjercicio = defectoGroup.get('id_ejercicio')?.value;
          const idCategoria = bloqueGroup.get('id_categoria')?.value;

          if (idEjercicio && !idCategoria) {
            const ejercicio = this.ejercicios.find(e => e.id === +idEjercicio);
            if (ejercicio) {
              bloqueGroup.patchValue({ id_categoria: ejercicio.id_categoria }, { emitEvent: false });
            }
          }
        });
      });
    });
  }
}

agregarBloque(): void {
  const bloque = this.fb.group({
    id_categoria: ['', Validators.required],
    defectos: this.fb.array([])
  });
  this.getBloquesArray().push(bloque);
  this.agregarDefectoEnBloque(this.getBloquesArray().length - 1);
}

agregarDefectoEnBloque(bloqueIndex: number): void {
  const defectosArray = this.getDefectosArray(bloqueIndex);
  const defecto = this.fb.group({
    id_ejercicio: ['', Validators.required],
    series: [1],
    repeticiones: [1],
    carga: [0],
    RPE: [1, [Validators.min(1), Validators.max(10)]],
    nombre_ejercicio: ['']
  });
  defectosArray.push(defecto);
}

eliminarDefecto(bloqueIndex: number, defectoIndex: number): void {
  const defectos = this.getDefectosArray(bloqueIndex);
  if (defectos.length > 1) {
    defectos.removeAt(defectoIndex);
  }
}

eliminarBloque(bloqueIndex: number): void {
  if (this.getBloquesArray().length > 1) {
    this.getBloquesArray().removeAt(bloqueIndex);
  }
}

getBloquesArray(): FormArray {
  return this.form.get('bloques') as FormArray;
}

getDefectosArray(bloqueIndex: number): FormArray {
  const bloque = this.getBloquesArray().at(bloqueIndex) as FormGroup;
  return bloque.get('defectos') as FormArray;
}

getDefectosSubFields() {
  const bloquesField = this.fields.find(f => f.name === 'bloques');
  const defectosField = bloquesField?.subFields?.find(sf => sf.name === 'defectos');
  return defectosField?.subFields?.filter(subField => subField.name !== 'id_ejercicio') || [];
}


onCategoriaChange(bloqueIndex: number): void {
  const idCategoria = this.getBloquesArray().at(bloqueIndex).get('id_categoria')?.value;
  const defectosArray = this.getDefectosArray(bloqueIndex);

  defectosArray.controls.forEach(control => {
    const idEjercicio = control.get('id_ejercicio')?.value;
    const ejercicio = this.ejercicios.find(e => e.id === +idEjercicio);
    if (ejercicio && ejercicio.id_categoria !== idCategoria) {
      control.get('id_ejercicio')?.setValue(null);
    }
  });
  this.cd.detectChanges();
}

getEjerciciosFiltrados(bloqueIndex: number): any[] {
  const idCategoria = this.getBloquesArray().at(bloqueIndex).get('id_categoria')?.value;
  return idCategoria
    ? this.ejercicios.filter(e => e.id_categoria === +idCategoria)
    : [...this.ejercicios];
}

  onSubmit(){
    this.form.markAllAsTouched();

    if (this.form.invalid){
      return;
    }
    
    this.formSubmit.emit(this.form.value);
    this.resetMessageParams();
  }

  resetForm(){
    this.form.reset();
  }

  resetMessageParams(){
    this.errorMessage= "";
    this.successMessage="";
  }

  closeModal(){
    this.modalService.closeModal();
  }
}
