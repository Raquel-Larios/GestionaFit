import { Injectable} from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({ providedIn: 'root' })

export class AuthService {
  private baseApiUrl = 'http://localhost:3000/api/auth';
  private authData: any = {};

  constructor(private http: HttpClient) {}

  public get getAuthData(): any {
    return this.authData;
  }
  public set setAuthData(value: any) {
    this.authData = value;
  }

  login(): Observable<any> {
    return this.http.post<any>(this.baseApiUrl+'/login', this.authData);
  }

  forgottenPass(): Observable<any> {
    return this.http.put<any>(this.baseApiUrl+'/forgotten-pass', this.authData)
  }

  
}