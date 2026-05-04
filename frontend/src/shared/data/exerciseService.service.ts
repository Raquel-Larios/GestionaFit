import { Injectable} from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({ providedIn: 'root' })

export class ExerciseService {
  private baseApiUrl = 'http://localhost:3000/api/ejercicios'; 
  exerciseData: any = {};

  constructor(private http: HttpClient) {}

  public get getExerciseData(): any {
    return this.exerciseData;
  }

  public set setExerciseData(value: any) {
    this.exerciseData = value;
  }

  getEjercicios(byCategoria: boolean): Observable<any> {
    let params = new HttpParams();
    if (byCategoria) {
      params = params.set('by_categoria', 'true');
    }
    return this.http.get(this.baseApiUrl+'/all', { params });
  }

  getEjercicioById(id: number): Observable<any> {
    return this.http.get<any>(this.baseApiUrl+'/'+id)
  }

  crearEjercicio(data: any): Observable<any>{
    return this.http.post<any>(this.baseApiUrl, data);
  }

  actualizarEjercicio(data: any): Observable<any>{
    return this.http.put<any>(this.baseApiUrl+'/'+data.id, data);
  }

  borrarEjercicio(id: number): Observable<any>{
    return this.http.delete<any>(this.baseApiUrl+'/'+id);
  }

  getAsignacionEjercicio_Categoria(): Observable<any>{
    return this.http.get<any>(this.baseApiUrl+'/asignacion-ejercicio-categoria');
  }

  getAsignacionEjercicio_CategoriaById(id: number): Observable<any>{
    return this.http.get<any>(this.baseApiUrl+'/asignacion-ejercicio-categoria/'+id)
  }

  crearAsignacionEjercicio_Categoria(data: any): Observable<any>{
    return this.http.post<any>(this.baseApiUrl+'/asignacion-ejercicio-categoria/asignar/'+data.id_ejercicio+'/'+data.id_categoria, data);
  }

  eliminarAsignacionEjercicio_Categoria(data:any): Observable<any>{
    return this.http.delete<any>(this.baseApiUrl+'/asignacion-ejercicio-categoria/desasignar/'+data.id_ejercicio+'/'+data.id_categoria);
  }

  getAsignacionEjercicio_Video(): Observable<any>{
    return this.http.get<any>(this.baseApiUrl+'/asignacion-ejercicio-video');
  }

  getAsignacionEjercicio_VideoById(id:number): Observable<any>{
    return this.http.get<any>(this.baseApiUrl+'/asignacion-ejercicio-video/'+id)
  }

  crearAsignacionEjercicio_Video(data: any): Observable<any>{
    return this.http.post<any>(this.baseApiUrl+'/asignacion-ejercicio-video/asignar/'+data.id_ejercicio+'/'+data.id_video, data);
  }

  eliminarAsignacionEjercicio_Video(id:number): Observable<any>{
    return this.http.delete<any>(this.baseApiUrl+'/asignacion-ejercicio-video/desasignar/'+id);
  }
}
