import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Concrete } from '../classes/concrete';
import { ConcreteBon } from '../classes/concrete-bon';
import { ConcreteCustomer } from '../classes/concrete-customer';
import { ConcreteMaterial } from '../classes/concrete-material';
import { ConcreteReceipDetails } from '../classes/concrete-receip-details';
import { ConcreteReceipt } from '../classes/concrete-receipt';

@Injectable({
  providedIn: 'root',
})
export class ConcreteService {
  constructor(private http: HttpClient) {}

  url: string | null = localStorage.getItem('tmpDB');

  concreteList() {
    return this.http.get<Concrete[]>(`${this.url}concreteList.php`);
  }

  postConcrete(concrete: Concrete) {
    return this.http.post(`${this.url}postConcrete.php`, concrete);
  }

  updateConcrete(concrete: Concrete) {
    return this.http.put(
      `${this.url}updateConcrete.php?id=${concrete.id}`,
      concrete
    );
  }

  postConcreteMaterial(concreteMaterial: ConcreteMaterial) {
    return this.http.post(
      `${this.url}postConcreteMaterial.php`,
      concreteMaterial
    );
  }

  updateConcreteMaterial(concreteMaterial: ConcreteMaterial) {
    return this.http.put(
      `${this.url}updateConcreteMaterial.php?id=${concreteMaterial.concreteMaterial_id}`,
      concreteMaterial
    );
  }

  /* concreteCustomer */

  concreteCustomerList(id?: string) {
    if (id)
      return this.http.get<ConcreteCustomer[]>(
        `${this.url}concreteCustomerList.php?id=${id}`
      );
    return this.http.get<ConcreteCustomer[]>(
      `${this.url}concreteCustomerList.php`
    );
  }

  concreteCustomerAcc(id: string) {
    return this.http.get<any[]>(`${this.url}concreteCustomerAcc.php?id=${id}`);
  }

  postConcreteCustomer(concreteCustomer: ConcreteCustomer) {
    return this.http.post(
      `${this.url}postConcreteCustomer.php`,
      concreteCustomer
    );
  }

  updateConcreteCustomer(concreteCustomer: ConcreteCustomer) {
    return this.http.put(
      `${this.url}updateConcreteCustomer.php?id=${concreteCustomer.id}`,
      concreteCustomer
    );
  }

  getCustomerCementUses(id: string) {
    return this.http.get<any[]>(
      `${this.url}getCustomerCementUses.php?id=${id}`
    );
  }

  /* ConcreteReceipt */

  postConcreteReceipt(concreteReceipt: ConcreteReceipt) {
    return this.http.post(
      `${this.url}postConcreteReceipt.php`,
      concreteReceipt
    );
  }

  updateConcreteReceipt(concreteReceipt: ConcreteReceipt) {
    return this.http.put(
      `${this.url}updateConcreteReceipt.php?id=${concreteReceipt.concreteReceipt_id}`,
      concreteReceipt
    );
  }

  getConcreteReciept(id: string) {
    return this.http.get<ConcreteReceipt[]>(
      `${this.url}getConcreteReciept.php?id=${id}`
    );
  }

  postConcreteReceipt_d(concreteReceipt_d: ConcreteReceipDetails) {
    return this.http.post(
      `${this.url}postConcreteReceipt_d.php`,
      concreteReceipt_d
    );
  }

  updateConcreteReceipt_d(concreteReceipt_d: ConcreteReceipDetails) {
    return this.http.put(
      `${this.url}updateConcreteReceipt_d.php?id=${concreteReceipt_d.id}`,
      concreteReceipt_d
    );
  }

  concreteReceiptList() {
    return this.http.get<any[]>(`${this.url}concreteReceiptList.php`);
  }

  /* concreteBon */

  concreteBonList(id?: string) {
    if (id)
      return this.http.get<ConcreteBon[]>(
        `${this.url}concreteBonList.php?id=${id}`
      );
    return this.http.get<ConcreteBon[]>(`${this.url}concreteBonList.php`);
  }

  concreteListByBon(date: string, customerId: string) {
    return this.http.get<ConcreteBon[]>(
      `${this.url}concreteBonList.php?date=${date}&customerId=${customerId}`
    );
  }

  postConcreteBon(concreteBon: ConcreteBon) {
    return this.http.post(`${this.url}postConcreteBon.php`, concreteBon);
  }

  updateConcreteBon(concreteBon: ConcreteBon) {
    return this.http.put(
      `${this.url}updateConcreteBon.php?id=${concreteBon.bonId}`,
      concreteBon
    );
  }

  putReceiptIdToConcreteBone(concreteBon: ConcreteBon) {
    return this.http.put(
      `${this.url}putReceiptIdToConcreteBone.php?id=${concreteBon.bonId}`,
      concreteBon
    );
  }
}
