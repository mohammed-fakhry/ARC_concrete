import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ClientPayment } from '../classes/client-payment';
import { ClientsData } from '../classes/clients-data';

@Injectable({
  providedIn: 'root'
})
export class ClientsService {

  url: string | null = localStorage.getItem('tmpDB');

  constructor(private http: HttpClient) { }

  getClients(id?: string) {
    if(id) return this.http.get<ClientsData[]>(`${this.url}clientsList.php?id=${id}`);
    return this.http.get<ClientsData[]>(`${this.url}clientsList.php`);
  };

  creatClient(client: ClientsData) {
    return this.http.post(`${this.url}postClient.php`, client)
  };

  updateClient(client: ClientsData) {
    return this.http.put(`${this.url}editeClient.php?id=` + client.clientId, client )
  };

  getClientPayment(id?: string) {
    if (id) return this.http.get<ClientPayment[]>(`${this.url}clientsPaymentList.php?id=${id}`);
    return this.http.get<ClientPayment[]>(`${this.url}clientsPaymentList.php`);
  };

  creatClientPayment(clientPayment: ClientPayment) {
    return this.http.post(`${this.url}postClientPayment.php`, clientPayment);
  };

  updateClientPayment(clientPayment: ClientPayment) {
    return this.http.put(`${this.url}updateClientPayment.php?id=` + clientPayment.paymentId, clientPayment );
  };

  deleteClientPayment(id: number) {
    return this.http.delete<ClientPayment>(`${this.url}deletClientPayment.php?id=` + id);
  };
}
