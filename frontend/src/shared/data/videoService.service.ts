import { Injectable} from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({ providedIn: 'root' })

export class VideoService {
  private baseApiUrl = 'http://localhost:3000/api/videos'; 
  videoData: any = {};

  constructor(private http: HttpClient) {}

  public get getVideoData(): any {
    return this.videoData;
  }

  public set setVideoData(value: any) {
    this.videoData = value;
  }

  getVideos(byNombre: boolean): Observable<any> {
    let params = new HttpParams();
    if (byNombre) {
      params = params.set('by_nombre', 'true');
    }
    return this.http.get<any>(this.baseApiUrl+"/all", {params});
  }

  getVideoById(id: number): Observable<any> {
    return this.http.get<any>(this.baseApiUrl+'/'+id)
  }

  crearVideo(data: any): Observable<any>{
    return this.http.post<any>(this.baseApiUrl, data);
  }

  actualizarVideo(data: any): Observable<any>{
    return this.http.put<any>(this.baseApiUrl+'/'+data.id, data);
  }

  borrarVideo(id: number): Observable<any>{
    return this.http.delete<any>(this.baseApiUrl+'/'+id);
  }

  getAsignacionVideo_Ejercicio(): Observable<any>{
    return this.http.get<any>(this.baseApiUrl+'/asignacion-video-ejercicio');
  }

  getAsignacionVideo_EjercicioById(id: number): Observable<any>{
    return this.http.get<any>(this.baseApiUrl+'/asignacion-video-ejercicio/'+id);
  }

  crearAsignacionVideo_Ejercicio(data: any): Observable<any>{
    return this.http.post<any>(this.baseApiUrl+'/asignar/'+data.id_video+'/'+data.id_ejercicio, data);
  }

  eliminarAsignacionVideo_Ejercicio(id: number): Observable<any>{
    return this.http.delete<any>(this.baseApiUrl+'/desasignar/'+id);
  }
}
