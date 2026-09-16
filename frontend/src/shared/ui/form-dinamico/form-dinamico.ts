import { Component, Input, Output, EventEmitter, OnChanges, ChangeDetectorRef, SimpleChanges} from '@angular/core';
import { CommonModule, TitleCasePipe} from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray, FormControl, ValidatorFn, AbstractControl} from '@angular/forms';
import { FormField } from '../../../assets/models/form-field.interface';
import { CheckButtonComponent } from "../check-button.component/check-button.component";
import { NavButtonComponent } from "../nav-button.component/nav-button.component";
import { ModalService } from '../../data/modalService.service';
import { PrimeraLetraPipe } from '../../utils/pipes/primeraLetraPipe';
import { Categoria } from '../../../assets/models/categoria.interface';
import { Ejercicio } from '../../../assets/models/ejercicio.interface';
import { CategoryService } from '../../data/categoryService.service';
import { ExerciseService } from '../../data/exerciseService.service';
import { filter, merge, take } from 'rxjs';
import { hasLowercase, hasNoSpaces, hasNumber, hasUppercase } from '../../utils/validators/password.validators';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { IconButtonComponent } from "../icon-button/icon-button.component";



@Component({
  selector: 'app-form-dinamico',
  imports: [CommonModule, ReactiveFormsModule, CheckButtonComponent, NavButtonComponent, PrimeraLetraPipe, IconButtonComponent],
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
  showPassword: boolean = false;
  visibility_on = faEye;
  visibility_off = faEyeSlash;
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

  

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

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

    if (this.isPasswordField(validatorsConfig)) {
    fieldValidators.push(
      hasLowercase,
      hasUppercase,
      hasNumber,
      hasNoSpaces
    );
  }

    return fieldValidators;
}

private isPasswordField(validatorsConfig: any): boolean {
  return validatorsConfig.pattern && validatorsConfig.pattern.includes('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)\\S{8,}$');
}

private passwordMatchValidator(): ValidatorFn {
  return (group: AbstractControl): { [key: string]: any } | null => {
    const password = group.get('contraseña')?.value;
    const confirm = group.get('confirmarContraseña')?.value;

    if (!confirm) return null;

    return password === confirm ? null : { mismatch: true };
  };
}


  ngOnChanges(changes: SimpleChanges) {

    if (changes['data'] || changes['fields']) {
      this.inicializado = false;
    }

    if (this.inicializado) return;
    this.inicializado = true;
    const group: any = {};
    this.fields.forEach(field => {
    if (field.type === 'nested') {
      group[field.name] = this.fb.array([]);
    } else {
      const control = new FormControl(
        '', 
        this.getValidators(field.validators || {})
      );
      group[field.name] = control;
    }
  });

  this.form = this.fb.group(group, { validators: this.passwordMatchValidator() });

  this.form.get('contraseña')?.valueChanges.subscribe(() => {
    this.updateConfirmPasswordField();
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
    setTimeout(() => {
      this.cd.detectChanges();
    }, 0);
  };

  if (this.categorias.length > 0 && this.ejercicios.length > 0) {
    cargarDatos();
  } else {
    const subscription = merge(
      this.categoryService.getCategorias().pipe(filter((cat: Categoria) => cat.id !== 0)),
      this.exerciseService.getEjercicios(true)
    ).pipe(take(2)).subscribe(() => {
      cargarDatos();
      subscription.unsubscribe();
    });
  }
}

private updateConfirmPasswordField(): void {
  const valid = this.form.get('contraseña')?.valid;
  const hasConfirmField = this.fields.some(f => f.name === 'confirmarContraseña');
  const index = this.fields.findIndex(f => f.name === 'contraseña');

  if (this.fields.length > 2 && valid && !hasConfirmField) {
    this.fields = [
      ...this.fields.slice(0, index + 1),
      {
        name: 'confirmarContraseña',
        type: 'password',
        label: 'Repetir Contraseña',
        validators: { required: true }
      },
      ...this.fields.slice(index + 1)
    ];
    this.form.addControl('confirmarContraseña', this.fb.control('', Validators.required));
  } else if (!valid && hasConfirmField) {
    this.fields = this.fields.filter(f => f.name !== 'confirmarContraseña');
    this.form.removeControl('confirmarContraseña');
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

          if (subField?.type === 'nested' && Array.isArray(subValue)) {
            const nestedArray = this.fb.array([]) as FormArray;
            subValue.forEach((nestedItem: any) => {
              const nestedGroup = this.fb.group({});
              Object.keys(nestedItem).forEach(nesKey => {
                nestedGroup.addControl(nesKey, this.fb.control(nestedItem[nesKey]));
              });
              nestedArray.push(nestedGroup);
            });
            group.addControl(subKey, nestedArray);
          } else if (subKey !== 'nombre_categoria') {
            group.addControl(subKey, this.fb.control(subValue));
          }
        });
        formArray.push(group);
      });
    } else if (this.form.get(key)) {
      if (field?.type === 'text' && field?.name !== 'apellidos' && value) {
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
        const nestedField = this.fields.find(f => f.name === 'bloques')?.subFields?.find(sf => sf.type === 'nested');
        const nestedFieldName = nestedField?.name || 'defectos';

        const nestedArray = (bloqueGroup as FormGroup).get(nestedFieldName) as FormArray;
        
        nestedArray.controls.forEach(nestedGroup => {
          const idEjercicio = nestedGroup.get('id_ejercicio')?.value;
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
    [this.getNestedFieldName()]: this.fb.array([])
  });
  this.getBloquesArray().push(bloque);
  this.agregarNestedEnBloque(this.getBloquesArray().length - 1);
}

agregarNestedEnBloque(bloqueIndex: number): void {
  const defectosArray = this.getNestedArray(bloqueIndex);
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

eliminarNested(bloqueIndex: number, nestedIndex: number): void {
  const nested = this.getNestedArray(bloqueIndex);
  if (nested.length > 1) {
    nested.removeAt(nestedIndex);
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

getNestedFieldName(): string {
  const bloqueField = this.fields.find(f => f.name === 'bloques');
  const nestedField = bloqueField?.subFields?.find(sf => sf.type === 'nested');
  return nestedField?.name || 'defectos';
}

getNestedArray(bloqueIndex: number): FormArray {
  const field = this.getNestedFieldName();
  return this.form.get(['bloques', bloqueIndex, field]) as FormArray;
}

getNestedSubFields() {
  const bloquesField = this.fields.find(f => f.name === 'bloques');
  const nestedField = bloquesField?.subFields?.find(sf => sf.type === 'nested');
  return nestedField?.subFields?.filter(subField => subField.name !== 'id_ejercicio') || [];
}


onCategoriaChange(bloqueIndex: number): void {
  const idCategoria = this.getBloquesArray().at(bloqueIndex).get('id_categoria')?.value;
  const nestedArray = this.getNestedArray(bloqueIndex);

  nestedArray.controls.forEach(control => {
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

  resetMessageParams(){
    this.errorMessage= "";
    this.successMessage="";
  }

  closeModal(){
    this.modalService.closeModal();
  }
}
