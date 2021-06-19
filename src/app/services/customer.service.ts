import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Customer } from '../classes/customer';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  constructor(private http: HttpClient) { }

  // defult url
  url: string | null = localStorage.getItem('tmpDB');

  getCustomer(id?: string) {
    if (id) return this.http.get<Customer[]>(`${this.url}customerList.php?id=${id}`);
    return this.http.get<Customer[]>(`${this.url}customerList.php`);
  }

  /* searchCustomers(searchFor: string) {
    return this.http.get<Customer[]>(`${this.url}customerList.php?searchFor=${searchFor}`);
  } */

  creatCustomer(customer: Customer) {
    return this.http.post(`${this.url}postCustomer.php`, customer)
  };

  getCustomerAcc(id: string) {
    return this.http.get<any[]>(`${this.url}getCustomerAcc.php?id=${id}`)
  }

  deleteCustomer(id: number) {
    return this.http.delete<Customer[]>(`${this.url}deleteCustomer.php?id=` + id)
  }

  updateCustomer(customer: Customer) {
    return this.http.put(`${this.url}updateCustomer.php?id=` + customer.customerId, customer)
  }
}
