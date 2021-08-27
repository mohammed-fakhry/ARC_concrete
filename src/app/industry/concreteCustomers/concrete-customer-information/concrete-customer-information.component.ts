import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MainService } from 'src/app/services/main.service';
import { GlobalVarsService } from 'src/app/services/global-vars.service';
import { ConcreteService } from 'src/app/services/concrete.service';
import { ActivatedRoute } from '@angular/router';
import { ConcreteCustomer } from 'src/app/classes/concrete-customer';
import { FilterByDateDialogComponent } from 'src/app/dialogs/filter-by-date-dialog/filter-by-date-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { AccHeaderTotals } from 'src/app/classes/acc-header-totals';
import { SafeReceipt } from 'src/app/classes/safe-receipt';
import { AddDiscoundDialogComponent } from 'src/app/dialogs/add-discound-dialog/add-discound-dialog.component';
import { SafeService } from 'src/app/services/safe.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-concrete-customer-information',
  templateUrl: './concrete-customer-information.component.html',
  styleUrls: ['./concrete-customer-information.component.scss'],
})
export class ConcreteCustomerInformationComponent implements OnInit {
  id: string | null = null;

  listData: MatTableDataSource<any> | any;
  cementListData: MatTableDataSource<any> | any;

  headerTotals: AccHeaderTotals = new AccHeaderTotals();

  concreteTotals: {
    concretes: { concreteName: string; total: number }[];
    total: number;
  } = { concretes: [], total: 0 };

  cementDisplayedColumns: string[] = [
    'id',
    'date_time',
    'InvoiceDetails',
    'qty_in',
    'qty_out',
    'balance',
  ];

  displayedColumns: string[] = [
    'id',
    'date_time',
    'receiptSerial',
    'receiptDetail',
    //'totalDiscound',
    'minVal',
    'addVal',
    'balance',
    'notes',
  ];

  @ViewChild('mainTableSort', { static: true }) sort!: MatSort;
  @ViewChild('mainTable_paginator', { static: true }) paginator!: MatPaginator;

  @ViewChild('cementTable_sort', { static: true }) sort_cement!: MatSort;
  @ViewChild('cementTable_paginator', { static: true }) paginator_cement!: MatPaginator;

  searchTxt: string = '';
  searchDate: { from: string; to: string } = { from: '', to: '' };

  accArr: any[] = [];
  customerInfo: ConcreteCustomer = new ConcreteCustomer();

  cementUses: any = [];

  tempCementUses: any = [];

  mainCementAcc: any = [];

  tempAccArry: any[] = [];

  isFiltered: boolean = false;

  calcArr: {
    arr: number[];
    total: number;
  } = { arr: [], total: 0 };

  marked: boolean = false;
  markColor: string = '';

  // showCementQty: boolean = false;

  acementTotals = {
    begainWith: 0,
    in: 0,
    out: 0,
  };

  staticMixerTotals = {
    income: 0,
    outcome: 0,
  };

  concreteCustomerInfoHeader: HTMLElement = document.getElementById(
    'concreteCustomerInfoHeader'
  ) as HTMLElement;

  constructor(
    public _mainService: MainService,
    public _glopal: GlobalVarsService,
    public _concrete: ConcreteService,
    public activeRoute: ActivatedRoute,
    public _safeService: SafeService,
    public _snackBar: MatSnackBar,
    public _auth: AuthService,
    public _dialog: MatDialog
  ) {
    this._glopal.loading = true;
    this._glopal.currentHeader = 'تفاصيل حساب عميل خرسانة';
  }

  ngOnInit(): void {
    window.addEventListener('resize', () => {
      this._mainService.handleTableHeight();
    });
    this.onStart();

    this.concreteCustomerInfoHeader = document.getElementById(
      'concreteCustomerInfoHeader'
    ) as HTMLElement;
  }

