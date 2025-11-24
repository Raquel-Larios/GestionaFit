import { Component, Input, Output, EventEmitter, OnChanges} from '@angular/core';
import { CommonModule} from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators} from '@angular/forms';
import { FormField } from '../../../assets/models/form-field.interface';
import { CheckButtonComponent } from "../check-button.component/check-button.component";
import { NavButtonComponent } from "../nav-button.component/nav-button.component";

@Component({
  selector: 'app-form-dinamico',
  imports: [CommonModule, ReactiveFormsModule, CheckButtonComponent, NavButtonComponent],
  templateUrl: './form-dinamico.html',
  styleUrl: './form-dinamico.css',
})

export class FormDinamico implements OnChanges{
  @Input() backBtnOpt: boolean = false;
  @Input() cancelBtnOpt: boolean = false;
  @Input() btnStyle: string = "";
  @Input() fields: FormField[] = [];
  @Input() btnText: string = "";
  @Input() divBtnStyle: string = "";
  @Output() formSubmit = new EventEmitter<void>();
  @Input() errorMessage: string = "";
  @Input() successMessage: string = "";
  @Input() isDefaultError: boolean = true;
  @Input() token: string = "";
  get hasSuccessMessage(): boolean {
    return !!this.successMessage;
  }
  get hasErrorMessage(): boolean {
    return !!this.errorMessage;
  }
  form: FormGroup;


  constructor(private fb: FormBuilder){
    this.form = this.fb.group({});
  };



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
  }

  onSubmit(){
    this.form.markAllAsTouched();

    if (this.form.invalid){
      return;
    }

    this.resetMessageParams();
    this.formSubmit.emit(this.form.value);

    if(this.hasErrorMessage){
      if(this.isDefaultError){
        setTimeout(() => {
          this.errorMessage = "";
        }, 2000)
      }
    }
    else{
      this.resetForm();
      this.resetMessageParams;
    }
  }

  resetForm(){
    this.form.reset();
  }

  resetMessageParams(){
    this.errorMessage= "";
    this.successMessage="";
  }

  cerrarModal(){

  }
}
