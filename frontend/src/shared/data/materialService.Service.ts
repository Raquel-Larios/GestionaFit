import { Injectable} from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({ providedIn: 'root' })

export class MaterialService {
  private baseApiUrl = 'http://localhost:3000/api/materiales'; 
  materialData: any = {};

  constructor(private http: HttpClient) {}

  public get getMaterialData(): any {
    return this.materialData;
  }

  public set setMaterialData(value: any) {
    this.materialData = value;
  }

  getMaterialesAntiguedad(): Observable<any> {
    return this.http.get<any>(this.baseApiUrl+"/all/antiguedad");
  }

  getMaterialesNombre(): Observable<any> {
    return this.http.get<any>(this.baseApiUrl+"/all/nombre");
  }

  getMaterialById(id: number): Observable<any> {
    return this.http.get<any>(this.baseApiUrl+'/'+id)
  }

  crearMaterial(data: any): Observable<any>{
    return this.http.post<any>(this.baseApiUrl, data);
  }

  actualizarMaterial(data: any): Observable<any>{
    return this.http.put<any>(this.baseApiUrl+'/'+data.id, data);
  }

  borrarMaterial(id: number): Observable<any>{
    return this.http.delete<any>(this.baseApiUrl+'/'+id);
  }
}
