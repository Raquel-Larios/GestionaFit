import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, ChangeDetectorRef, Signal, input, computed} from '@angular/core';
import { CommonModule } from '@angular/common';
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
  @Input() estilo: string = "linker-toggle-defecto"
  @Input() texto: string = "";
  @Input() config !: ItemLinkConfig;
  @Input() itemId!: number;
  @Output() linkEvent = new EventEmitter<ItemLinkEvent>();
  @Output() loadForId = new EventEmitter<{ id: number; choice?: LinkOption | null}>();
  currentChoice: LinkOption | null = null;
  showMenu: boolean = false;
  showSubmenu: boolean = false;
  @ViewChild('linkerButton') linkerButton!: ElementRef;
  @ViewChild('menu') menu!: ElementRef;

  get assignedItemsId(){
    return this.config.assignedItems.map(item => item.id);
  };

  constructor(private cd: ChangeDetectorRef){
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
    if (!this.config.multipleLinkChoice) {
    // Para un solo tipo, carga y abre el menú inmediatamente
    this.loadForId.emit({ id: this.itemId });
    this.showMenu = true;
    } else {
    // Para múltiples tipos, solo abre el menú
    this.showMenu = !this.showMenu;
  }
  }

  loadIdData(selectedItemId: number, choice: LinkOption){
    const parentKeyMap: { [key in LinkOption]?: string } = {
      Categoría: 'id_categoria',
      Ejercicio: 'id_ejercicio',
      Vídeo: 'id_video',
      Cliente: 'id_usuario',
      Plantilla: 'id_plantilla',
    };

    const selectedKeyMap: { [key in LinkOption]?: string } = {
      Categoría: 'id_categoria',
      Ejercicio: 'id_ejercicio',
      Vídeo: 'id_video',
      Cliente: 'id_usuario',
      Plantilla: 'id_plantilla',
    };

    const parentKey = parentKeyMap[this.config.parentType] || 'id_padre';
    const selectedKey = selectedKeyMap[choice] || 'id_seleccionado';

    const idData = {
      [parentKey]: this.itemId,
      [selectedKey]: selectedItemId
    }

    return idData;
  }

  selectItem(selectedItemId: number, choice: LinkOption) {
    const idData = this.loadIdData(selectedItemId, choice)
    this.linkEvent.emit({ data: idData, action: 'asignar', choice });
    this.showMenu = false;
  }

  unselectItem(selectedItemId: number, choice: LinkOption) {
    const idData = this.loadIdData(selectedItemId, choice)
    this.linkEvent.emit({ data: idData, action: 'desasignar', choice });
    this.showMenu = false;
  }

  enterChoice(choice: LinkOption) {
    this.currentChoice = choice;
    if (this.config.multipleLinkChoice && this.showMenu) {
      this.loadForId.emit({ id: this.itemId, choice: this.currentChoice });
    }
    this.showSubmenu = true;
  }

  leaveChoice() {
    this.showSubmenu = false;
  }

  leaveMenu(){
    this.showMenu = false;
  }

}