  onStart() {
    this.id = this.activeRoute.snapshot.paramMap.get('id');

    Promise.all([
      this.getCustomer(),
      this.getCustomerAcc(),
      this.getMixerTotals(),
    ])
      .then((data: any) => {
        const result = {
          customer: data[0][0],
          acc: data[1],
          mixerTotal: data[2],
        };

        this.customerInfo = result.customer;

        this.staticMixerTotals = {
          income: result.mixerTotal[1].totalVal,
          outcome: result.mixerTotal[0].totalVal,
        };

        if (this.customerInfo.cementCustomerId) {
          this.getCementUses().then((dataUses) => {
            this.tempCementUses = dataUses;
            this.cementUses = this.makeCementAcc(dataUses);
            this.fillCementData(this.cementUses);
          });
        }

        this.fillListData(this.makeCustomerAcc(result.acc));
      })
      .then(() => {
        this._glopal.loading = false;
        this._mainService.handleTableHeight();
      });
  }

  getMixerTotals() {
    return new Promise((res) => {
      if (this.id)
        this._concrete
          .staticMixerTotals(this.id)
          .subscribe((data: any[]) => res(data));
    });
  }

  makeCustomerAcc(data: any[]) {
    this.accArr = [];

    let firstRow = {
      id: 1,
      receiptDetail: 'رصيد اول',
      minVal:
        this.customerInfo.openedVal < 0 ? this.customerInfo.openedVal * -1 : 0,
      addVal:
        this.customerInfo.openedVal >= 0 ? this.customerInfo.openedVal : 0,
      balance: this.customerInfo.openedVal,
    };

    this.accArr = [...this.accArr, firstRow];

    for (let i = 0; i < data.length; i++) {
      const isReceipt =
        data[i].receiptDetail.includes('ايصال صرف نقدية') ||
        data[i].receiptDetail.includes('ايصال استلام نقدية')
          ? true
          : false;

      const totalBeforDiscound = data[i].concretePrice * data[i].concreteQty;

      const detailDiscound =
        data[i].detailDiscound > 0
          ? (totalBeforDiscound * data[i].detailDiscound) / 100
          : 0;

      const totalDiscound =
        data[i].totalDiscound > 0
          ? (totalBeforDiscound * data[i].totalDiscound) / 100
          : 0;

      const netTotal = data[i].receiptDetail.includes('ايصال صرف نقدية')
        ? data[i].concretePrice
        : totalBeforDiscound + totalDiscound - detailDiscound;

      const minVal = data[i].receiptDetail.includes('ايصال استلام نقدية')
        ? data[i].concretePrice
        : 0;
      const addVal = netTotal;

      const balance = addVal - minVal + this.accArr[i].balance;

      const newData = {
        id: i + 2,
        date_time: data[i].date_time.replace('T', ' '),
        date: data[i].date_time.replace(' ', 'T'),
        concretereceiptcash_id: data[i].concretereceiptcash_id,
        receiptSerial: `${isReceipt ? 'ايصال' : 'فاتورة'} ${
          data[i].receiptSerial
        }${data[i].customerProject ? ' | ' + data[i].customerProject : ''}`,
        //customerProject: data[i].customerProject,
        receiptDetail: `${data[i].receiptDetail}`,
        concreteQty: data[i].concreteQty,
        concreteName: data[i].concreteName,
        routeTo: `/${
          data[i].receiptDetail.includes('ايصال')
            ? 'SafeReceipt'
            : 'UpdateConcreteReceipt'
        }/${data[i].concreteReceipt_id}`,
        minVal: minVal,
        addVal: addVal,
        balance: balance,
        notes: data[i].notes,
      };

      this.accArr = [...this.accArr, newData];
    }

    // console.log(data)
    return this.accArr;
  }

