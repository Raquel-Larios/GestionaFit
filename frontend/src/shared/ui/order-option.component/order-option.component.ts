import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-order-option',
  imports: [CommonModule, FormsModule],
  templateUrl: './order-option.component.html',
  styleUrl: './order-option.component.css',
})
export class OrderOptionComponent {

  @Input() orderOptions: readonly string[] = [];
  @Input() ascOptions: Record<string, string> = {};
  @Input() descOptions: Record<string, string> = {};
  @Input() listaItems: any[] = [];
  @Output() itemsReversed = new EventEmitter<any[]>();
  orderOptionSelected!: string;
  ascLabel = '';
  isAsc = true;

ngOnInit() {
  this.orderOptionSelected = this.orderOptions[0];
  this.updateAscLabel();
}

onOrderChange() {
  this.isAsc = true;
  this.updateAscLabel();
}

toggleAsc() {
  this.isAsc = !this.isAsc;
  this.updateAscLabel();
  const reversed = this.listaItems.slice().reverse();
  this.itemsReversed.emit(reversed);
}

updateAscLabel() {
  this.ascLabel = this.isAsc 
    ? this.ascOptions[this.orderOptionSelected] 
    : this.descOptions[this.orderOptionSelected];
}

}
