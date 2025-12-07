import { Injectable} from "@angular/core";
import { HttpClient } from "@angular/common/http";
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

  getEjercicios(): Observable<any> {
    return this.http.get<any>(this.baseApiUrl, this.exerciseData);
  }

  crearEjercicio(): Observable<any>{
    return this.http.post<any>(this.baseApiUrl, this.exerciseData);
  }

  actualizarEjercicio(): Observable<any>{
    return this.http.put<any>(this.baseApiUrl+'/'+this.exerciseData.ejercicioId, this.exerciseData);
  }

  borrarEjercicio(): Observable<any>{
    return this.http.delete<any>(this.baseApiUrl+'/'+this.exerciseData.ejercicioId, this.exerciseData);
  }

  getAsignacionEjercicio_Categoria(): Observable<any>{
    return this.http.get<any>(this.baseApiUrl+'/asignacion-ejercicio-categoria', this.exerciseData);
  }

  crearAsignacionEjercicio_Categoria(): Observable<any>{
    return this.http.post<any>(this.baseApiUrl+'/'+this.exerciseData.ejercicioId+'/'+this.exerciseData.categoriaId, this.exerciseData);
  }

  eliminarAsignacionEjercicio_Categoria(): Observable<any>{
    return this.http.delete<any>(this.baseApiUrl+'/'+this.exerciseData.ejercicioId+'/'+this.exerciseData.categoriaId, this.exerciseData);
  }

  getAsignacionEjercicio_Video(): Observable<any>{
    return this.http.get<any>(this.baseApiUrl+'/asignacion-ejercicio-video', this.exerciseData);
  }

  crearAsignacionEjercicio_Video(): Observable<any>{
    return this.http.post<any>(this.baseApiUrl+'/'+this.exerciseData.ejercicioId+'/'+this.exerciseData.videoId, this.exerciseData);
  }

  eliminarAsignacionEjercicio_Video(): Observable<any>{
    return this.http.delete<any>(this.baseApiUrl+'/desasignar'+'/'+this.exerciseData.ejercicioId, this.exerciseData);
  }
}
