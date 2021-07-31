import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TaxesService {

  constructor(private http: HttpClient) {}

  url: string | null = localStorage.getItem('tmpDB');

  addTaxesList() {
    return this.http.get<any>(`${this.url}addTaxesList.php`);
  }
}
