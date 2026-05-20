import { Injectable} from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({ providedIn: 'root' })

export class RutinaClienteService {
  private baseApiUrl = 'http://localhost:3000/api/mis-rutinas';
  rutinaData: any = {};

  constructor(private http: HttpClient) {}

  getLecturas(id: number, byAntiguedad: boolean): Observable<any> {
    let params = new HttpParams();
    if (byAntiguedad) {
      params = params.set('by_antiguedad', 'true');
    }
    return this.http.get<any>(this.baseApiUrl+"/"+id+"/all", {params});
  }

  getIdHistorial(data: any): Observable<any> {
    return this.http.get<any>(this.baseApiUrl+"/id-historial/"+data.id_usuario+"/"+data.id_plantilla);
  }

  getLecturasById(id: number): Observable<any> {
      return this.http.get<any>(this.baseApiUrl+'/'+id)
  }

  actualizarLectura(data: any): Observable<any>{
    console.log("Data service: ", data)
    return this.http.put<any>(this.baseApiUrl+"/"+data.id_usuario+"/"+data.id_historial, data);
  }

}