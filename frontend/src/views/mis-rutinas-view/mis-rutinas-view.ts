import { ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Lectura, RutinaCliente, RutinaClienteOrderOptions } from '../../assets/models/rutina-cliente.interface';
import { RutinaClienteService } from '../../shared/data/rutina-clienteService.service';
import { CommonModule } from '@angular/common';
import { OrderOptionComponent } from '../../shared/ui/order-option.component/order-option.component';
import { FormField } from '../../assets/models/form-field.interface';
import { ModalService } from '../../shared/data/modalService.service';
import { ModalConfig } from '../../assets/models/modal-config.interface';
import { PrimeraLetraPipe } from '../../shared/utils/pipes/primeraLetraPipe';
import { EMPTY, of, switchMap, tap } from 'rxjs';
import { AuthService } from '../../shared/data/authService.service';
import { mostrarMensajeTemporal } from '../../assets/scripts/pop-up';
import { ExerciseService } from '../../shared/data/exerciseService.service';
import { LightboxComponent } from '../../shared/ui/lightbox.component/lightbox.component';
import { LightboxItem } from '../../assets/models/lightbox-item.interface';
import { Router } from '@angular/router';
import { RutinaAdmin } from '../../assets/models/rutina-admin.interface';
import { RutinaAdminService } from '../../shared/data/rutina-adminService.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CheckButtonComponent } from "../../shared/ui/check-button.component/check-button.component";

@Component({
  selector: 'app-mis-rutinas-view',
  imports: [
    FontAwesomeModule,
    CommonModule,
    OrderOptionComponent,
    PrimeraLetraPipe,
    LightboxComponent,
    ReactiveFormsModule,
    CheckButtonComponent
],
  templateUrl: './mis-rutinas-view.html',
  styleUrl: './mis-rutinas-view.css',
})
export class MisRutinasView implements OnInit {

