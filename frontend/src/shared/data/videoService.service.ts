import { Injectable} from "@angular/core";
import { HttpClient } from "@angular/common/http";
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

  getVideosAntiguedad(): Observable<any> {
    return this.http.get<any>(this.baseApiUrl+"/all/antiguedad");
  }

  getVideosNombre(): Observable<any> {
    return this.http.get<any>(this.baseApiUrl+"/all/nombre");
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

  crearAsignacionVideo_Ejercicio(data: any): Observable<any>{
    return this.http.post<any>(this.baseApiUrl+'/'+data.id_video+'/'+data.id_ejercicio, data);
  }

  eliminarAsignacionVideo_Ejercicio(id: number): Observable<any>{
    return this.http.delete<any>(this.baseApiUrl+'/desasignar/'+id);
  }
}
