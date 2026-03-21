import { ChangeDetectorRef, Component, Input} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormField } from '../../../assets/models/form-field.interface';
import { FormDinamico } from "../form-dinamico/form-dinamico";
import { ModalService } from '../../data/modalService.service';
import { ModalConfig } from '../../../assets/models/modal-config.interface';

@Component({
  selector: 'app-modal',
  imports: [CommonModule, FormDinamico],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css',
})

export class ModalComponent {
  
  @Input() isOpen=false;
  @Input() dataFields: FormField[] = [];
  @Input() errorMessage: String = "";
  @Input() successMessage: String = "";
  @Input() isDefaultError: boolean= false;
  config: ModalConfig | null = null; 

  constructor(private modalService: ModalService, private cd: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.modalService.isOpen$.subscribe(isOpen => {this.isOpen = isOpen; this.cd.detectChanges()});
    this.modalService.dataFields$.subscribe(dataFields => this.dataFields = dataFields);
    this.modalService.config$.subscribe(config => this.config = config);
  }

  onFormSubmit(data:any){
    if (!this.config) return;

    const { action, service, id} = this.config;
    
    if (action === 'create') {
      service.create(data).subscribe({ 
        next: () => { setTimeout(() => this.closeModal());}
    });
    } else if (action === 'edit') {
      service.update({ ...data, id }).subscribe(() => this.closeModal());
    }
  }

  closeModal(): void {
    this.modalService.closeModal();
    this.cd.detectChanges();
  }

}
