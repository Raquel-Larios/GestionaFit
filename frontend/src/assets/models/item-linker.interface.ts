import { Observable } from "rxjs";

export type LinkOption = 'Cliente' | 'Plantilla' | 'Categoría' |'Ejercicio' | 'Vídeo'

export interface ItemLinkConfig {
  listaItems: LinkItem[],
  multipleLinkChoice: boolean,
  listaLinkChoices: LinkOption[],
  assignedItems: LinkItem[],
  selectionService: {
    assign(data: any): Observable<any>,
    unassign(data: any): Observable<any>,
  };
}

export interface ItemLinkEvent {
  data: any,
  action: 'asignar' | 'desasignar',
  type: LinkOption,
}

export interface LinkItem {
    id: number;
    nombre: string;
}
