import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { Customer } from 'src/app/classes/customer';
import { MainService } from 'src/app/services/main.service';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalVarsService } from 'src/app/services/global-vars.service';
import { CustomerService } from 'src/app/services/customer.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SafeService } from 'src/app/services/safe.service';
import { MatDialog } from '@angular/material/dialog';
import { FilterByDateDialogComponent } from 'src/app/dialogs/filter-by-date-dialog/filter-by-date-dialog.component';
import { AddDiscoundDialogComponent } from 'src/app/dialogs/add-discound-dialog/add-discound-dialog.component';
import { SafeReceipt } from 'src/app/classes/safe-receipt';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-customer-information',
  templateUrl: './customer-information.component.html',
  styleUrls: ['./customer-information.component.scss'],
})
export class CustomerInformationComponent implements OnInit {
  id: string | null = null;

  listData: MatTableDataSource<any> | any;

  displayedColumns: string[] = [
    'id',
    'date_time',
    'recieptType',
    'receiptDetail',
    'minVal',
    'addVal',
    'balance',
    'note',
  ];

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  searchTxt: string = '';
  searchDate: { from: string; to: string } = { from: '', to: '' };

  /* searchResult: {
    onUs: number;
    toUs: number;
  } = {
    onUs: 0,
    toUs: 0,
  }; */
  customerInfo: Customer = new Customer();

  isFiltered: boolean = false;

  calcArr: {
    arr: number[];
    total: number;
  } = { arr: [], total: 0 };

  accArr: any[] = [];

  tempAccArry: any[] = [];

  constructor(
    public _mainService: MainService,
    public activeRoute: ActivatedRoute,
    public _router: Router,
    public _glopal: GlobalVarsService,
    public _customerService: CustomerService,
    public _snackBar: MatSnackBar,
    public _safeService: SafeService,
    public _auth: AuthService,
    public _dialog: MatDialog
  ) {
    this._glopal.loading = true;
  }

  ngOnInit(): void {
    this.id = this.activeRoute.snapshot.paramMap.get('id');

    /* array for markAndCalc */
    this.calcArr = {
      arr: [],
      total: 0,
    };

    window.addEventListener('resize', () => {
      this._mainService.handleTableHeight();
    });

    this.customerInfo = new Customer();
    this.onStart();
  }

  onStart() {
    this._glopal.loading = true;
    Promise.all([this.getcustomerInfo(), this.getCustomerAcc()]).then(
      (data: any[]) => {
        let result = {
          customer: data[0][0],
          customerAcc: data[1],
        };
        this.customerInfo = result.customer;
        this._glopal.currentHeader = `تفاصيل حساب | ${this.customerInfo.customerName}`;

        this.fillListData(this.makeCustomerAcc(result.customerAcc));

        this._mainService.handleTableHeight();
        this._glopal.loading = false;
      }
    );
  }

  makeCustomerAcc(data: any[]) {
    this.accArr = [];

    let firstRow = {
      id: 1,
      recieptType: 'رصيد اول',
      receiptDetail: 'رصيد اول',
      uncompleted: '',
      minVal:
        this.customerInfo.customerPaid < 0
          ? this.customerInfo.customerPaid * -1
          : 0,
      addVal:
        this.customerInfo.customerPaid >= 0
          ? this.customerInfo.customerPaid
          : 0,
      balance: this.customerInfo.customerPaid,
      addtaxes: 0,
    };

    this.accArr = [...this.accArr, firstRow];

    for (let i = 0; i < data.length; i++) {
      const discoundVal =
        data[i].discound > 0
          ? (data[i].receiptVal * data[i].discound) / 100
          : 0;

      const TaxVal = (data[i].addtaxes * data[i].receiptVal) / 100;

      const total = data[i].receiptVal - discoundVal + TaxVal;
      // > 0 ? data[i].receiptVal - discoundVal : data[i].receiptVal;

      const minVal =
        data[i].recieptType.includes('ايصال استلام نقدية') ||
        data[i].recieptType.includes('فاتورة شراء') ||
        data[i].recieptType.includes('اذن تشغيل مُعدة')
          ? total
          : 0;
      const addVal =
        data[i].recieptType.includes('ايصال صرف نقدية') ||
        data[i].recieptType.includes('فاتورة بيع')
          ? total
          : 0;

      const balance = addVal - minVal + this.accArr[i].balance;

      let newData = {
        id: i + 2,
        receiptId: data[i].receiptId,
        recieptType: data[i].recieptType,
        receiptDetail: data[i].recieptType.includes('فاتورة')
          ? this.receiptDetail(
              data[i].receiptDetail,
              data[i].productQty,
              data[i].productUnit,
              data[i].productPrice
            )
          : data[i].receiptDetail,
        uncompleted: data[i].uncompleted,
        discound: discoundVal,
        minVal: minVal,
        addVal: addVal,
        balance: balance,
        date_time: data[i].date_time.replace('T', ' '),
        date: data[i].date_time,
        note: data[i].note,
        addtaxes: data[i].addtaxes,
      };
      this.accArr = [...this.accArr, newData];
    }

    return this.accArr;
  }