  userId: number = -1;
  orderOptionSelected: string = 'Nombre';
  rutinaOrderOptions = RutinaClienteOrderOptions;
  listaLecturas: RutinaCliente[] = [];
  lecturaFields: FormField[] = [
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
          name: 'lecturas',
          type: 'nested',
          label: 'Lecturas',
          subFields: [
            { name: 'id_ejercicio', type: 'select', label: 'Ejercicio', validators: { required: true } },
            { name: 'series', type: 'number', label: 'Series', value: 0 },
            { name: 'repeticiones', type: 'number', label: 'Repeticiones', value: 0 },
            { name: 'carga', type: 'number', label: 'Carga (kg)', value: 0 },
            { name: 'RPE', type: 'number', label: 'RPE', min: 1, max: 10, value: 1 }
          ]
        }
      ]
    },
  ];
  listaRutinasCombinadas: {cliente: RutinaCliente, admin: RutinaAdmin, form: FormGroup}[] = []
  listaRutinas: RutinaAdmin[] = [];
  dropdownOpen: { [key: string]: boolean } = {};
  @ViewChild(LightboxComponent) lightbox!: LightboxComponent;
  @ViewChild('dropdownMenu') dropdownMenuRef!: ElementRef;
  exerciseVideoItem: LightboxItem[] = [];
  hasVideo: boolean = false;

  constructor(
    private rutinaAdminService: RutinaAdminService,
    private rutinaClienteService: RutinaClienteService,
    private authService: AuthService,
    private exerciseService: ExerciseService,
    private cd: ChangeDetectorRef,
    private fb: FormBuilder,
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
    if(this.userId === -1){
      const userData = this.authService.getUserFromToken();
      if (userData) {
              this.userId = userData.id;
      }
    }
    
    
    this.cargarRutinas();
  }

  cargarRutinas(){
    if (this.orderOptionSelected === 'Nombre') {
      this.rutinaAdminService.getRutinas(this.userId, false).subscribe({
      next: (datos) => {
        this.listaRutinas = this.toRutinaFormat(datos);
        this.cd.detectChanges();
      },
      error: (err) => {
        mostrarMensajeTemporal(err.error?.message, 2000);
      },
      });

      this.rutinaClienteService.getLecturas(this.userId, false).subscribe({
        next: (datos) => {
          this.listaLecturas = this.toRutinaFormat(datos)
          this.combinarListas();
          this.cd.detectChanges();
        },
        error: (err) => {
          mostrarMensajeTemporal(err.error?.message, 2000);
        },
      });

    } else if (this.orderOptionSelected === 'Antigüedad') {
      this.rutinaAdminService.getRutinas(this.userId, true).subscribe({
      next: (datos) => {
        this.listaRutinas = this.toRutinaFormat(datos);
        this.cd.detectChanges();
      },
      error: (err) => {
        mostrarMensajeTemporal(err.error?.message, 2000);
      },
      });
      this.rutinaClienteService.getLecturas(this.userId, true).subscribe({
        next: (datos) => {
          this.listaLecturas = this.toRutinaFormat(datos)
          this.combinarListas();
          this.cd.detectChanges();
        },
        error: (err) => {
          mostrarMensajeTemporal(err.error?.message, 2000);
        },
      });
    } 
  }

  combinarListas(){
    this.listaRutinasCombinadas = this.listaLecturas.map((clienteRutina, index) => {
    const formArray = this.fb.array(
      clienteRutina.bloques.flatMap(bloque => 
        bloque.lecturas.map(lectura => this.crearLecturaFormGroup(lectura))
      )
    );
    return {
      cliente: clienteRutina,
      admin: this.listaRutinas[index] || { bloques: [] },
      form: this.fb.group({ lecturasForm: formArray })
    };
  });
  }

  crearLecturaFormGroup(lectura: Lectura): FormGroup {
    const group: any = {};
    const lecturasField = this.lecturaFields.find(f => f.name === 'bloques')?.subFields?.find(sf => sf.name === 'lecturas');

    lecturasField?.subFields?.forEach(subField => {
      const fieldName = subField.name as keyof Lectura;
      const value = lectura[fieldName];
      const validators = this.getValidators(subField.validators || {});
      group[subField.name] = [value, validators];
    });

    return this.fb.group(group);
  }

  getValidators(validatorsConfig: any) {
  const fieldValidators = [];
  if (validatorsConfig.required) {
    fieldValidators.push(Validators.required);
  }
  if (validatorsConfig.min !== undefined) {
    fieldValidators.push(Validators.min(validatorsConfig.min));
  }
  if (validatorsConfig.max !== undefined) {
    fieldValidators.push(Validators.max(validatorsConfig.max));
  }
  return fieldValidators;
}

  onItemsReversed(reversed: RutinaCliente[]) {
    this.listaLecturas = reversed;
  }

  onSubmit(){
    this.listaRutinasCombinadas.forEach(rutinaCombinada => {
      this.markFormGroupTouched(rutinaCombinada.form);
    });

    const algunoInvalido = this.listaRutinasCombinadas.some(rutinaCombinada => rutinaCombinada.form.invalid);
    if (algunoInvalido) {
      return;
    }


    let datosParaEnviar;

    this.listaRutinasCombinadas.forEach(rutinaCombinada => {
    const formValue = rutinaCombinada.form.value;
    datosParaEnviar = {
      id_historial: rutinaCombinada.cliente.id_historial,
      id_usuario: this.userId,
      bloques: rutinaCombinada.cliente.bloques.map((bloque, bloqueIndex) => {
        return {
          id_categoria: bloque.id_categoria,
          lecturas: formValue.lecturasForm.slice(
            bloqueIndex * bloque.lecturas.length,
            (bloqueIndex + 1) * bloque.lecturas.length
          )
        };
      })
    };
  });

    this.rutinaClienteService.actualizarLectura(datosParaEnviar).subscribe({
      next: (res) => {
        mostrarMensajeTemporal(res.message, 2000);
        this.refrescarLecturas();
        this.cd.detectChanges();
      },
      error: (err) => {
        mostrarMensajeTemporal(err.error?.message, 2000);
      }
    })
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  onOrderSelected(order: string) {
    this.orderOptionSelected = order;
    this.refrescarLecturas();
  }

  refrescarLecturas(): void {
    this.rutinaClienteService.getLecturas(this.userId, false).subscribe((data) => {
      this.listaLecturas = [...this.toRutinaFormat(data)];
      this.combinarListas();
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
