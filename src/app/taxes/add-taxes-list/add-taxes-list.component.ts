import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { GlobalVarsService } from 'src/app/services/global-vars.service';
import { MainService } from 'src/app/services/main.service';
import { TaxesService } from 'src/app/services/taxes.service';
import { FilterByDateDialogComponent } from 'src/app/dialogs/filter-by-date-dialog/filter-by-date-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { TaxPayment } from 'src/app/classes/tax-payment';
import { AddDiscoundDialogComponent } from 'src/app/dialogs/add-discound-dialog/add-discound-dialog.component';
import { SafeReceipt } from 'src/app/classes/safe-receipt';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-add-taxes-list',
  templateUrl: './add-taxes-list.component.html',
  styleUrls: ['./add-taxes-list.component.scss'],
})
export class AddTaxesListComponent implements OnInit {
  mainData: any;
  listData_invoices: MatTableDataSource<any> | any;
  listData_invoices_toUs: MatTableDataSource<any> | any;
  listData_concretes: MatTableDataSource<any> | any;
  listData_taxes: MatTableDataSource<any> | any;

  headerTotals = {
    mainTotals: {
      header: ' اجماليات النشاط',
      totalVals: 0,
      addTaxesVal: 0,
      addTaxesVal_toUs: 0,
      taxesPayments: 0,
    },
    taxesTotals: [
      {
        header: 'اجماليات التوريدات',
        totalVals: 0,
        addTaxesVal: 0,
        totalVals_toUs: 0,
        addTaxesVal_toUs: 0,
      },
      {
        header: 'اجماليات محطة الخرسانة',
        totalVals: 0,
        addTaxesVal: 0,
      },
    ],
  };

  taxesPayments: TaxPayment[] = [];

  taxesPayments_Acc: {
    id: string;
    date_time: string;
    notes: string;
    toUs: number;
    onUs: number;
    balance: number;
    paymentVal: number;
    receiptKind: string;
  }[] = [];

  displayedColumns: string[] = [
    'date_time',
    'receiptDetails',
    'customerName',
    'invoiceTotal',
    'addTaxesVal',
  ];

  payment_displayedColumns: string[] = [
    'date_time',
    'receiptKind',
    'notes',
    'onUs',
    'toUs',
    'balance',
  ];

  searchTxt_invoices: string = '';
  searchTxt_concretes: string = '';
  searchTxt_invoices_toUs: string = '';
  searchTxt_taxes: string = '';

  isFiltered: boolean = false;

  searchDate: { from: string; to: string } = { from: '', to: '' };

  @ViewChild('sort_invoices', { static: true }) sort_invoices!: MatSort;
  @ViewChild('paginator_invoices', { static: true })
  paginator_invoices!: MatPaginator;

  @ViewChild('sort_invoices_toUs', { static: true })
  sort_invoices_toUs!: MatSort;
  @ViewChild('paginator_invoices_toUs', { static: true })
  paginator_invoices_toUs!: MatPaginator;

  @ViewChild('sort_concretes', { static: true }) sort_concretes!: MatSort;
  @ViewChild('paginator_concretes', { static: true })
  paginator_concretes!: MatPaginator;

  @ViewChild('sort_taxes', { static: true }) sort_taxes!: MatSort;
  @ViewChild('paginator_taxes', { static: true })
  paginator_taxes!: MatPaginator;

  constructor(
    public _mainService: MainService,
    public _glopal: GlobalVarsService,
    public _taxesService: TaxesService,
    public _dialog: MatDialog,
    public _snackBar: MatSnackBar
  ) {
    this._glopal.currentHeader = 'تقرير الضرائب';
    this._glopal.loading = true;
  }

  ngOnInit(): void {
    window.addEventListener('resize', () => {
      this._mainService.handleTableHeight();
    });

    this.onStart();
  }

  onStart() {
    if (!this._glopal.loading) this._glopal.loading = true;

    Promise.all([this.getAddTaxes(), this.getTaxesPayments()]).then(
      (data: any) => {
        const result = {
          addTaxes: data[0],
          taxesPayments: data[1],
        };

        // console.log(result)
        this.mainData = result.addTaxes;
        this.taxesPayments = result.taxesPayments;

        this.taxesPayments_Acc = this.makePaymentsAcc(this.taxesPayments);
        this.fillListData({
          addTaxes: result.addTaxes,
          taxesPayments: this.taxesPayments_Acc,
        });
        this._mainService.handleTableHeight();
        this._glopal.loading = false;
      }
    );
  }

