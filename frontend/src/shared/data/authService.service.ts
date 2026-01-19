import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Observable, tap } from "rxjs";
import { JwtHelperService } from "@auth0/angular-jwt";

@Injectable({ providedIn: 'root' })

export class AuthService {
  private baseApiUrl = 'http://localhost:3000/api/auth';
  private authData: any = {};

  private jwtHelper = inject(JwtHelperService);
  decodeToken(token: string) {
    return this.jwtHelper.decodeToken(token);
  }

  isTokenExpired(token: string) {
    return this.jwtHelper.isTokenExpired(token);
  }

  private isLoggedInSubject = new BehaviorSubject<boolean>(!!localStorage.getItem('token'));
  isLoggedIn$ = this.isLoggedInSubject.asObservable();
  isAdmin = false;

  constructor(private http: HttpClient) {}

  public get getAuthData(): any {
    return this.authData;
  }
  public set setAuthData(value: any) {
    this.authData = value;
  }

  login(): Observable<any> {

    return this.http.post<any>(this.baseApiUrl+'/login', this.authData).pipe(
      tap (res => {
        console.log('Respuesta completa:', res);
        const token = res.token;
        if (token && !this.jwtHelper.isTokenExpired(token)) {
          localStorage.setItem('token', token);
          console.log('Token guardado:', localStorage.getItem('token')); // Verifica aquí
          this.isLoggedInSubject.next(true);
        } else {
          console.error('No se recibió token');
        }
    }));
  }

  forgottenPass(): Observable<any> {
    return this.http.put<any>(this.baseApiUrl+'/forgotten-pass', this.authData)
  }

  logout() {
    localStorage.removeItem('token');
    this.isLoggedInSubject.next(false);
  }

  
}