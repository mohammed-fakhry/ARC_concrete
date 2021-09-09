import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TaxPayment } from '../classes/tax-payment';

@Injectable({
  providedIn: 'root'
})
export class TaxesService {

  constructor(private http: HttpClient) {}

  url: string | null = localStorage.getItem('tmpDB');

  addTaxesList() {
    return this.http.get<any>(`${this.url}addTaxesList.php`);
  }

  taxesPaymentList() {
    return this.http.get<TaxPayment[]>(
      `${this.url}taxesPaymentList.php`
    );
  }

  postTaxPayment(taxPayment: TaxPayment) {
    return this.http.post(`${this.url}postTaxPayment.php`, taxPayment);
  }

  updateTaxPayment(taxPayment: TaxPayment) {
    return this.http.put(
      `${this.url}updateTaxPayment.php?id=` + taxPayment.id,
      taxPayment
    );
  }
}