  makeCementAcc(data: any, startVal?: number) {
    let arr: any[] = [];

    if (startVal) {
      const begainAcc =
        startVal -
        (data[0].transactionType == 1 ? data[0].Qty : 0) +
        (data[0].transactionType == 2 ? data[0].Qty : 0);

      const firstRow = {
        id: 1,
        InvoiceDetails: 'رصيد اول',
        routeTo: ``,
        date_time: this.searchDate.from,
        qty_in: begainAcc > 0 ? begainAcc : 0,
        qty_out: begainAcc < 0 ? begainAcc * -1 : 0,
        balance: begainAcc,
      };

      arr = [...arr, firstRow];

      this.acementTotals.begainWith = begainAcc;
    } else {
      this.acementTotals.begainWith = 0;
    }

    for (let i = 0; i < data.length; i++) {
      let indx = i;
      if (startVal) {
        indx = i + 1;
      }

      const qty_in = data[i].transactionType == 1 ? data[i].Qty : 0;
      const qty_out = data[i].transactionType == 2 ? data[i].Qty : 0;

      const balance =
        indx == 0 ? qty_in - qty_out : arr[indx - 1].balance + qty_in - qty_out;

      const InvoiceDetails = data[i].concreteReceipt_id
        ? `رقم الفاتورة (${data[i].manualNum})`
        : `فاتورة ${data[i].transactionType == 1 ? 'شراء' : 'بيع'} رقم ${
            data[i].stockTransactionId
          }`;

      const newRow = {
        id: indx + 1,
        InvoiceDetails: InvoiceDetails,
        routeTo: `${
          data[i].concreteReceipt_id
            ? '/UpdateConcreteReceipt/' + data[i].concreteReceipt_id
            : '/StockInvoice/' + data[i].stockTransactionId
        }`,
        date_time: data[i].date_time,
        qty_in: qty_in,
        qty_out: qty_out,
        balance: balance,
      };

      arr = [...arr, newRow];
    }

    if (!startVal) this.mainCementAcc = [...arr];

    this.acementTotals.in =
      arr.reduce((a, b) => a + b.qty_in, 0) - this.acementTotals.begainWith;

    this.acementTotals.out = arr.reduce((a, b) => a + b.qty_out, 0);

    return arr.reverse();
  }

  getCustomer(): Promise<ConcreteCustomer[]> {
    return new Promise((res) => {
      if (this.id)
        this._concrete
          .concreteCustomerList(this.id)
          .subscribe((data: ConcreteCustomer[]) => res(data));
    });
  }

  getCustomerAcc() {
    return new Promise((res) => {
      if (this.id)
        this._concrete
          .concreteCustomerAcc(this.id)
          .subscribe((data: any[]) => res(data));
    });
  }

  getCementUses() {
    return new Promise((res) => {
      if (this.id)
        this._concrete
          .getCustomerCementUses(this.id)
          .subscribe((data: any) => res(data));
    });
  }

  fillListData = (pureData: any) => {
    const data = pureData.reverse();
    this.listData = new MatTableDataSource(data);
    this.listData.sort = this.sort;
    this.listData.paginator = this.paginator;
    // this.searchResults(pureData);
    this.tempAccArry = pureData;
    this.setHeaderTotals(data.reverse());
    this.generatConcretesTotals(pureData);
  };

  generatConcretesTotals(pureData: any) {

    const concreteArr = pureData.filter(
      (d: any) => d.concreteName && !d.concreteName.includes('مضخ')
    );

    const concretes: any[] = [
      ...new Set(concreteArr.map((c: any) => c.concreteName)),
    ];

    this.concreteTotals.concretes = [];

    for (let i = 0; i < concretes.length; i++) {
      const filtered = concreteArr.filter(
        (c: any) => c.concreteName == concretes[i]
      );

      const concreteDetails = {
        concreteName: concretes[i],
        total: filtered.reduce((a: any, b: any) => a + b.concreteQty, 0),
      };

      this.concreteTotals.concretes.push(concreteDetails);
    }

    this.concreteTotals.total = this.concreteTotals.concretes.reduce(
      (a: any, b: any) => a + b.total,
      0
    );
  }

  fillCementData = (pureData: any) => {
    // const data = pureData.reverse();
    this.cementListData = new MatTableDataSource(pureData);
    this.cementListData.sort = this.sort_cement;
    this.cementListData.paginator = this.paginator_cement;

    // this._mainService.handleTableHeight()
  };

