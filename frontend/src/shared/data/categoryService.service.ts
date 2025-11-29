import { Injectable} from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({ providedIn: 'root' })

export class CategoryService {
  private baseApiUrl = 'http://localhost:3000/api/categories/'; //TENGO QUE VER COMO CONCATENAR PARA LAS DE PUT Y DELETE
  categoryData: any = {};

  constructor(private http: HttpClient) {

  }
}
