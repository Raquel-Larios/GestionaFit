import { Injectable} from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({ providedIn: 'root' })

export class VideoService {
  private baseApiUrl = 'http://localhost:3000/api/demostraciones'; 
  videoData: any = {};

  constructor(private http: HttpClient) {}

  public get getVideoData(): any {
    return this.videoData;
  }

  public set setVideoData(value: any) {
    this.videoData = value;
  }

  getVideos(): Observable<any> {
    return this.http.get<any>(this.baseApiUrl, this.videoData);
  }

  crearVideo(): Observable<any>{
    return this.http.post<any>(this.baseApiUrl, this.videoData);
  }

  actualizarVideo(): Observable<any>{
    return this.http.put<any>(this.baseApiUrl+'/'+this.videoData.ejercicioId, this.videoData);
  }

  borrarVideo(): Observable<any>{
    return this.http.delete<any>(this.baseApiUrl+'/'+this.videoData.ejercicioId, this.videoData);
  }

  getAsignacionVideo_Ejercicio(): Observable<any>{
    return this.http.get<any>(this.baseApiUrl+'/asignacion-video-ejercicio', this.videoData);
  }

  crearAsignacionVideo_Ejercicio(): Observable<any>{
    return this.http.post<any>(this.baseApiUrl+'/'+this.videoData.videoId+'/'+this.videoData.ejercicioId, this.videoData);
  }

  eliminarAsignacionVideo_Ejercicio(): Observable<any>{
    return this.http.delete<any>(this.baseApiUrl+'/desasignar/'+this.videoData.videoId, this.videoData);
  }
}
