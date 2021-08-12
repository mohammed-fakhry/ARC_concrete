import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ChangedReciepts } from '../classes/changed-reciepts';
import { OtherAcc } from '../classes/other-acc';
import { SafeData } from '../classes/safe-data';
import { SafeReceipt } from '../classes/safe-receipt';

@Injectable({
  providedIn: 'root',
})
export class SafeService {
  constructor(private http: HttpClient) {}

  url: string | null = localStorage.getItem('tmpDB');

  creatSafe(safe: SafeData) {
    return this.http.post(`${this.url}postSafe.php`, safe);
  }

  getSafes(id?: string) {
    if (id)
      return this.http.get<SafeData[]>(`${this.url}getSafesList.php?id=${id}`);
    return this.http.get<SafeData[]>(`${this.url}getSafesList.php`);
  }

  getsafeTranseAction(id: string) {
    return this.http.get<any[]>(`${this.url}safeTranseAction.php?id=${id}`);
  }

  updateSafeData(safe: SafeData) {
    return this.http.put(
      `${this.url}updateSafeData.php?id=` + safe.safeId,
      safe
    );
  }

  getSafesReceipt(id?: string) {
    if (id)
      return this.http.get<SafeReceipt[]>(
        `${this.url}safeReceiptList.php?id=${id}`
      );
    return this.http.get<SafeReceipt[]>(`${this.url}safeReceiptList.php`);
  }

  getReceiptSearchVal(cond: string) {
    return this.http.get<any[]>(
      `${this.url}getRecieptSearchVals.php?cond=${cond}`
    );
  }

  creatSafeReceipt(safeReceipt: SafeReceipt) {
    return this.http.post(`${this.url}postSafeReceipt.php`, safeReceipt);
  }

  updateSafeReceipt(safeReceipt: SafeReceipt) {
    return this.http.put(
      `${this.url}updateSafeReceipt.php?id=` + safeReceipt.safeReceiptId,
      safeReceipt
    );
  }

  deleteSafeReciept(id: number) {
    return this.http.delete<SafeReceipt[]>(
      `${this.url}deleteSafeReciept.php?id=` + id
    );
  }

  getOtherAcc(id?: string) {
    if (id)
      return this.http.get<OtherAcc[]>(
        `${this.url}otherAccountsList.php?id=${id}`
      );
    return this.http.get<OtherAcc[]>(`${this.url}otherAccountsList.php`);
  }

  getOtherAccByDate(from: string, to: string) {
    return this.http.get<any[]>(
      `${this.url}otherAccountsList.php?fromDate=${from}&toDate=${to}`
    );
  }

  getTruckOtherAcc(id: string, from?: string, to?: string) {
    if (from && to)
      return this.http.get<any[]>(
        `${this.url}otherAccountsList.php?truckId=${id}&fromDate=${from}&toDate=${to}`
      );
    return this.http.get<OtherAcc[]>(
      `${this.url}otherAccountsList.php?truckId=${id}`
    );
  }

  creatOtherAcc(acc: OtherAcc) {
    return this.http.post(`${this.url}postOtherAcc.php`, acc);
  }

  getotherAccTransaction(id: string, from?: string, to?: string) {
    if (from && to)
      return this.http.get<any[]>(
        `${this.url}otherAccTransaction.php?id=${id}&fromDate=${from}&toDate=${to}`
      );
    return this.http.get<any[]>(`${this.url}otherAccTransaction.php?id=${id}`);
  }

  updateOtherAcc(acc: OtherAcc) {
    return this.http.put(
      `${this.url}updateOtherAccounts.php?id=` + acc.accId,
      acc
    );
  }

  lastReciepts() {
    return this.http.get<any[]>(`${this.url}lastReciepts.php`);
  }

  // countReciepts
  getcountReciepts(reportDate: string) {
    return this.http.get<any[]>(
      `${this.url}countReciepts.php?reportDate=${reportDate}`
    );
  }

  postChangedReciept(safeChanged: ChangedReciepts) {
    return this.http.post(`${this.url}postChangedReciept.php`, safeChanged);
  }

  receiptChangesList() {
    return this.http.get<ChangedReciepts[]>(
      `${this.url}receiptChangesList.php`
    );
  }
}