  receiptDetail(
    detail: string,
    productQty: number,
    productUnit: number,
    unitPrice: number
  ): string {
    // const unitDetail = this.calcUnits(productQty, productUnit, unitPrice);
    return `${productQty} ${detail} ${unitPrice}`;
    //return `${unitDetail.backet}${unitDetail.unit} ${detail} ${unitDetail.backetPrice}`;
  }

  /* calcUnits(
    qty: number,
    productUnit: number,
    unitPrice: number
  ): { backet: number; unit: string; backetPrice: number } {
    const qtyFloat = `${qty / productUnit}`;
    let dot = qtyFloat.indexOf('.');

    const seperate = {
      backet: dot > 0 ? parseInt(qtyFloat.slice(0, dot)) : qty / productUnit,
      unit:
        dot > 0
          ? `.${Math.round(
              parseFloat(qtyFloat.slice(dot, qtyFloat.length)) * productUnit
            )}`
          : '',
      backetPrice: unitPrice * productUnit,
    };

    return seperate;
  } */

  /* searchResults(accArr: any[]) {
    let filteredArr = this.searchTxt
      ? accArr.filter(
          (a) =>
            a?.recieptType?.includes(this.searchTxt) ||
            a?.receiptDetail?.includes(this.searchTxt) ||
            a?.minVal?.toString().includes(this.searchTxt) ||
            a?.addVal?.toString().includes(this.searchTxt) ||
            a?.balance?.toString().includes(this.searchTxt) ||
            a?.date_time?.includes(this.searchTxt) ||
            a?.date?.includes(this.searchTxt) ||
            a?.note?.includes(this.searchTxt)
        )
      : accArr;

    this.searchResult = {
      onUs: filteredArr
        .map((a) => a.minVal)
        .reduce((a: number, b: number) => a + b, 0),

      toUs: filteredArr
        .map((a) => a.addVal)
        .reduce((a: number, b: number) => a + b, 0),
    };
  } */

  getcustomerInfo() {
    return new Promise((res) => {
      if (this.id)
        this._customerService
          .getCustomer(this.id)
          .subscribe((data: Customer[]) => {
            res(data);
          });
    });
  }

  getCustomerAcc() {
    return new Promise((res) => {
      if (this.id)
        this._customerService
          .getCustomerAcc(this.id)
          .subscribe((data: any[]) => {
            res(data);
          });
    });
  }

  fillListData = (pureData: any) => {
    const data = pureData.reverse();
    this.listData = new MatTableDataSource(data);
    this.listData.sort = this.sort;
    this.listData.paginator = this.paginator;
    // this.searchResults(pureData);
    this.tempAccArry = pureData;
  };

  search() {
    if (this.marked) this.clearCalcArr();
    this.listData.filter = this.searchTxt;
    // this.searchResults(this.tempAccArry);
  }

