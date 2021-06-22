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

@Component({
  selector: 'app-concrete-customer-information',
  templateUrl: './concrete-customer-information.component.html',
  styleUrls: ['./concrete-customer-information.component.scss'],
})
export class ConcreteCustomerInformationComponent implements OnInit {
  id: string | null = null;

  listData: MatTableDataSource<any> | any;

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

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

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

  showCementQty: boolean = false;

  acementTotals = {
    in: 0,
    out: 0,
  };

  /*
  {
  "concreteReceipt_id": "8",
  "date_time": "2021-06-06 18:24",
  "receiptDetail": "263 X خرسانة لبانى محتوى 150 - 2",
  "notes": "سقف العاشر برج 1D",
  "total": 113710.51,
  "totalDiscound": 14,
  "concreteCustomer": "المرشدى"
  },
  */

  constructor(
    public _mainService: MainService,
    public _glopal: GlobalVarsService,
    public _concrete: ConcreteService,
    public activeRoute: ActivatedRoute,
    public _dialog: MatDialog
  ) {
    (this._glopal.loading = true),
      (this._glopal.currentHeader = 'تفاصيل حساب عميل خرسانة');
  }

  ngOnInit(): void {
    window.addEventListener('resize', () => {
      this._mainService.handleTableHeight();
    });
    this.onStart();
  }

  onStart() {
    this.id = this.activeRoute.snapshot.paramMap.get('id');

    Promise.all([
      this.getCustomer(),
      this.getCustomerAcc(),
      /* this.getCementUses(), */
    ])
      .then((data: any) => {
        const result = {
          customer: data[0][0],
          acc: data[1],
          /* cementUses: data[2], */
        };

        this.customerInfo = result.customer;

        if (this.customerInfo.cementCustomerId) {
          this.getCementUses().then((dataUses) => {
            this.tempCementUses = dataUses;
            this.cementUses = this.makeCementAcc(dataUses);
          });
        }

        this.fillListData(this.makeCustomerAcc(result.acc));
      })
      .then(() => {
        this._glopal.loading = false;
        this._mainService.handleTableHeight();
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
        receiptSerial: `${isReceipt ? 'ايصال' : 'فاتورة'} ${
          data[i].receiptSerial
        }${data[i].customerProject ? ' | ' + data[i].customerProject : ''}`,
        //customerProject: data[i].customerProject,
        receiptDetail: `${data[i].receiptDetail}`,
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

    this.acementTotals = {
      in: arr.map((a) => a.qty_in).reduce((a, b) => a + b, 0),
      out: arr.map((a) => a.qty_out).reduce((a, b) => a + b, 0),
    };

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
  };

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

  printDocument() {
    window.print();
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

  toCementQty(cond?: string) {
    this.showCementQty = true;
    setTimeout(() => this._mainService.scrollTo('cementQty', true), 100);
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
    }
  }

  filterList(cond: string) {
    this.searchTxt = '';

    if (cond == 'showAll') {
      this.isFiltered = false;
      this.fillListData(this.accArr.reverse());
      this.searchDate = { from: '', to: '' };

      this.cementUses = this.makeCementAcc(this.tempCementUses);
    }
  }
}