  setHeaderTotals(accArr: any) {
    if (accArr.length > 0) {
      this.headerTotals.openedVal =
        accArr[0].balance +
        (accArr[0].InvoiceDetails == 'رصيد اول'
          ? 0
          : accArr[0].minVal - accArr[0].addVal);

      const filteredAcc = accArr.filter(
        (acc: any) => acc.InvoiceDetails != 'رصيد اول'
      );

      this.headerTotals.income = filteredAcc
        //.map((a: any) => a.minVal)
        .reduce((a: any, b: any) => a + b.minVal, 0);

      this.headerTotals.outcome = filteredAcc
        //.map((a: any) => a.addVal)
        .reduce((a: any, b: any) => a + b.addVal, 0);
    } else {
      this.headerTotals = new AccHeaderTotals();
    }
  }

  search() {
    if (this.marked) this.clearCalcArr();
    this.listData.filter = this.searchTxt;
    // this.searchResults(this.tempAccArry);
  }

  markToCalc = (val: number, i: number, cell: any) => {
    const element = document.querySelector(`#${cell}${i}`) as HTMLElement;

    let cond = element.classList.contains('calcMark');

    /* cond is for marked */
    if (cond) {
      this.calcArr.arr = [...this.calcArr.arr, val * -1];
      element.style.cursor = 'grab';
      element.classList.remove('calcMark');
    } else {
      this.calcArr.arr = [...this.calcArr.arr, val];
      element.style.cursor = 'grabbing';
      element.classList.add('calcMark');
    }

    this.calcArr.total = this.calcArr.arr.reduce(
      (a: number, b: number) => a + b
    );

    if (!this.marked) this.marked = true;
  };

  printDocument(cond?: string) {
    if (cond == 'cementQty') {
      const concreteCustomerInfoMainTable = document.querySelector(
        '#concreteCustomerInfoMainTable'
      ) as HTMLElement;
      const concreteCustomerInfoHeader = document.querySelector(
        '#concreteCustomerInfoHeader'
      ) as HTMLElement;

      concreteCustomerInfoMainTable.classList.add('printX');
      concreteCustomerInfoHeader.classList.add('printX');

      window.print();

      concreteCustomerInfoMainTable.classList.remove('printX');
      concreteCustomerInfoHeader.classList.remove('printX');
    } else {
      const cementQty = document.querySelector('#cementQty') as HTMLElement;

      cementQty.classList.add('printX');
      window.print();
      cementQty.classList.remove('printX');
    }
  }

  /* main discound button */
  addDiscound() {
    const safeReceipt = new SafeReceipt();
    safeReceipt.concreteCustomer_id = this.customerInfo?.id ?? ''; // parseInt(this.customerInfo?.id ?? '1') ?? 1;
    safeReceipt.customerName = this.customerInfo.fullName;
    safeReceipt.receiptKind = 'ايصال استلام نقدية';
    safeReceipt.recieptNote = `"${this.customerInfo.fullName}"`;
    safeReceipt.date_time = this._mainService.makeTime_date(
      new Date(Date.now())
    );
    this.openDiscoundDialog(safeReceipt);
  }

  /* discound when click on a balance */
  discoundThis(balance: number, date: string) {
    const safeReceipt = new SafeReceipt();
    safeReceipt.customerName = this.customerInfo.fullName;
    safeReceipt.receiptKind =
      balance > 0 ? 'ايصال استلام نقدية' : 'ايصال صرف نقدية';
    safeReceipt.receiptVal = balance > 0 ? balance : balance * -1;
    safeReceipt.date_time = date;
    safeReceipt.recieptNote = `"${this.customerInfo.fullName}"`;
    this.openDiscoundDialog(safeReceipt);
  }

  openSnake(message: string) {
    this._snackBar.open(message, 'اخفاء', {
      duration: 2500,
    });
  }

