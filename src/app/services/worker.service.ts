import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { EmployeeWorkedDayes } from '../classes/employee-worked-dayes';
import { Worker } from '../classes/worker';

@Injectable({
  providedIn: 'root',
})
export class WorkerService {
  url: string | null = localStorage.getItem('tmpDB');

  constructor(public http: HttpClient, public router: Router) {}

  getWorker(id?: string) {
    if (id) return this.http.get<Worker[]>(`${this.url}list.php?id=${id}`);
    return this.http.get<Worker[]>(`${this.url}list.php`);
  }

  creatEmployee(employee: Worker) {
    return this.http.post(`${this.url}postEmployee.php`, employee);
  }

  deleteWorkerSer(id: number) {
    return this.http.delete<Worker>(`${this.url}deleteEmployee.php?id=` + id);
  }

  deleteEmployeeWorkedDayes(id: string) {
    return this.http.delete<EmployeeWorkedDayes>(
      `${this.url}deleteEmployeeWorkedDayes.php?id=${id}`
    );
  }

  updateWorkerSer(employee: Worker) {
    return this.http.put(
      `${this.url}updateEmployee.php?id=` + employee.workerId,
      employee
    );
  }

  postEmployeeWorkedDayes(workedDayes: EmployeeWorkedDayes) {
    return this.http.post(
      `${this.url}postEmployeeWorkedDayes.php`,
      workedDayes
    );
  }

  updateEmployeeWorkedDayes(workedDayes: EmployeeWorkedDayes) {
    return this.http.put(
      `${this.url}updateEmployeeWorkedDayes.php?id=` + workedDayes.id,
      workedDayes
    );
  }

  workerAcc(id: string) {
    return this.http.get<any[]>(`${this.url}workerAcc.php?id=${id}`);
  }

  getEmployeeWorkedDays(id: string) {
    return this.http.get<EmployeeWorkedDayes[]>(
      `${this.url}getEmployeeWorkedDays.php?id=${id}`
    );
  }

  workerListByDate(dateFrom?: string, dateTo?: string) {
    if (dateFrom && dateTo)
      return this.http.get<any[]>(
        `${this.url}workerListByDate.php?fromDate=${dateFrom}&toDate=${dateTo}`
      );
    else return this.http.get<any[]>(`${this.url}workerListByDate.php`);
  }
}