  makePaymentsAcc(taxesPayments: TaxPayment[]): {
    id: string;
    date_time: string;
    notes: string;
    toUs: number;
    onUs: number;
    balance: number;
    paymentVal: number;
    receiptKind: string;
  }[] {
    let accArr: any[] = [];
    for (let i = 0; i < taxesPayments.length; i++) {
      const payment = taxesPayments[i];
      let toUs: number, onUs: number, balance: number;

      if (taxesPayments[i].receiptKind == 'ايصال صرف نقدية') {
        toUs = payment.paymentVal;
        onUs = 0;
      } else {
        toUs = 0;
        onUs = payment.paymentVal;
      }

      balance = i == 0 ? toUs - onUs : accArr[i - 1].balance + toUs - onUs;

      const row = {
        id: payment.id,
        date_time: payment.date_time,
        notes: payment.notes,
        toUs: toUs,
        onUs: onUs,
        balance: balance,
        paymentVal: payment.paymentVal,
        receiptKind: payment.receiptKind,
      };

      accArr = [...accArr, row];
    }
    return accArr.reverse();
  }

  getAddTaxes() {
    return new Promise((res) => {
      this._taxesService.addTaxesList().subscribe((data: any) => res(data));
    });
  }

  getTaxesPayments() {
    return new Promise((res) => {
      this._taxesService
        .taxesPaymentList()
        .subscribe((data: TaxPayment[]) => res(data));
    });
  }

  fillListData = (data: { addTaxes: any; taxesPayments: any }) => {
    /* invoices */
    this.listData_invoices = new MatTableDataSource(data.addTaxes.receiptTaxes);
    this.listData_invoices.sort = this.sort_invoices;
    this.listData_invoices.paginator = this.paginator_invoices;

    /* invoices_toUs */
    this.listData_invoices_toUs = new MatTableDataSource(
      data.addTaxes.receiptTaxes_toUs
    );
    this.listData_invoices.sort = this.sort_invoices_toUs;
    this.listData_invoices.paginator = this.paginator_invoices_toUs;

    /* concretes */
    this.listData_concretes = new MatTableDataSource(
      data.addTaxes.concreteTaxes
    );
    this.listData_concretes.sort = this.sort_concretes;
    this.listData_concretes.paginator = this.paginator_concretes;

    /* taxes */
    this.listData_taxes = new MatTableDataSource(data.taxesPayments);
    this.listData_taxes.sort = this.sort_taxes;
    this.listData_taxes.paginator = this.paginator_taxes;

    this.setHeaderTotals(data);
  };

  setHeaderTotals(data: any) {
    this.headerTotals.mainTotals.taxesPayments = data.taxesPayments
      .map((payment: any) => payment.toUs - payment.onUs)
      .reduce((a: any, b: any) => a + b, 0);

    for (let i = 0; i < this.headerTotals.taxesTotals.length; i++) {
      if (this.headerTotals.taxesTotals[i].header == 'اجماليات محطة الخرسانة') {
        this.headerTotals.taxesTotals[i].addTaxesVal =
          data.addTaxes.concreteTaxes.reduce(
            (a: any, b: any) => a + b.addTaxesVal,
            0
          );

        this.headerTotals.taxesTotals[i].totalVals =
          data.addTaxes.concreteTaxes.reduce(
            (a: any, b: any) => a + b.invoiceTotal,
            0
          );
      }

      if (this.headerTotals.taxesTotals[i].header == 'اجماليات التوريدات') {
        this.headerTotals.taxesTotals[i].addTaxesVal =
          data.addTaxes.receiptTaxes.reduce(
            (a: any, b: any) => a + b.addTaxesVal,
            0
          );

        this.headerTotals.taxesTotals[i].totalVals =
          data.addTaxes.receiptTaxes.reduce(
            (a: any, b: any) => a + b.invoiceTotal,
            0
          );

        this.headerTotals.taxesTotals[i].addTaxesVal_toUs =
          data?.addTaxes.receiptTaxes_toUs?.reduce(
            (a: any, b: any) => a + b.addTaxesVal,
            0
          );

        this.headerTotals.taxesTotals[i].totalVals_toUs =
          data?.addTaxes.receiptTaxes_toUs?.reduce(
            (a: any, b: any) => a + b.invoiceTotal,
            0
          );

        this.headerTotals.mainTotals.addTaxesVal_toUs =
          this.headerTotals.taxesTotals[i]?.addTaxesVal_toUs ?? 0;
      }

      this.headerTotals.mainTotals.addTaxesVal =
        this.headerTotals.taxesTotals.reduce(
          (a: any, b: any) => a + b.addTaxesVal,
          0
        );
      this.headerTotals.mainTotals.totalVals =
        this.headerTotals.taxesTotals.reduce(
          (a: any, b: any) => a + b.totalVals,
          0
        );
    }
  }

