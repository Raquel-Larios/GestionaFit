import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { ItemLinkConfig, ItemLinkEvent, LinkOption} from '../../../assets/models/item-linker.interface';
import { FilterAssignedPipe, FilterUnassignedPipe } from '../../utils/pipes/filterPipes';
import { PrimeraLetraPipe } from '../../utils/pipes/primeraLetraPipe';

@Component({
  selector: 'app-item-linker',
  imports: [CommonModule, FilterAssignedPipe, FilterUnassignedPipe, PrimeraLetraPipe],
  templateUrl: './item-linker.component.html',
  styleUrl: './item-linker.component.css',
})
export class ItemLinkerComponent {

  @Input() texto: string = "";
  @Input() config !: ItemLinkConfig;
  @Input() itemId!: number;
  @Output() linkEvent = new EventEmitter<ItemLinkEvent>();
  @Output() loadForId = new EventEmitter<number>();
  showMenu: boolean = false;
  showSubmenu: boolean = false;
  currentChoice: LinkOption | null = null;
  @ViewChild('linkerButton') linkerButton!: ElementRef;
  @ViewChild('menu') menu!: ElementRef;

  get assignedItemsId(): number[] {
    return this.config.assignedItems.map(item => item.id);
  }

  ngOnInit() {
    document.addEventListener('click', this.handleDocumentClick.bind(this));
  }

  ngOnDestroy() {
    document.removeEventListener('click', this.handleDocumentClick.bind(this));
  }

  private handleDocumentClick(event: MouseEvent) {
    const button = this.linkerButton?.nativeElement;
    const menu = this.menu?.nativeElement;
    if (this.showMenu && button && menu && !button.contains(event.target as Node) && !menu.contains(event.target as Node)) {
      this.showMenu = false;
    }
  }
 
  onButtonClick(event: Event) {
    event.stopPropagation();
    this.loadForId.emit(this.itemId);
    this.showMenu = !this.showMenu;
  }

  selectItem(selectedItemId: number, type: LinkOption) {
    const idData = {
      id_categoria: this.itemId,
      id_ejercicio: selectedItemId
    }
    this.linkEvent.emit({ data: idData, action: 'asignar', type });
    this.showMenu = false;
  }

  unselectItem(selectedItemId: number, type: LinkOption) {
    const idData = {
      id_categoria: this.itemId,
      id_ejercicio: selectedItemId
    }
    this.linkEvent.emit({ data: idData, action: 'desasignar', type });
    this.showMenu = false;
  }

  enterChoice(choice: LinkOption) {
    this.currentChoice = choice;
    this.showSubmenu = true;
  }

  leaveChoice() {
    this.showSubmenu = false;
  }

}
