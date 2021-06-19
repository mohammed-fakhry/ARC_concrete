import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { GlobalVarsService } from '../services/global-vars.service';
import { MainService } from '../services/main.service';
import { WorkerService } from '../services/worker.service';
import { Worker } from '../classes/worker';

@Component({
  selector: 'app-workers',
  templateUrl: './workers.component.html',
  styleUrls: ['./workers.component.scss'],
})
export class WorkersComponent implements OnInit {
  listData!: any;
  displayedColumns: string[] = [
    'workerId',
    'workerName',
    'workerTell',
    'workerAdd',
    'workerJopCateg',
    'workerJop',
    'workerCheckIN',
    'workerCheckOut',
  ];

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  personsList: Worker[] = [];
  searchTxt: string = '';

  constructor(
    public _workerService: WorkerService,
    public _mainService: MainService,
    public _glopal: GlobalVarsService
  ) {
    this._glopal.currentHeader = 'بيانات الموظفين';
    this._glopal.loading = true;
  }

  ngOnInit(): void {
    window.addEventListener('resize', () => {
      this._mainService.handleTableHeight();
    });

    this.getWorkers();
  }

  search() {
    this.listData.filter = this.searchTxt;
  }

  getWorkersPromise() {
    return new Promise((res) => {
      this._workerService.getWorker().subscribe((data: Worker[]) => res(data));
    });
  }

  getWorkers() {
    this._glopal.loading = true;
    this.getWorkersPromise().then((data: any) => {
      this.fillListData(data);
      this._mainService.handleTableHeight();
      this._glopal.loading = false;
    });
  }

  fillListData = (data: any) => {
    this.listData = new MatTableDataSource(data);
    this.listData.sort = this.sort;
    this.listData.paginator = this.paginator;
  };
}
