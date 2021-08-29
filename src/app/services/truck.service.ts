import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Truck } from '../classes/truck';
import { TruckCustomer } from '../classes/truck-customer';
import { TruckOrder } from '../classes/truck-order';

@Injectable({
  providedIn: 'root',
})
export class TruckService {
  constructor(private http: HttpClient) {}

  url: string | null = localStorage.getItem('tmpDB'); //'http://localhost/accounting/'

  postTruck(truck: Truck) {
    return this.http.post(`${this.url}postTruck.php`, truck);
  }

  postTruckCustomer(truckCustomer: TruckCustomer) {
    return this.http.post(`${this.url}postTruckCustomer.php`, truckCustomer);
  }

  updateTruckCustomer(truckCustomer: TruckCustomer) {
    return this.http.put(
      `${this.url}updateTruckCustomer.php?id=${truckCustomer.id}`,
      truckCustomer
    );
  }

  truckCustomersList(id?: string) {
    if (id)
      return this.http.get<TruckCustomer[]>(
        `${this.url}truckCustomersList.php?id=${id}`
      );
    return this.http.get<TruckCustomer[]>(`${this.url}truckCustomersList.php`);
  }

  postTruckOrder(truckOrder: TruckOrder) {
    return this.http.post(`${this.url}postTruckOrder.php`, truckOrder);
  }

  updateTruckOrder(truckOrder: TruckOrder, cond: string) {
    let updatebyId = '';
    if (cond == 'id') updatebyId = truckOrder.orderId ?? '';
    if (cond == 'transId') updatebyId = truckOrder.stockTransactionDetailsId;
    if (cond == 'bonId') updatebyId = truckOrder.concreteBonId;
    if (cond == 'concreteReceiptD_id')
      updatebyId = truckOrder.concreteReceiptD_id;

    return this.http.put(
      `${this.url}updateTruckOrder.php?${cond}=${updatebyId}`,
      truckOrder
    );
  }

  trucksList() {
    return this.http.get<Truck[]>(`${this.url}trucksList.php`);
  }

  ourTrucksAcc(from?: string, to?: string) {
    if (from && to)
      return this.http.get<TruckOrder[]>(
        `${this.url}ourTrucksAcc.php?fromDate=${from}&toDate=${to}`
      );
    return this.http.get<any[]>(`${this.url}ourTrucksAcc.php`);
  }
  // truckOrderList

  updateTruck(truck: Truck) {
    return this.http.put(`${this.url}updateTruck.php?id=${truck.id}`, truck);
  }

  truckOrderList(cond: string = 'id', id: string, from?: string, to?: string) {
    if (from && to)
      return this.http.get<TruckOrder[]>(
        `${this.url}truckOrderList.php?${cond}=${id}&fromDate=${from}&toDate=${to}`
      );

    return this.http.get<TruckOrder[]>(
      `${this.url}truckOrderList.php?${cond}=${id}`
    );
  }

  all_truckOrderList() {
    return this.http.get<TruckOrder[]>(`${this.url}truckOrderList.php`);
  }

  getPumpOrderList(
    cond: string = 'id',
    id: string,
    from?: string,
    to?: string
  ) {
    if (from && to)
      return this.http.get<TruckOrder[]>(
        `${this.url}getPumpOrderList.php?${cond}=${id}&fromDate=${from}&toDate=${to}`
      );

    return this.http.get<TruckOrder[]>(
      `${this.url}getPumpOrderList.php?${cond}=${id}`
    );
  }

  getTruckCustomerAcc(id: string) {
    return this.http.get<any[]>(`${this.url}getTruckCustomerAcc.php?id=${id}`);
  }

  deleteTruckOrder(id: number, cond: string = 'orderId') {
    return this.http.delete<TruckOrder[]>(
      `${this.url}deleteTruckOrder.php?${cond}=${id}`
    );
  }
}
