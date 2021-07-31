import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { OtherAcc } from 'src/app/classes/other-acc';
import { MainService } from 'src/app/services/main.service';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalVarsService } from 'src/app/services/global-vars.service';
import { SafeService } from 'src/app/services/safe.service';
import { MatDialog } from '@angular/material/dialog';
import { FilterByDateDialogComponent } from 'src/app/dialogs/filter-by-date-dialog/filter-by-date-dialog.component';
import { AccHeaderTotals } from 'src/app/classes/acc-header-totals';

@Component({
  selector: 'app-other-acc-information',
  templateUrl: './other-acc-information.component.html',
  styleUrls: ['./other-acc-information.component.scss'],
})
export class OtherAccInformationComponent implements OnInit {
  id: string | null = null;
  accInfo: OtherAcc = new OtherAcc();

  listData: MatTableDataSource<any> | any;

  displayedColumns: string[] = [
    'id',
    'date_time',
    'receiptKind',
    'minVal',
    'addVal',
    'balance',
    'recieptNote',
  ];

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  searchTxt: string = '';
  accArr: any[] = [];
  isFiltered: boolean = false;
  headerTotals: AccHeaderTotals = new AccHeaderTotals();
  searchDate: { from: string; to: string } = { from: '', to: '' };
  tempAccArry: any[] = [];

  constructor(
    public _mainService: MainService,
    public activeRoute: ActivatedRoute,
    public _router: Router,
    public _glopal: GlobalVarsService,
    public _safeService: SafeService,
    public _dialog: MatDialog
  ) {
    this._glopal.loading = true;
  }

  ngOnInit(): void {
    window.addEventListener('resize', () => {
      this._mainService.handleTableHeight();
    });

    this.id = this.activeRoute.snapshot.paramMap.get('id');
    this.onStart();
  }

  onStart() {
    Promise.all([this.getOtherAccTransaction(), this.getOtherAcc()]).then(
      (data: any[]) => {
        let accTransList: any[] = data[0];
        let accList: OtherAcc[] = data[1];
        let parseId: number;

        let nameForHeader = '';

        if (this.id) {
          parseId = parseInt(this.id);
          let foundAcc = accList.find((acc) => acc.accId == parseId);
          if (foundAcc) this.accInfo = foundAcc;

          nameForHeader =
            this.id == 'workerId' ? 'رواتب الموظفين' : this.accInfo.AccName;
        }
        this._glopal.currentHeader = `حركة حساب | ${nameForHeader}`;

        let listData = this.makeSafeAcc(accTransList);
        this.fillListData(listData);
        this._mainService.handleTableHeight();
        this._glopal.loading = false;
      }
    );
  }

  getOtherAccTransaction(from?: string, to?: string) {
    return new Promise((res) => {
      if (this.id)
        this._safeService
          .getotherAccTransaction(this.id, from, to)
          .subscribe((data: any[]) => res(data));
    });
  }

  getOtherAcc() {
    return new Promise((res) => {
      this._safeService
        .getOtherAcc()
        .subscribe((data: OtherAcc[]) => res(data));
    });
  }

  makeSafeAcc(data: any[]) {
    this.accArr = [];

    for (let i = 0; i < data.length; i++) {
      let minVal = data[i].receiptKind.includes('ايصال استلام نقدية')
        ? data[i].receiptVal
        : 0;
      let addVal = data[i].receiptKind.includes('ايصال صرف نقدية')
        ? data[i].receiptVal
        : 0;
      let balance: number;

      if (i === 0) {
        balance = addVal - minVal;
      } else {
        balance = addVal - minVal + this.accArr[i - 1].balance;
      }

      let newData = {
        id: i + 1,
        safeReceiptId: data[i].safeReceiptId,
        receiptKind: data[i].receiptKind,
        receiptDetail: data[i].AccName,
        minVal: minVal,
        addVal: addVal,
        balance: balance,
        date_time: data[i].date_time.replace('T', ' '),
        recieptNote: data[i].recieptNote,
      };
      this.accArr = [...this.accArr, newData];
    }
    let result = this.accArr

    return result.reverse();
  }

  fillListData = (data: any) => {
    this.listData = new MatTableDataSource(data);
    this.listData.sort = this.sort;
    this.listData.paginator = this.paginator;
    this.tempAccArry = data;
    this.setHeaderTotals(data);
  };

  setHeaderTotals(accArr: any) {
    if (accArr.length > 0) {
      accArr.reverse()
      this.headerTotals.openedVal =
        accArr[0].balance +
        (accArr[0].receiptDetail == 'رصيد اول'
          ? 0
          : accArr[0].minVal - accArr[0].addVal);

      const filteredAcc = accArr.filter(
        (acc: any) => acc.receiptDetail != 'رصيد اول'
      );

      this.headerTotals.income = filteredAcc
        .reduce((a: any, b: any) => a + b.minVal, 0);

      this.headerTotals.outcome = filteredAcc
        .reduce((a: any, b: any) => a + b.addVal, 0);
    } else {
      this.headerTotals = new AccHeaderTotals();
    }
  }

  search() {
    this.listData.filter = this.searchTxt;
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

  startByDate(from: string, to: string) {
    this._glopal.loading = true;
    Promise.all([
      this.getOtherAccTransaction(from, to),
      this.getOtherAcc(),
    ]).then((data: any[]) => {
      let accTransList: any[] = data[0];
      let accList: OtherAcc[] = data[1];
      let parseId: number;
      if (this.id) {
        parseId = parseInt(this.id);
        let foundAcc = accList.find((acc) => acc.accId == parseId);
        if (foundAcc) this.accInfo = foundAcc;
      }
      this._glopal.currentHeader = `حركة حساب | ${this.accInfo.AccName}`;

      let listData = this.makeSafeAcc(accTransList.reverse());
      this.fillListData(listData);
      this._mainService.handleTableHeight();

      this.accInfo.currentAccVal = this.accInfo.currentAccVal;
      this._glopal.loading = false;
    });
  }

  filterByDate(from?: string, to?: string) {
    if (from && to) {
      let start = `${from} 00:00`;
      let end = `${to} 23:59`;

      this.isFiltered = true;
      let newArr = this.accArr.filter((acc) => {
        return acc.date_time >= start && acc.date_time <= end;
      });

      this.startByDate(from, to);
    } else {
      this.searchDate = { from: '', to: '' };
      this.onStart();
      this.isFiltered = false;
    }
  }

  toReceipt(id: string, receiptKind: string) {
    if (receiptKind != 'رصيد اول')
      this._router.navigate([`/SafeReceipt/${id}`]);
  }

  printDocument() {
    window.print();
  }
}
