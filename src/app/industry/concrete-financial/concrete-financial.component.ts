import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MainService } from 'src/app/services/main.service';
import { GlobalVarsService } from 'src/app/services/global-vars.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ConcreteService } from 'src/app/services/concrete.service';
import { ConcreteFinancial } from 'src/app/classes/concrete-financial';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConcreteCustomer } from 'src/app/classes/concrete-customer';
import { FilterByDateDialogComponent } from 'src/app/dialogs/filter-by-date-dialog/filter-by-date-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-concrete-financial',
  templateUrl: './concrete-financial.component.html',
  styleUrls: ['./concrete-financial.component.scss'],
})
export class ConcreteFinancialComponent implements OnInit {
  listData: MatTableDataSource<any> | any;
  displayedColumns: string[] = [
    'manualNum',
    'checkDate',
    'date_time',
    'receiptCondition',
    'totalQty',
    'receiptTotal',
    'taxesDiscound',
    'netBeforTaxes',
    'addTaxes',
    'customerDiscound',
    'netVal',
    'cashPaid',
    'remainVal',
    'notes',
    'recordRow',
  ];

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  searchTxt: string = '';

  financialList: ConcreteFinancial[] = [];

  id: string | undefined = undefined;

  customerInfo: ConcreteCustomer = new ConcreteCustomer();

  searchDate: { from: string; to: string } = { from: '', to: '' };
  isFiltered: boolean = false;

  totalVals: {
    totalQty: number;
    receiptTotals: number;
    addTaxes: number;
    discoundTaxes: number;
    customerDiscounds: number;
    cashPaid: number;
    valRemain: number;
    netVals: number;
    sections: { name: string; val: number }[];
    sectionsTotal: number;
  } = {
    totalQty: 0,
    receiptTotals: 0,
    addTaxes: 0,
    discoundTaxes: 0,
    customerDiscounds: 0,
    cashPaid: 0,
    valRemain: 0,
    netVals: 0,
    sections: [],
    sectionsTotal: 0,
  };

  staticMixerTotals = {
    income: 0,
    outcome: 0
  }

  constructor(
    public _mainService: MainService,
    public _glopal: GlobalVarsService,
    public _router: Router,
    public activeRoute: ActivatedRoute,
    public _snackBar: MatSnackBar,
    public _concrete: ConcreteService,
    public _dialog: MatDialog
  ) {
    this._glopal.currentHeader = 'موقف مالى | الخرسانة';
    this._glopal.loading = true;
  }

  ngOnInit(): void {
    window.addEventListener('resize', () => {
      this._mainService.handleTableHeight();
    });

    this.onStart();
  }

  onStart() {
    this.id = this.activeRoute.snapshot.paramMap.get('id') ?? undefined;

    if (!this.id) {
      this.displayedColumns = [
        'manualNum',
        'checkDate',
        'date_time',
        'receiptCondition',
        'totalQty',
        'customerName',
        'receiptTotal',
        'taxesDiscound',
        'netBeforTaxes',
        'addTaxes',
        'customerDiscound',
        'netVal',
        'cashPaid',
        'remainVal',
        'notes',
        'recordRow',
      ];
    }

    Promise.all([this.getConcreteFinancials(this.id, 'customerId'), this.getMixingTotal()])
      .then((data: any) => {

        const result = {
          financialList: data[0],
          mixerTotal: data[1]
        }
        this.financialList = result.financialList;

        this.staticMixerTotals = {
          income: result.mixerTotal[1].totalVal,
          outcome: result.mixerTotal[0].totalVal
        }

        this.fillListData(result.financialList);
        this._mainService.handleTableHeight();
        this.handleId(result.financialList);
      })
      .catch((err) => {
        const errMsg = `${err}`;
        if (errMsg.includes("'customerName' of undefined")) {
          this._mainService.playDrumFail();
          this._snackBar
            .open(`لا يوجد نشاط للعميل`, 'اخفاء', {
              duration: 3000,
            })
            .afterDismissed()
            .subscribe(() => {
              if (this._router.url.includes('ConcreteCustomerFinancial'))
                this._router.navigate([
                  `/ConcreteCustomerInformation/${this.id}`,
                ]);
            });
        }

        this._glopal.loading = false;
      });
  }

  handleId(concreteFinancial: ConcreteFinancial[]) {
    if (this.id) {
      this._glopal.currentHeader = `موقف مالى | ${concreteFinancial[0].customerName}`;
      this.getConcreteCustomer(concreteFinancial[0].customerId).then(
        (data: ConcreteCustomer[]) => {
          this.customerInfo = data[0];
          // this.getSections(concreteFinancial)
          this._glopal.loading = false;
        }
      );
    } else {
      this._glopal.loading = false;
    }
    this.totalVals = this.sumTotalVals(concreteFinancial);
  }

