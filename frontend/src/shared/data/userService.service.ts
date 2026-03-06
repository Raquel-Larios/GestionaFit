import { Injectable} from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, map, Observable } from "rxjs";
import { Usuario } from "../../assets/models/usuario.interface";
import { AuthService } from "./authService.service";

@Injectable({ providedIn: 'root' })

export class UserService {
  private baseApiUrl = 'http://localhost:3000/api'; 
  userData: Usuario | any = null;
  
  private userDataSubject = new BehaviorSubject<Usuario | null>(null);
  public userData$ = this.userDataSubject.asObservable();

  private userRolSubject = new BehaviorSubject<number | null>(null);
  public userRol$ = this.userRolSubject.asObservable();

  constructor(private http: HttpClient, private authService: AuthService) {
    this.initializeUserData();
  }

  public get getUserData(): any {
    return this.userDataSubject.value;
  }

  public set setUserData(value: any) {
    this.userDataSubject.next(value);
    if (value?.data?.rol !== undefined) {
      this.userRolSubject.next(value.data.rol);
    }
  }

  public set setUserPicture(value : any) {
    const currentData = this.userDataSubject.value;
    if (currentData?.foto_perfil) {
      currentData.foto_perfil = value;
      this.userDataSubject.next(currentData);
    }
  }

  public get currentUserRol(): number | null {
    return this.userRolSubject.value;
  }

  private emitRolFromToken(): void {
    const token = localStorage.getItem('token');
    if (token && !this.authService.isTokenExpired(token)) {
      const decoded = this.authService.decodeToken(token);
      if (decoded.rol !== undefined && decoded.rol !== null) {
        this.userRolSubject.next(decoded.rol);
      }
    }
  }

  private loadClientData(userId: number): void {
    if (userId !== null && userId !== undefined) {
      this.getInfoCliente(userId).subscribe({
        next: (data) => {
          this.userDataSubject.next(data);
          if (data?.data?.rol !== undefined) {
            this.userRolSubject.next(data.data.rol);
          }
        },
        error: (err) => console.error('Error al cargar datos del usuario:', err)
      });
    }
  }

  private initializeUserData() {
    const token = localStorage.getItem('token');
    if (token && !this.authService.isTokenExpired(token)) {
      const decoded = this.authService.decodeToken(token);
      this.emitRolFromToken();
      this.loadClientData(decoded.id);
    }
  }

  public loadUserData(userId: number) {
    this.emitRolFromToken();
    this.loadClientData(userId);
  }

  public clearUserData() {
    this.userDataSubject.next(null);
    this.userRolSubject.next(null);
  }

  getClientes(): Observable<any> {
    return this.http.get<any>(this.baseApiUrl+'/clientes', this.userData);
  }

  private getInfoCliente(id: number): Observable<any> {
    return this.http.get<any>(this.baseApiUrl + '/' + id + '/datos').pipe(
      map(response => response)
    );
  }

  crearCliente(): Observable<any>{
    return this.http.post<any>(this.baseApiUrl+'/clientes', this.userData);
  }

  actualizarCliente(): Observable<any>{
    return this.http.put<any>(this.baseApiUrl+'/clientes/'+this.userData.userId, this.userData);
  }

  actualizarFotoPerfil(userId: number, photo: string): Observable<any> {
  return this.http.put(this.baseApiUrl+'/'+userId+'/profile/photo', photo);
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
