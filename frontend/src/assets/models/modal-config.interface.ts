import { Observable } from "rxjs";

export interface ModalConfig {
  action: 'create' | 'edit'
  service: {
    create(data: any): Observable<any>;
    update(data: any): Observable<any>;
  };
  data?: any;
  id?: number;
}