  getMixingTotal() {
    return new Promise((res) => {
        this._concrete
          .staticMixerTotals(this.id)
          .subscribe((data: any) => res(data));
      // else res([])
    });
  }

  getSections(data: ConcreteFinancial[]): { name: string; val: number }[] {
    let result: { name: string; val: number }[] = [];
    const sections = [...new Set(data.map((d) => d.receiptCondition))];

    for (let i = 0; i < sections.length; i++) {
      const mainSection = data.filter(
        (sec) => sec.receiptCondition == sections[i]
      );

      const row = {
        name: sections[i] ? sections[i] : 'بدون موقف',
        val:
          mainSection.map((sec) => sec.netVal).reduce((a, b) => a + b, 0) -
          mainSection.map((sec) => sec.cashPaid).reduce((a, b) => a + b, 0),
      };

      result = [...result, row];
    }

    return result
      .filter((a) => a.name != 'تم الصرف')
      .sort((a, b) => b.val - a.val);
  }

  sumTotalVals(data: ConcreteFinancial[]): {
    totalQty: number;
    receiptTotals: number;
    addTaxes: number;
    discoundTaxes: number;
    customerDiscounds: number;
    cashPaid: number;
    valRemain: number;
    netVals: number;
    sections: { name: string; val: number }[];
    sectionsTotal: number;
  } {
    let sections: { name: string; val: number }[] = this.getSections(data);

    return {
      totalQty: this.reduceTotal(data, 'totalQty'),
      receiptTotals: this.reduceTotal(data, 'receiptTotal'),
      addTaxes: this.reduceTotal(data, 'addTaxes'),
      discoundTaxes: this.reduceTotal(data, 'taxesDiscound'),
      customerDiscounds: this.reduceTotal(data, 'customerDiscound'),
      cashPaid: this.reduceTotal(data, 'cashPaid'),
      netVals: this.reduceTotal(data, 'netVal'),
      valRemain: this.reduceTotal(data, 'remainVal'),
      sections: sections,
      sectionsTotal: sections.map((s) => s.val).reduce((a, b) => a + b, 0),
    };
  }

  reduceTotal(data: ConcreteFinancial[], key: any): number {
    return data.map((d: any) => d[key]).reduce((a, b) => a + b, 0);
  }

  getConcreteFinancials(
    id?: string,
    searchBy?: string
  ): Promise<ConcreteFinancial[]> {
    return new Promise((res, rej) => {
      this._concrete.concreteFinancilaList(id, searchBy).subscribe(
        (data: ConcreteFinancial[]) => res(data),
        (err) => rej('nodata')
      );
    });
  }

  getConcreteCustomer(id: string): Promise<ConcreteCustomer[]> {
    return new Promise((res) => {
      this._concrete
        .concreteCustomerList(id)
        .subscribe((data: ConcreteCustomer[]) => res(data));
    });
  }

  tempArr: any[] = [];

  fillListData = (data: any) => {
    this.listData = new MatTableDataSource(data);
    this.listData.sort = this.sort;
    this.listData.paginator = this.paginator;

    this.tempArr = data;
  };

  search(searchfor?: string) {
    if (searchfor) {
      if (searchfor == 'بدون موقف') {
        this.searchTxt = '';
      } else {
        this.searchTxt = searchfor;
      }
    }
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

    if (from) {
      let start = `${from} 00:00`;
      let end = `${to} 23:59`;

      let newArr = this.financialList.filter((acc) => {
        return acc.date_time >= start && acc.date_time <= end;
      });

      this.isFiltered = true;
      this.fillListData(newArr);
      this.totalVals = this.sumTotalVals(newArr);
    }
  }

  filterList(cond: string) {
    this.searchTxt = '';

    if (cond == 'showAll') {
      this.isFiltered = false;
      this.fillListData(this.financialList);
      this.searchDate = { from: '', to: '' };
      this.totalVals = this.sumTotalVals(this.financialList);
    }
  }

  recordRow(row: ConcreteFinancial, i: number) {
    this._glopal.loading = true;

    if (row.id)
      this._concrete.updateConcreteFinancial(row).subscribe(
        () => {
          this.openDoneBar('تعديل', row, i);
        },
        (error) => {
          if (error.status == '201') this.openDoneBar('تعديل', row, i);
        }
      );
    else {
      this._concrete.postConcreteFinancial(row).subscribe(
        (data: any) => {
          this.openDoneBar('حفظ', row, i);
          row.id = data[0];
        },
        (error) => {
          if (error.status == '201') this.openDoneBar('حفظ', row, i);
        }
      );
    }
  }

  openDoneBar(cond: string, row: ConcreteFinancial, i: number) {
    this._snackBar.open(`تم ${cond} بيانات الفاتورة`, 'اخفاء', {
      duration: 2500,
    });

    this.totalVals = this.sumTotalVals(this.tempArr);

    this._mainService.play_secondaryDone();
    this._glopal.loading = false;
  }
}