  scrollTo(header: string) {
    if (header == 'اجماليات محطة الخرسانة') {
      this._mainService.scrollTo('listData_concretes');
    }

    if (header == 'اجماليات التوريدات') {
      this._mainService.scrollTo('listData_invoices');
    }
  }

  search(cond: string) {
    if (cond == 'listData_invoices')
      this.listData_invoices.filter = this.searchTxt_invoices;

    if (cond == 'listData_concretes')
      this.listData_concretes.filter = this.searchTxt_concretes;

    if (cond == 'listData_invoices_toUs')
      this.listData_invoices_toUs.filter = this.searchTxt_invoices_toUs;

    if (cond == 'listData_taxes')
      this.listData_taxes.filter = this.searchTxt_taxes;
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
    this.searchTxt_concretes = '';
    this.searchTxt_invoices = '';

    if (from) {
      let start = `${from} 00:00`;
      let end = `${to} 23:59`;

      let tempData = {
        addTaxes: {
          receiptTaxes: this.mainData.receiptTaxes.filter((acc: any) => {
            return acc.date_time >= start && acc.date_time <= end;
          }),
          concreteTaxes: this.mainData.concreteTaxes.filter((acc: any) => {
            return acc.date_time >= start && acc.date_time <= end;
          }),
          receiptTaxes_toUs: this.mainData.receiptTaxes_toUs.filter(
            (acc: any) => {
              return acc.date_time >= start && acc.date_time <= end;
            }
          ),
        },
        taxesPayments: this.taxesPayments_Acc.filter((acc: any) => {
          return acc.date_time >= start && acc.date_time <= end;
        }),
      };

      this.isFiltered = true;
      this.fillListData(tempData);
    }
  }

  filterList(cond: string) {
    this.searchTxt_concretes = '';
    this.searchTxt_invoices = '';

    if (cond == 'showAll') {
      this.isFiltered = false;

      const dataToFill = {
        addTaxes: this.mainData,
        taxesPayments: this.taxesPayments_Acc,
      };
      this.fillListData(dataToFill);
      this.searchDate = { from: '', to: '' };
    }
  }

  payTax(oldPayment?: TaxPayment) {
    let taxPayment = new SafeReceipt();
    taxPayment.safeName = 'دفعة لسداد ضريبة';
    if (oldPayment) {
      // set secSafeId as TaxPayment.id for edit
      taxPayment.secSafeId = parseInt(oldPayment.id);
      taxPayment.date_time = oldPayment.date_time.replace(' ', 'T');
      taxPayment.receiptVal = oldPayment.paymentVal;
      taxPayment.recieptNote = oldPayment.notes;
      taxPayment.receiptKind = oldPayment.receiptKind;
    } else {
      taxPayment.secSafeId = 0;
      taxPayment.receiptKind = 'ايصال صرف نقدية';
      taxPayment.date_time = this._mainService.makeTime_date(
        new Date(Date.now())
      );
    }

    this.openDiscoundDialog(taxPayment);
  }

  openDiscoundDialog = (data: SafeReceipt) => {
    let dialogRef = this._dialog.open(AddDiscoundDialogComponent, {
      data: data,
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        let taxPayment = new TaxPayment();
        taxPayment.notes = result.recieptNote;
        taxPayment.paymentVal = result.receiptVal;
        taxPayment.date_time = result.date_time;
        taxPayment.receiptKind = result.receiptKind;

        /* take action */
        if (result.secSafeId != 0) {
          // console.log(result);
          taxPayment.id = result.secSafeId;
          this.updateTaxPaymeny(taxPayment);
        } else {
          console.log(taxPayment);
          this._taxesService
            .postTaxPayment(taxPayment)
            .subscribe(() => this.onStart());
        }
      }
    });
  };

  updateTaxPaymeny(taxPayment: TaxPayment) {
    // check if can edit
    if (this._glopal.check.edi) {
      // set secSafeId as TaxPayment.id for edit
      this._taxesService
        .updateTaxPayment(taxPayment)
        .subscribe(() => this.onStart());
    } else {
      this._snackBar.open('لا توجد صلاحية للتعديل', 'اخفاء', {
        duration: 2500,
      });
      this._mainService.playDrumFail();
    }
  }
}
