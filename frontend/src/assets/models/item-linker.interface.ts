import { Observable } from "rxjs";

export type LinkOption = 'Cliente' | 'Plantilla' | 'Categoría' |'Ejercicio' | 'Vídeo'

export interface ItemLinkConfig {
  listaItems: LinkItem[],
  multipleLinkChoice: boolean,
  listaLinkChoices: LinkOption[],
  assignedItems: LinkItem[],
  selectionService: {
    assign(data: any, choice?: LinkOption): Observable<any>,
    unassign(data: any, choice?: LinkOption): Observable<any>,
  };
  parentType: LinkOption
}

export interface ItemLinkEvent {
  data: any,
  action: 'asignar' | 'desasignar',
  choice: LinkOption,
}

export interface LinkItem {
    id: number;
    nombre: string;
}