  openDiscoundDialog = (data: SafeReceipt) => {
    let dialogRef = this._dialog.open(AddDiscoundDialogComponent, {
      data: data,
    });

    dialogRef.afterClosed().subscribe((result: SafeReceipt) => {
      if (result) {
        for (let i = 0; i < 2; i++) {
          if (i == 0) {
            const safeReceipt = this.recieptData_forDb(result, 'عميل خرسانة');
            this._safeService.creatSafeReceipt(safeReceipt).subscribe();
          } else {
            // reverse receiptKind
            result.receiptKind =
              result.receiptKind == 'ايصال صرف نقدية'
                ? 'ايصال استلام نقدية'
                : 'ايصال صرف نقدية';
            // make vals
            const safeReceipt = this.recieptData_forDb(result, 'حساب');
            // save vals
            this._safeService.creatSafeReceipt(safeReceipt).subscribe(() => {
              this.openSnake('تم اضافة بيانات الخصم');
              this._mainService.playMouseClickClose();
              this.onStart();
            });
          }
        }
      }
    });
  };

  recieptData_forDb(
    receipt: SafeReceipt,
    transactionAccKind: string
  ): SafeReceipt {
    let safeReceipt = new SafeReceipt();

    safeReceipt.date_time = receipt.date_time;
    safeReceipt.receiptKind = receipt.receiptKind;
    safeReceipt.safeName = receipt.safeName;
    safeReceipt.currentSafeVal = receipt.currentSafeVal;
    safeReceipt.safeId = receipt.safeId;
    safeReceipt.transactionAccKind = transactionAccKind;
    safeReceipt.accId = transactionAccKind == 'حساب' ? receipt.accId : 0;
    safeReceipt.AccName = transactionAccKind == 'حساب' ? receipt.AccName : '';
    safeReceipt.currentAccVal = receipt.currentAccVal
      ? receipt.currentAccVal
      : 0;

    safeReceipt.concreteCustomer_id =
      transactionAccKind == 'عميل خرسانة' ? this.customerInfo?.id ?? '' : '0';
    safeReceipt.concreteCustomerName =
      transactionAccKind == 'عميل خرسانة' ? this.customerInfo.fullName : '';
    safeReceipt.receiptVal = receipt.receiptVal;
    safeReceipt.recieptNote = receipt.recieptNote ? receipt.recieptNote : '';
    safeReceipt.madeBy = this._auth.uName.realName;
    return safeReceipt;
  }

  clearCalcArr() {
    this.calcArr = {
      arr: [],
      total: 0,
    };

    const markVal = document.querySelectorAll('.markVal');
    markVal.forEach((e: HTMLElement | any) => {
      return e.classList.remove('calcMark');
    });

    this.marked = false;
  }

  toCementQty() {
    this._mainService.handleTableHeight();
    this._mainService.scrollTo('cementQty', true);
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

      let newArr = this.accArr.filter((acc) => {
        return acc.date_time >= start && acc.date_time <= end;
      });

      this.isFiltered = true;
      this.fillListData(newArr);

      const begainWith =
        this.mainCementAcc.find((t: any) => t.date_time >= start).balance ?? 0;

      const tempCement = this.tempCementUses.filter(
        (t: any) => t.date_time >= start && t.date_time <= end
      );

      this.cementUses = this.makeCementAcc(tempCement, begainWith);
      this.fillCementData(this.cementUses);
    }
  }

  filterList(cond: string) {
    this.searchTxt = '';

    if (cond == 'showAll') {
      this.isFiltered = false;
      this.fillListData(this.accArr);
      this.searchDate = { from: '', to: '' };

      this.cementUses = this.makeCementAcc(this.tempCementUses);
      this.fillCementData(this.cementUses);
    } else if (cond == 'noId') {
      // filter receipts not connected with an invoice
      this.isFiltered = true;
      const tempArr = this.accArr.filter(
        (a) => a.concretereceiptcash_id == 'noId'
      );
      this.fillListData(tempArr);
      this.searchDate = { from: '', to: '' };
    }
  }
}
