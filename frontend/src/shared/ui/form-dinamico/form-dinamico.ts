import { Component, Input, Output, EventEmitter, OnChanges} from '@angular/core';
import { CommonModule, TitleCasePipe} from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators} from '@angular/forms';
import { FormField } from '../../../assets/models/form-field.interface';
import { CheckButtonComponent } from "../check-button.component/check-button.component";
import { NavButtonComponent } from "../nav-button.component/nav-button.component";
import { ModalService } from '../../data/modalService.service';
import { PrimeraLetraPipe } from '../../utils/pipes/primeraLetraPipe';

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
  @Input() isDefaultError: boolean = true;
  @Input() token: string = "";
  private titleCasePipe = new TitleCasePipe()

  get hasSuccessMessage(): boolean {
    return !!this.successMessage;
  }
  get hasErrorMessage(): boolean {
    return !!this.errorMessage;
  }
  form: FormGroup;


  constructor(private fb: FormBuilder, private modalService: ModalService, private primeraLetraPipe: PrimeraLetraPipe){
    this.form = this.fb.group({});
  };

  ngOnInit(): void {
    this.modalService.errorMessage$.subscribe(msg => this.errorMessage = msg);
    this.modalService.successMessage$.subscribe(msg => this.successMessage = msg);
    this.modalService.isDefaultError$.subscribe(isDefault => this.isDefaultError = isDefault);
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

  ngOnChanges(){

    const group: any = {};
    this.fields.forEach(field => {
      const fieldValidators = this.getValidators(field.validators || {});

      if (field.type === 'nested'){

        const nestedGroup: any = {};

        field.subFields?.forEach(sub => {
          nestedGroup[sub.name] = ['', this.getValidators(sub.validators || {})];
        });

        group[field.name] = this.fb.group(nestedGroup);
      } 
        
      else {
        group[field.name] = ['', fieldValidators];
      }

    });

    this.form = this.fb.group(group);

    if (this.data) {
      const formattedData = { ...this.data[0] };
      Object.keys(formattedData).forEach(key => {
        const field = this.fields.find(f => f.name === key);
        if (field && typeof formattedData[key] === 'string') {
          if (field.name === 'apellidos') {
            formattedData[key] = this.titleCasePipe.transform(formattedData[key]);
          } else if (field.type === 'text') {
            formattedData[key] = this.primeraLetraPipe.transform(formattedData[key]);
          }
        }
      });
      this.form.patchValue(formattedData);
    }
  }

  onSubmit(){
    this.form.markAllAsTouched();

    if (this.form.invalid){
      return;
    }

    
    this.formSubmit.emit(this.form.value);
    this.resetMessageParams();

    if(this.hasErrorMessage){
      if(this.isDefaultError){
        setTimeout(() => {
          this.errorMessage = "";
        }, 2000)
      }
    }
    else{
      this.resetMessageParams();
      this.resetForm();
    }
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
