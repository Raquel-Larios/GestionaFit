import { Injectable} from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({ providedIn: 'root' })

export class MaterialService {
  private apiUrl = 'http://localhost:3000/api/'; //URL incompleta
  materialData: any = {};

  constructor(private http: HttpClient) {}
}
