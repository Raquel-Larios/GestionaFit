import { Injectable} from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({ providedIn: 'root' })

export class CategoryService {
  private baseApiUrl = 'http://localhost:3000/api/categorias';
  private categoryData: any = {};

  constructor(private http: HttpClient) {}

  public get getCategoryData(): any {
    return this.categoryData;
  }

  public set setCategoryData(value: any) {
    this.categoryData = value;
  }

  getCategorias(): Observable<any> {
    return this.http.get<any>(this.baseApiUrl+"/all");
  }

  getCategoriaById(id: number): Observable<any> {
    return this.http.get<any>(this.baseApiUrl+'/'+id)
  }

  crearCategoria(data: any): Observable<any>{
    return this.http.post<any>(this.baseApiUrl, data);
  }

  actualizarCategoria(data: any): Observable<any>{
    return this.http.put<any>(this.baseApiUrl+'/'+data.id, data);
  }

  borrarCategoria(id: number): Observable<any>{
    return this.http.delete<any>(this.baseApiUrl+'/'+id);
  }

  getAsignacionCategoria_Ejercicio(): Observable<any>{
    return this.http.get<any>(this.baseApiUrl+'/asignacion-categoria-ejercicio');
  }

  getAsignacionCategoria_EjercicioById(id: number): Observable<any>{
    return this.http.get<any>(this.baseApiUrl+'/asignacion-categoria-ejercicio/'+id)
  }

  crearAsignacionCategoria_Ejercicio(data: any): Observable<any>{
    return this.http.post<any>(this.baseApiUrl+'/'+data.id_categoria+'/'+data.id_ejercicio, data);
  }

  eliminarAsignacionCategoria_Ejercicio(data: any): Observable<any>{
    return this.http.delete<any>(this.baseApiUrl+'/'+data.id_categoria+'/'+data.id_ejercicio);
  }

}
