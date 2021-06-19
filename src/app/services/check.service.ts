import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Bank } from '../classes/bank';
import { BankCheck } from '../classes/bankCheck';

@Injectable({
  providedIn: 'root'
})
export class CheckService {

  constructor(private http: HttpClient) { }

  // defult url
  url: string | null = localStorage.getItem('tmpDB');

  checkList(notPaid?: string) {
    if (notPaid) return this.http.get<BankCheck[]>(`${this.url}checkList.php?notPaid=1`);
    return this.http.get<BankCheck[]>(`${this.url}checkList.php`);
  }

  // banksList
  banksList() {
    return this.http.get<Bank[]>(`${this.url}banksList.php`);
  }

  getCheckById(id: string) {
    return this.http.get<BankCheck[]>(`${this.url}checkList.php?id=${id}`);
  }

  postBankCheck(bankCheck: BankCheck) {
    return this.http.post(`${this.url}postBankCheck.php`, bankCheck)
  };

  countNotPaidChecks(date: string) {
    return this.http.get<any[]>(`${this.url}countNotPaidChecks.php?reportDate=${date}`);
  }

  updateBankCheck(bankCheck: BankCheck) {
    return this.http.put(
      `${this.url}updateBankCheck.php?id=${bankCheck.checkId}`,
      bankCheck
    );
  }
}
