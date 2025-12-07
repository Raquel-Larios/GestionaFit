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

  getMaterial(): Observable<any> {
    return this.http.get<any>(this.baseApiUrl, this.materialData);
  }

  crearMaterial(): Observable<any>{
    return this.http.post<any>(this.baseApiUrl, this.materialData);
  }

  actualizarMaterial(): Observable<any>{
    return this.http.put<any>(this.baseApiUrl+'/'+this.materialData.materialId, this.materialData);
  }

  borrarMaterial(): Observable<any>{
    return this.http.delete<any>(this.baseApiUrl+'/'+this.materialData.materialId, this.materialData);
  }
}
