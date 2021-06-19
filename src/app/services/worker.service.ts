import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Worker } from '../classes/worker';

@Injectable({
  providedIn: 'root'
})
export class WorkerService {

  url: string | null = localStorage.getItem('tmpDB');

  constructor(
    public http: HttpClient,
    public router: Router,
  ) { }

  getWorker(id?: string) {
    if (id) return this.http.get<Worker[]>(`${this.url}list.php?id=${id}`);
    return this.http.get<Worker[]>(`${this.url}list.php`);
  };

  creatEmployee(employee: Worker) {
    return this.http.post(`${this.url}postEmployee.php`, employee)
  };

  deleteWorkerSer(id: number) {
    return this.http.delete<Worker>(`${this.url}deleteEmployee.php?id=` + id)
  };

  updateWorkerSer(employee: Worker) {
    return this.http.put(`${this.url}updateEmployee.php?id=` + employee.workerId, employee)
  };

}
