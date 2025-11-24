import { Component, EventEmitter, Input, Output} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal.component',
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css',
})

export class ModalComponent {
  
  @Input() isOpen=false;
  @Output() closed= new EventEmitter<void>();

  closeModal(){
    this.closed.emit();
  }

}
