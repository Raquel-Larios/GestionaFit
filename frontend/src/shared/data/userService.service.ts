import { Injectable} from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({ providedIn: 'root' })

export class UserService {
  private baseApiUrl = 'http://localhost:3000/api'; 
  userData: any = {};

  constructor(private http: HttpClient) {}

  public get getUserData(): any {
    return this.userData;
  }

  public set setUserData(value: any) {
    this.userData = value;
  }

  getClientes(): Observable<any> {
    return this.http.get<any>(this.baseApiUrl+'/clientes', this.userData);
  }

  crearCliente(): Observable<any>{
    return this.http.post<any>(this.baseApiUrl+'/clientes', this.userData);
  }

  actualizarCliente(): Observable<any>{
    return this.http.put<any>(this.baseApiUrl+'/clientes/'+this.userData.userId, this.userData);
  }

  actualizarPerfil(): Observable<any>{
    return this.http.put<any>(this.baseApiUrl+'/'+this.userData.userId+'/profile', this.userData);
  }

  borrarCliente(): Observable<any>{
    return this.http.delete<any>(this.baseApiUrl+'/clientes/'+this.userData.userId, this.userData);
  }

  getAsignacionUsuario_Plantilla(): Observable<any>{
    return this.http.get<any>(this.baseApiUrl+'/clientes/'+this.userData.userId+'/'+this.userData.plantillaId, this.userData);
  }

  crearAsignacionUsuario_Plantilla(): Observable<any>{
    return this.http.post<any>(this.baseApiUrl+'/clientes/'+this.userData.userId+'/'+this.userData.plantillaId, this.userData);
  }

  eliminarAsignacionUsuario_Plantilla(): Observable<any>{
    return this.http.delete<any>(this.baseApiUrl+'/clientes/'+this.userData.userId+'/'+this.userData.plantillaId, this.userData);
  }
}
