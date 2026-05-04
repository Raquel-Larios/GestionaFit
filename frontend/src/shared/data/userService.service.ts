import { Injectable} from "@angular/core";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { BehaviorSubject, map, Observable, tap } from "rxjs";
import { Usuario } from "../../assets/models/usuario.interface";
import { AuthService } from "./authService.service";

@Injectable({ providedIn: 'root' })

export class UserService {
  private baseApiUrl = 'http://localhost:3000/api'; 
  userTokenData: Usuario | any = null;
  private usuarioData: any = {};
  
  //GESTIÓN DE TOKEN
  private userTokenDataSubject = new BehaviorSubject<Usuario | null>(null);
  public userTokenData$ = this.userTokenDataSubject.asObservable();

  private userRolSubject = new BehaviorSubject<number | null>(null);
  public userRol$ = this.userRolSubject.asObservable();

  constructor(private http: HttpClient, private authService: AuthService) {
    this.initializeUserData();
  }

  public get getUserData(): any {
    return this.userTokenDataSubject.value;
  }

  public set setUserData(value: any) {
    this.userTokenDataSubject.next(value);
    if (value?.data?.rol !== undefined) {
      this.userRolSubject.next(value.data.rol);
    }
  }

  public set setUserPicture(value : any) {
    const currentData = this.userTokenDataSubject.value;
    if (currentData?.foto_perfil) {
      currentData.foto_perfil = value;
      this.userTokenDataSubject.next(currentData);
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

  private loadUserData(userId: number): void {
    if (userId !== null && userId !== undefined) {
      this.getInfoUser(userId).subscribe({
        next: (data) => {
          this.userTokenDataSubject.next(data);
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
      this.loadUserData(decoded.id);
    }
  }

  public loadTokenData(userId: number) {
    this.emitRolFromToken();
    this.loadUserData(userId);
  }

  public clearTokenData() {
    this.userTokenDataSubject.next(null);
    this.userRolSubject.next(null);
  }

  //LLAMADAS A BACK

  public get getUsuarioData(): any {
    return this.usuarioData;
  }

  public set setUsuarioData(value: any) {
    this.usuarioData = value;
  }

  getClientes(byNombre: boolean): Observable<any> {
    let params = new HttpParams();
    if (byNombre) {
      params = params.set('by_nombre', 'true');
    }
    return this.http.get<any>(this.baseApiUrl+'/clientes', {params});
  }

  private getInfoUser(id: number): Observable<any> {
    return this.http.get<any>(this.baseApiUrl + '/' + id + '/profile').pipe(
      map(response => response)
    );
  }

  getClienteById(id: number): Observable<any> {
    return this.http.get<any>(this.baseApiUrl+'/clientes/'+id)
  }

  getUserById(id:number): Observable<any> {
    return this.http.get<any>(this.baseApiUrl+'/'+id+'/profile')
  }

  crearCliente(data: any): Observable<any>{
    return this.http.post<any>(this.baseApiUrl+'/clientes', data);
  }

  actualizarCliente(data: any): Observable<any>{
    return this.http.put<any>(this.baseApiUrl+'/clientes/'+data.id, data);
  }

  actualizarFotoPerfil(id: number, photo: any): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this.http.put(this.baseApiUrl+'/'+id+'/profile/photo', photo, { headers });
  }

  actualizarPerfil(data: any): Observable<any>{
    return this.http.put<any>(this.baseApiUrl+'/'+data.id+'/profile', data)
    .pipe(tap(user => this.authService.currentUserValue = user));
  }

  borrarCliente(id: number): Observable<any>{
    return this.http.delete<any>(this.baseApiUrl+'/clientes/'+id);
  }

  getAsignacionUsuario_Plantilla(): Observable<any>{
    return this.http.get<any>(this.baseApiUrl+'/clientes/'+this.usuarioData.userId+'/'+this.usuarioData.plantillaId, this.usuarioData);
  }

  crearAsignacionUsuario_Plantilla(): Observable<any>{
    return this.http.post<any>(this.baseApiUrl+'/clientes/'+this.usuarioData.userId+'/'+this.usuarioData.plantillaId, this.usuarioData);
  }

  eliminarAsignacionUsuario_Plantilla(): Observable<any>{
    return this.http.delete<any>(this.baseApiUrl+'/clientes/'+this.usuarioData.userId+'/'+this.usuarioData.plantillaId, this.usuarioData);
  }
}
