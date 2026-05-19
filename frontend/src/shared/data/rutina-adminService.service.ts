import { Injectable} from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({ providedIn: 'root' })

export class RutinaAdminService {
  private baseApiUrl = 'http://localhost:3000/api/rutinas';

  constructor(private http: HttpClient) {}

  getRutinas(id: number, byAntiguedad: boolean): Observable<any> {
    let params = new HttpParams();
    if (byAntiguedad) {
      params = params.set('by_antiguedad', 'true');
    }
    return this.http.get<any>(this.baseApiUrl+"/all/"+id, {params});
  }

  getIdHistorial(data: any): Observable<any> {
    return this.http.get<any>(this.baseApiUrl+"/id-historial/"+data.id_usuario+"/"+data.id_plantilla);
  }

  getVariacionesById(id: number): Observable<any> {
      return this.http.get<any>(this.baseApiUrl+'/'+id)
  }

  getRutinaByUsuarioId(id: number): Observable<any> {
    return this.http.get<any>(this.baseApiUrl+'/asignaciones/por-usuario/'+id)
  }

  getRutinaByPlantillaId(id: number): Observable<any> {
    return this.http.get<any>(this.baseApiUrl+'/asignaciones/por-plantilla/'+id)
  }

  asignarRutina(data: any): Observable<any>{
    return this.http.post<any>(this.baseApiUrl+"/"+data.id_usuario+"/"+data.id_plantilla, data);
  }

  actualizarRutina(data: any): Observable<any>{
    return this.http.put<any>(this.baseApiUrl+"/"+data.id, data);
  }

  desasignarRutina(id: number): Observable<any>{
    return this.http.delete<any>(this.baseApiUrl+'/'+id);
  }
}