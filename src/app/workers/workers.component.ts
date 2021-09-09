import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { GlobalVarsService } from '../services/global-vars.service';
import { MainService } from '../services/main.service';
import { WorkerService } from '../services/worker.service';
import { Worker } from '../classes/worker';
import { FilterByDateDialogComponent } from '../dialogs/filter-by-date-dialog/filter-by-date-dialog.component';
import { MatDialog } from '@angular/material/dialog';

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
    /* 'workerTell',
    'workerAdd', */
    'workerJopCateg',
    'workerJop',
    'workedDayes',
    'discoundDayes',
    'overDayes',
    'payLater',
    'cashReceived',
    'workerCurrentVal',
    'edit',
  ];

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  personsList: Worker[] = [];
  searchTxt: string = '';

  counts: { onUs: number; toUS: number } = { onUs: 0, toUS: 0 };

  searchDate: { from: string; to: string } = { from: '', to: '' };
  isFiltered: boolean = false;

  tableTotals = {
    cashReceived: 0,
    payLater: 0,
    workerCurrentVal: 0,
  };

  constructor(
    public _workerService: WorkerService,
    public _mainService: MainService,
    public _glopal: GlobalVarsService,
    public _dialog: MatDialog
  ) {
    this._glopal.currentHeader = 'بيانات الموظفين';
    this._glopal.loading = true;
  }

  ngOnInit(): void {
    window.addEventListener('resize', () => {
      this._mainService.handleTableHeight();
    });

    this.onStart('new');
  }

  search() {
    this.listData.filter = this.searchTxt;
  }

  getWorkersPromise(dateFrom?: string, dateTo?: string) {
    return new Promise((res) => {
      this._workerService
        .workerListByDate(dateFrom, dateTo)
        .subscribe((data: any[]) => res(data));
    });
  }

  onStart(cond: string, dateFrom?: string, dateTo?: string) {
    this._glopal.loading = true;
    this.searchTxt = '';

    if (cond == 'new') {
      const dateNow = new Date(Date.now());

      const month =
        dateNow.getMonth() + 1 < 10
          ? `0${dateNow.getMonth() + 1}`
          : dateNow.getMonth() + 1;
      // 2021-07-06

      let dateFrom = `${dateNow.getFullYear()}-${month}-01`;
      let dateTo = `${dateNow.getFullYear()}-${month}-30`;

      this.searchDate = { from: dateFrom, to: dateTo };
    }

    this.resetSearchByDate(dateFrom && dateTo ? true : false);

    this.getWorkersPromise(dateFrom, dateTo).then((data: any) => {
      this.fillListData(data);
      this.counts = this.generateCounts(data);
      this._mainService.handleTableHeight();
      this._glopal.loading = false;
    });
  }

  salaryTotals: {
    workedDays: number;
    overDayes: number;
    discounds: number;
    payLater: 0;
  } = {
    workedDays: 0,
    overDayes: 0,
    discounds: 0,
    payLater: 0,
  };

  setSalaryTotals(data: any) {
    /*
    cashReceived: 1450
    discoundDayes: 0.44
    lastWorked_date: "2021-07-07T15:02"
    overDayes: 0.04
    payLater: 0
    workedDayes: 6
    workerCheckIN: ""
    workerCheckOut: ""
    workerCurrentVal: 0
    workerFbCode: ""
    workerId: "13"
    workerJop: "سائق وتباع حفار1"
    workerJopCateg: "المعدات"
    workerJopDate: ""
    workerName: "نصر الدين شبانه انور"
    workerSalary: "7200"
    workerYearVacation: ""
    */

    this.salaryTotals = {
      workedDays: data
        .map((d: any) => d.workedDayes * (d.workerSalary / 30))
        .reduce((a: any, b: any) => a + b, 0),
      overDayes: data
        .map((d: any) => d.overDayes * (d.workerSalary / 30))
        .reduce((a: any, b: any) => a + b, 0),
      discounds: data
        .map((d: any) => d.discoundDayes)
        .reduce((a: any, b: any) => a + b, 0),
      payLater: data
        .map((d: any) => d.payLater)
        .reduce((a: any, b: any) => a + b, 0),
    };
  }

  resetSearchByDate(cond: boolean) {
    this.isFiltered = cond;
    if (!cond) this.searchDate = { from: '', to: '' };
  }

  generateCounts(data: any): { onUs: number; toUS: number } {
    const mappedForCount = data.map((d: any) => d.workerCurrentVal);

    return {
      onUs:
        mappedForCount
          .filter((a: any) => a < 0)
          .reduce((a: any, b: any) => a + b, 0) * -1,
      toUS: mappedForCount
        .filter((a: any) => a > 0)
        .reduce((a: any, b: any) => a + b, 0),
    };
  }

  fillListData = (data: any) => {
    this.listData = new MatTableDataSource(data);
    this.listData.sort = this.sort;
    this.listData.paginator = this.paginator;
    this.setSalaryTotals(data);

    this.tableTotals = this.getTableTotals(data);
  };

  getTableTotals(data: any) {
    const result = {
      cashReceived: data.reduce((a: any, b: any) => a + b.cashReceived, 0),
      payLater: data.reduce((a: any, b: any) => a + b.payLater, 0),
      workerCurrentVal: data.reduce(
        (a: any, b: any) => a + b.workerCurrentVal,
        0
      ),
    };

    return result;
  }

  openFilterDialog = (data: any) => {
    let dialogRef = this._dialog.open(FilterByDateDialogComponent, data);

    dialogRef.afterClosed().subscribe((result) => {
      if (result !== 'cancel') {
        this.searchDate = {
          from: result.fromDate,
          to: result.toDate,
        };
        this.filterByDate(result.fromDate, result.toDate);
      }
    });
  };

  filterByDate(from?: string, to?: string) {
    this.searchTxt = '';

    if (from && to) {
      /* let start = `${from}T00:00`;
      let end = `${to}T23:59`; */

      this.onStart('', from, to);
    }
  }

  printDocument() {
    window.print();
  }
}
