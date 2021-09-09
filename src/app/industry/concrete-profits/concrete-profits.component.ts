import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { ConcreteService } from 'src/app/services/concrete.service';
import { GlobalVarsService } from 'src/app/services/global-vars.service';
import { MainService } from 'src/app/services/main.service';
import { SafeService } from 'src/app/services/safe.service';
import { MatDialog } from '@angular/material/dialog';
import { FilterByDateDialogComponent } from 'src/app/dialogs/filter-by-date-dialog/filter-by-date-dialog.component';
import { OtherAcc } from 'src/app/classes/other-acc';

@Component({
  selector: 'app-concrete-profits',
  templateUrl: './concrete-profits.component.html',
  styleUrls: ['./concrete-profits.component.scss'],
})
export class ConcreteProfitsComponent implements OnInit {
  listData: MatTableDataSource<any> | any;

  displayedColumns: string[] = [
    'date_time',
    'receiptDetail',
    'concreteCustomerName',
    'invoiceTotal',
    'taxesDiscound',
    'allExpences',
    'netBeforTaxes',
    'profits',
  ];

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  searchTxt: string = '';
  searchDate: { from: string; to: string } = { from: '', to: '' };

  mainList: any[] = [];

  isFiltered: boolean = false;

  otherAcc: OtherAcc[] = [];

  workerExpences: number = 0;
  truckExpences: number = 0;

  headerTotal = {
    materialExpences: 0,
    taxesDiscound: 0,
    totalExpences: 0,
    concreteInvoiceTotal: 0,
    totalprofits: 0,
    accExpences: 0,
    concreteQty: 0,
    outSidePumpCost: 0,
  };

  constructor(
    public _mainService: MainService,
    public _glopal: GlobalVarsService,
    public _concrete: ConcreteService,
    public _safeService: SafeService,
    public _dialog: MatDialog
  ) {
    this._glopal.loading = true;
    this._glopal.currentHeader = 'ارباح المحطة';
  }

  ngOnInit(): void {
    window.addEventListener('resize', () => {
      this._mainService.handleTableHeight();
    });
    this.onStart();
  }

  onStart() {
    Promise.all([
      this.getConcreteProfits(),
      this.getAccList(),
      this.getWorkerExpences(),
    ]).then((data: any) => {
      const result = {
        concreteProfits: data[0],
        accList: data[1],
        workerExpences: data[2],
      };

      // console.log(result.concreteProfits)

      this.mainList = result.concreteProfits;
      this.otherAcc = result.accList.filter(
        (acc: any) => acc.currentAccVal != 0
      );
      this.workerExpences = result.workerExpences.workersExpenses;
      this.truckExpences = result.workerExpences.trucksExpenses;
      this.fillListData(result.concreteProfits);
      this._mainService.handleTableHeight();
      this._glopal.loading = false;
    });
  }

  getWorkerExpences(from?: string, to?: string) {
    return new Promise((res) => {
      this._concrete
        .concreteWorkerExpences(from, to)
        .subscribe((data: any[]) => res(data[0]));
    });
  }

  getConcreteProfits(): Promise<any[]> {
    return new Promise((res) => {
      this._concrete.getConcreteProfits().subscribe((data: any[]) => res(data));
    });
  }

  getAccList(): Promise<OtherAcc[]> {
    return new Promise((res) => {
      this._safeService
        .getOtherAcc()
        .subscribe((data: OtherAcc[]) =>
          res(data.filter((acc: OtherAcc) => acc.AccName.includes('المحطه')))
        );
    });
  }

  getOtherAccByDate(from: string, to: string): Promise<OtherAcc[]> {
    return new Promise((res) => {
      this._safeService
        .getOtherAccByDate(from, to)
        .subscribe((data: OtherAcc[]) =>
          res(data.filter((acc: OtherAcc) => acc.AccName.includes('المحطه')))
        );
    });
  }

  fillListData = (pureData: any) => {
    this.listData = new MatTableDataSource(pureData);
    this.listData.sort = this.sort;
    this.listData.paginator = this.paginator;
    this.setHeaderTotals(pureData);
  };

  setHeaderTotals(data: any[]) {
    const materialExpences = data.reduce(
      (a: any, b: any) => a + b.invoiceTotal,
      0
    );
    const taxesDiscound = data.reduce(
      (a: any, b: any) => a + b.taxesDiscound,
      0
    );
    const concreteInvoiceTotal = data.reduce(
      (a: any, b: any) => a + b.netBeforTaxes,
      0
    );

    const concreteQty = data.reduce((a: any, b: any) => a + b.concreteQty, 0);

    const mixerExpences = concreteQty * 35;
    const loaderExpences = concreteQty * 5;

    this.headerTotal = {
      materialExpences: materialExpences,
      taxesDiscound: taxesDiscound,
      totalExpences:
        materialExpences + taxesDiscound + mixerExpences + loaderExpences,
      concreteInvoiceTotal: concreteInvoiceTotal,
      totalprofits: concreteInvoiceTotal - (materialExpences + taxesDiscound),
      accExpences: this.otherAcc.reduce(
        (a: any, b: any) => a + b.currentAccVal,
        0
      ),
      concreteQty: concreteQty,
      outSidePumpCost: data.reduce(
        (a: any, b: any) => a + b.outSidePumpCost,
        0
      ),
    };
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

  filterByDate(from?: string, to?: string) {
    this.searchTxt = '';

    if (from && to) {
      let start = `${from} 00:00`;
      let end = `${to} 23:59`;

      let newArr = this.mainList.filter((acc) => {
        return acc.date_time >= start && acc.date_time <= end;
      });

      this._glopal.loading = true;
      Promise.all([
        this.getOtherAccByDate(from, to),
        this.getWorkerExpences(from, to),
      ]).then((data: any) => {
        const result = {
          otherAcc: data[0],
          workerExpences: data[1],
        };

        this.otherAcc = result.otherAcc.filter(
          (acc: OtherAcc) =>
            acc.AccName.includes('المحطه') && acc.currentAccVal != 0
        );

        this.workerExpences = result.workerExpences.workersExpenses;
        this.truckExpences = result.workerExpences.trucksExpenses;

        this.isFiltered = true;
        this.fillListData(newArr);
        this._glopal.loading = false;
      });
    } else {
      this._glopal.loading = true;

      Promise.all([this.getAccList(), this.getWorkerExpences()]).then(
        (data: any) => {
          const result = {
            otherAcc: data[0],
            workerExpences: data[1],
          };

          this.otherAcc = result.otherAcc.filter(
            (acc: any) => acc.currentAccVal != 0
          );
          this.fillListData(this.mainList);
          this.isFiltered = false;
          this.searchDate = { from: '', to: '' };
          this._glopal.loading = false;

          this.workerExpences = result.workerExpences.workersExpenses;
          this.truckExpences = result.workerExpences.trucksExpenses;
          this._glopal.loading = false;
        }
      );
    }
  }
}
