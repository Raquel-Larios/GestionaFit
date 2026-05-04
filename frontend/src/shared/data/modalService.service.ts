import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ModalConfig } from '../../assets/models/modal-config.interface';
import { FormField } from '../../assets/models/form-field.interface';

@Injectable({ providedIn: 'root' })
export class ModalService {
  private isOpenModal = new BehaviorSubject<boolean>(false);
  private dataFieldsModal = new BehaviorSubject<FormField[]>([]);
  private errorMessageSubject = new BehaviorSubject<string | null>("");
  private successMessageSubject = new BehaviorSubject<string | null>("");
  private configSubject = new BehaviorSubject<ModalConfig | null>(null);
  private id = new BehaviorSubject<number | null>(null);

  isOpen$ = this.isOpenModal.asObservable();
  dataFields$ = this.dataFieldsModal.asObservable();
  errorMessage$ = this.errorMessageSubject.asObservable();
  successMessage$ = this.successMessageSubject.asObservable();
  config$ = this.configSubject.asObservable();
  id$ = this.id.asObservable();

  openModal(config: ModalConfig): void {
    this.configSubject.next(config);
    this.isOpenModal.next(true);
  }

  closeModal(): void {
    this.isOpenModal.next(false);
    this.clearMessages();
  }

  setDataFields(fields: FormField[]) {
    this.dataFieldsModal.next(fields);
  }

  setMessages(error: string | null, success: string | null): void {
    this.errorMessageSubject.next(error);
    this.successMessageSubject.next(success);
  }

  clearMessages(): void {
    this.errorMessageSubject.next(null);
    this.successMessageSubject.next(null);
  }
}