  gotoReceipt(recieptType: string, id: string) {
    if (recieptType.includes('ايصال'))
      this._router.navigate([`/SafeReceipt/${id}`]);
    if (recieptType.includes('فاتورة'))
      this._router.navigate([`/StockInvoice/${id}`]);
    if (recieptType.includes('رصيد اول'))
      this._router.navigate([`/addCustomer/${this.customerInfo.customerId}`]);
    if (recieptType.includes('اذن تشغيل مُعدة'))
      this._router.navigate([`/UpdateTruckorder/${id}`]);
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
    }
  }

  filterList(cond: string) {
    this.searchTxt = '';

    if (cond == 'showAll') {
      this.isFiltered = false;
      this.fillListData(this.accArr.reverse());
      this.searchDate = { from: '', to: '' };
    }

    if (cond == 'filterUncomplete') {
      this.isFiltered = true;
      let uncompleted = this.accArr.filter((a) => a.uncompleted);
      this.fillListData(uncompleted);
      this._mainService.scrollTo('customerInformationTable');
    }
  }

  printDocument() {
    window.print();
  }

  marked: boolean = false;
  markColor: string = '';

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
            const safeReceipt = this.recieptData_forDb(result, 'عميل');
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
              this.onStart();
            });
          }
        }
      }
    });
  };

  mackDiscoundAcc(safeId: number) {
    let safeReceipt = new SafeReceipt();
    safeReceipt.safeId = safeId;
  }

  /* main discound button */
  addDiscound() {
    const safeReceipt = new SafeReceipt();
    safeReceipt.customerId = this.customerInfo.customerId;
    safeReceipt.customerName = this.customerInfo.customerName;
    safeReceipt.receiptKind = 'ايصال استلام نقدية';
    safeReceipt.transactionAccKind = 'موظفين'
    safeReceipt.recieptNote = `"${this.customerInfo.customerName}"`;
    safeReceipt.date_time = this._mainService.makeTime_date(
      new Date(Date.now())
    );
    this.openDiscoundDialog(safeReceipt);
  }

  /* discound when click on a balance */
  discoundThis(balance: number, date: string) {
    const safeReceipt = new SafeReceipt();
    safeReceipt.customerId = this.customerInfo.customerId;
    safeReceipt.customerName = this.customerInfo.customerName;
    safeReceipt.receiptKind =
      balance > 0 ? 'ايصال استلام نقدية' : 'ايصال صرف نقدية';
    safeReceipt.receiptVal = balance > 0 ? balance : balance * -1;
    safeReceipt.date_time = date;
    safeReceipt.recieptNote = `"${this.customerInfo.customerName}"`;
    this.openDiscoundDialog(safeReceipt);
  }

  recieptData_forDb(
    receipt: SafeReceipt,
    transactionAccKind: string
  ): SafeReceipt {
    return {
      safeReceiptId: receipt.safeReceiptId ? receipt.safeReceiptId : null,
      receiptKind: receipt.receiptKind,
      date_time: receipt.date_time,
      //fst safe inpts
      safeName: receipt.safeName,
      currentSafeVal: receipt.currentSafeVal,
      safeId: receipt.safeId,
      // sec section
      transactionAccKind: transactionAccKind,
      // acc inpts
      accId: transactionAccKind == 'حساب' ? receipt.accId : 0,
      AccName: transactionAccKind == 'حساب' ? receipt.AccName : '',
      currentAccVal: receipt.currentAccVal ? receipt.currentAccVal : 0,
      //safe inpts
      secSafeName: receipt.secSafeName ? receipt.secSafeName : '',
      secSafeId: receipt.secSafeId ? receipt.secSafeId : 1,
      current_SecSafeVal: receipt.current_SecSafeVal
        ? receipt.current_SecSafeVal
        : 0,
      // customer inpts
      customerId: transactionAccKind == 'عميل' ? receipt.customerId : 1,
      customerName: receipt.customerName ? receipt.customerName : '',
      currentCustomerVal: receipt.currentCustomerVal
        ? receipt.currentCustomerVal
        : 0,
      // concreteCustomer inpts
      concreteCustomer_id: '0',
      concreteCustomerName: '',
      concreteCustomerVal: 0,
      // truck
      truckId: '0',
      truckName: '',
      truckCurrentVal: 0,
      // truckCustomer inpts
      truckCustomerId: '0',
      truckCustomerName: '',
      truckCustomerVal: 0,
      // worker
      workerId: '0',
      workerName: '',
      workerCurrentVal: 0,
      // user inpts
      receiptVal: receipt.receiptVal,
      recieptNote: receipt.recieptNote ? receipt.recieptNote : '',
      madeBy: this._auth.uName.realName,
      isUpdated: false,
    };
  }
}
