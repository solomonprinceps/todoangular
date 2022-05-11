import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { first, shareReplay, take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class BackendService {
  constructor(private http: HttpClient) { }

  createTodo(obj:any) {
    return this.http.post(`${environment.api}/todo/create`, obj);
  }

  listTodos(obj:any) {
    return this.http.post(`${environment.api}/todo/list`, obj);
  }

  singletodo(data:string) {
    return this.http.get(`${environment.api}/todo/${data}`);
  }

  deletetodo(data:string) {
    return this.http.delete(`${environment.api}/todo/delete/${data}`);
  }

  clearCompleted() {
    return this.http.delete(`${environment.api}/complete/todo/clear`);
  }


  completetodo(data:string) {
    return this.http.get(`${environment.api}/complete/todo/${data}`);
  }

  movetoactive(data:string) {
    return this.http.get(`${environment.api}/move/todo/active/${data}`);
  }

  paginate(obj:any, url:any) {
    return this.http.post(url, obj);
  }

}
