import { Injectable} from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({ providedIn: 'root' })

export class TemplateService {
  private baseApiUrl = 'http://localhost:3000/api/plantillas';
  templateData: any = {};

  constructor(private http: HttpClient) {}

  getPlantillas(byAntiguedad: boolean): Observable<any>{
    let params = new HttpParams();
    if (byAntiguedad) {
      params = params.set('by_antiguedad', 'true');
    }
    return this.http.get<any>(this.baseApiUrl+'/all', {params});
  }

  getPlantillaById(id: number): Observable<any>{
    return this.http.get<any>(this.baseApiUrl+'/'+id);
  }

  crearPlantilla(data: any): Observable<any>{
    return this.http.post<any>(this.baseApiUrl, data);
  }

  actualizarPlantilla(data: any): Observable<any>{
    return this.http.put<any>(this.baseApiUrl+'/'+data.id, data);
  }

  borrarPlantilla(id: number): Observable<any>{
    return this.http.delete<any>(this.baseApiUrl+'/'+id);
  }

  desasignarRutinaPlantilla(data:any): Observable<any>{
    return this.http.delete<any>(this.baseApiUrl+'/'+data.id_usuario+'/'+data.id_plantilla);
  }
}
