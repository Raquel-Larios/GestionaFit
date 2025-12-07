import { Injectable} from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({ providedIn: 'root' })

export class CategoryService {
  private baseApiUrl = 'http://localhost:3000/api/categories';
  private categoryData: any = {};

  constructor(private http: HttpClient) {}

  public get getCategoryData(): any {
    return this.categoryData;
  }

  public set setCategoryData(value: any) {
    this.categoryData = value;
  }

  getCategorias(): Observable<any> {
    return this.http.get<any>(this.baseApiUrl, this.categoryData);
  }

  crearCategoria(): Observable<any>{
    return this.http.post<any>(this.baseApiUrl, this.categoryData);
  }

  actualizarCategoria(): Observable<any>{
    return this.http.put<any>(this.baseApiUrl+'/'+this.categoryData.categoriaId, this.categoryData);
  }

  borrarCategoria(): Observable<any>{
    return this.http.delete<any>(this.baseApiUrl+'/'+this.categoryData.categoriaId, this.categoryData);
  }

  getAsignacionCategoria_Ejercicio(): Observable<any>{
    return this.http.get<any>(this.baseApiUrl+'/asignacion-categoria-ejercicio', this.categoryData);
  }

  crearAsignacionCategoria_Ejercicio(): Observable<any>{
    return this.http.post<any>(this.baseApiUrl+'/'+this.categoryData.categoriaId+'/'+this.categoryData.ejercicioId, this.categoryData);
  }

  eliminarAsignacionCategoria_Ejercicio(): Observable<any>{
    return this.http.delete<any>(this.baseApiUrl+'/'+this.categoryData.categoriaId+'/'+this.categoryData.ejercicioId, this.categoryData);
  }

}
