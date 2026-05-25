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

  private currentUserSubject = new BehaviorSubject<any>(this.getUserFromToken());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  public getUserFromToken(): any {
    const token = localStorage.getItem('token');
    if (token && !this.jwtHelper.isTokenExpired(token)) {
      return this.jwtHelper.decodeToken(token);
    }
    return null;
  }

  public get currentUserValue(): any {
    return this.currentUserSubject.value;
  }

  public set currentUserValue(user : any){
    this.currentUserSubject.next(user);
  }

  public get authDataValue(): any {
    return this.authData;
  }
  public set authDataValue(value: any) {
    this.authData = value;
  }

  login(): Observable<any> {
    return this.http.post<any>(this.baseApiUrl+'/login', this.authData).pipe(
      tap (res => {
        const token = res.token;
        if (token && !this.jwtHelper.isTokenExpired(token)) {
          localStorage.setItem('token', token);
          const decoded = this.jwtHelper.decodeToken(token);
          this.isLoggedInSubject.next(true);
          this.currentUserSubject.next(decoded);
        } else {
          console.error('No se recibió token.');
        }
    }));
  }

  forgottenPass(data: any): Observable<any> {
    return this.http.put<any>(this.baseApiUrl+'/forgotten-pass', data)
  }

  logout() {
    localStorage.removeItem('token');
    this.isLoggedInSubject.next(false);
    this.currentUserSubject.next(null);
  }

  
}