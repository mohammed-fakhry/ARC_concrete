import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { SafeData } from 'src/app/classes/safe-data';
import { MainService } from 'src/app/services/main.service';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalVarsService } from 'src/app/services/global-vars.service';
import { SafeService } from 'src/app/services/safe.service';
import { MatDialog } from '@angular/material/dialog';
import { FilterByDateDialogComponent } from 'src/app/dialogs/filter-by-date-dialog/filter-by-date-dialog.component';

@Component({
  selector: 'app-safe-information',
  templateUrl: './safe-information.component.html',
  styleUrls: ['./safe-information.component.scss'],
})
export class SafeInformationComponent implements OnInit {
  id: string | null = null;
  safeInfo: SafeData = new SafeData();

  calcArr: {
    arr: number[];
    total: number;
  } = { arr: [], total: 0 };

  listData: MatTableDataSource<any> | any;

  displayedColumns: string[] = [
    'id',
    'date_time',
    /* 'fromDayes', */
    'receiptKind',
    'receiptDetail',
    'minVal',
    'addVal',
    'balance',
    'recieptNote',
    'madeBy',
  ];

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  searchTxt: string = '';

  /* searchResult: {
    onUs: number;
    toUs: number;
  } = {
    onUs: 0,
    toUs: 0,
  }; */

  searchDate: { from: string; to: string } = { from: '', to: '' };
  accArr: any[] = [];
  tempAccArry: any[] = [];

  isFiltered: boolean = false;

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
    // this._auth.returnLog();
    window.addEventListener('resize', () => {
      this._mainService.handleTableHeight();
    });

    this.id = this.activeRoute.snapshot.paramMap.get('id');

    /* array for markAndCalc */
    this.calcArr = {
      arr: [],
      total: 0,
    };

    this.onStart();
  }

  onStart() {
    this._glopal.loading = true;
    Promise.all([this.getSafe(), this.getSafeTransaction()]).then(
      (data: any[]) => {
        let result = {
          safe: data[0][0],
          safeAcc: data[1],
        };
        this._glopal.currentHeader = `حركة خزنة | ${result.safe.safeName}`;
        this.safeInfo = result.safe;
        let listData = this.makeSafeAcc(result.safeAcc);
        this.fillListData(listData);
        this._mainService.handleTableHeight();
        this._glopal.loading = false;
      }
    );
  }

  getSafe() {
    return new Promise((res) => {
      if (this.id)
        this._safeService.getSafes(this.id).subscribe((data: SafeData[]) => {
          res(data);
        });
    });
  }

  getSafeTransaction() {
    return new Promise((res) => {
      if (this.id)
        this._safeService
          .getsafeTranseAction(this.id)
          .subscribe((data: any[]) => {
            res(data);
          });
    });
  }

  makeSafeAcc(data: any[]) {
    this.accArr = [];

    let firstRow = {
      id: 1,
      receiptKind: 'رصيد اول',
      receiptDetail: '',
      routeTo: '',
      minVal: this.safeInfo.opendVal < 0 ? this.safeInfo.opendVal : 0,
      addVal: this.safeInfo.opendVal >= 0 ? this.safeInfo.opendVal : 0,
      balance: this.safeInfo.opendVal,
      date_time: '',
      recieptNote: '',
      madeBy: '',
    };

    this.accArr = [...this.accArr, firstRow];

    for (let i = 0; i < data.length; i++) {
      let minVal = data[i].receiptKind.includes('ايصال استلام نقدية')
        ? data[i].receiptVal
        : 0;
      let addVal = data[i].receiptKind.includes('ايصال صرف نقدية')
        ? data[i].receiptVal
        : 0;
      let balance = minVal - addVal + this.accArr[i].balance;

      let receiptDetail: string = '';
      let routeTo: string = '';

      let toolTip: string = '';

      if (data[i].customerName) {
        receiptDetail = data[i].customerName;
        routeTo = `/customerInformation/${data[i].customerId}`;
        toolTip = "مورد | مستهلك"
      }
      if (data[i].AccName) {
        receiptDetail = data[i].AccName;
        routeTo = `/OtherAccInformation/${data[i].accId}`;
        toolTip = "مصاريف"
      }
      if (data[i].concreteCustomerName) {
        routeTo = `/ConcreteCustomerInformation/${data[i].concreteCustomer_id}`;
        receiptDetail = data[i].concreteCustomerName;
        toolTip = 'عميل خرسانة'
      }

      if (data[i].truckCustomerName) {
        routeTo = `/TruckCustomerInformation/${data[i].truckId}`;
        receiptDetail = data[i].truckCustomerName;
        toolTip = 'عميل معدات'
      }

      if (data[i].truckName) {
        routeTo = `/truckLog/${data[i].truckId}`;
        receiptDetail = data[i].truckName;
        toolTip = 'دفعة من تشغيل معدة'
      }

      let newData = {
        id: i + 2,
        safeReceiptId: data[i].safeReceiptId,
        receiptKind: data[i].receiptKind,
        receiptDetail: receiptDetail,
        routeTo: routeTo,
        toolTip: toolTip,
        minVal: minVal,
        addVal: addVal,
        balance: balance,
        date_time: data[i].date_time.replace('T', ' '),
        recieptNote: data[i].recieptNote,
        madeBy: data[i].madeBy,
      };
      this.accArr = [...this.accArr, newData];
    }

    // this.benfordRule(this.accArr);

    return this.accArr;
  }

  routeTo(data: any): string {
    if (data.customerName) {
      return `/customerInformation/${data.customerId}`;
    }

    if (data.AccName) {
      return `/OtherAccInformation/${data.accId}`;
    }

    if (data.truckCustomerName) {
      return `/OtherAccInformation/${data.truckCustomerId}`;
    }

    return '';
  }

  /* benfordRule(accArr: any[]) {
    let test = `${accArr[15].minVal}`;
    let one = accArr.filter((a) => {
      const minVal = `${a.minVal}`;
      return minVal[0] == '1';
    });

    let total = one.length;
    let length = accArr.length;

    let benford = (length / total) * 100;

    console.log(benford);
  } */

  /* getBenfordData() {
    // Returns a list of approximately 1000 numbers
    // approximately following the Benford Distribution.

    const BENFORD_PERCENTAGES = [
      0, 0.301, 0.176, 0.125, 0.097, 0.079, 0.067, 0.058, 0.051, 0.046,
    ];

    let BenfordData = [];

    let randomfactor;
    let start;
    let max;

    for (let firstdigit = 1; firstdigit <= 9; firstdigit++) {
      // get a random number between 0.8 and 1.2
      randomfactor = Math.random() * 0.4 + 0.8;

      max = Math.floor(1000 * BENFORD_PERCENTAGES[firstdigit] * randomfactor);

      for (let numcount = 1; numcount < max; numcount++) {
        start = firstdigit * 1000;
        BenfordData.push(this.randBetween(start, start + 1000));
      }
    }

    return BenfordData;
  } */

  /* randBetween(min: any, max: any) {
    const range = max - min;

    let n = Math.random() * range + min;

    return n;
  } */

  /* searchResults(accArr: any[]) {
    let filteredArr = this.searchTxt
      ? accArr.filter(
          (a) =>
            a?.receiptKind?.includes(this.searchTxt) ||
            a?.receiptDetail?.includes(this.searchTxt) ||
            a?.minVal?.toString().includes(this.searchTxt) ||
            a?.addVal?.toString().includes(this.searchTxt) ||
            a?.balance?.toString().includes(this.searchTxt) ||
            a?.date_time?.includes(this.searchTxt) ||
            a?.madeBy?.includes(this.searchTxt) ||
            a?.recieptNote?.includes(this.searchTxt)
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
    if (from) {
      let start = `${from} 00:00`;
      let end = `${to} 23:59`;

      let newArr = this.accArr.filter((acc: any) => {
        return acc.date_time >= start && acc.date_time <= end;
      });
      this.isFiltered = true;
      this.fillListData(newArr);
    } else {
      this.isFiltered = false;
      this.fillListData(this.accArr);
      this.searchDate = { from: '', to: '' };
    }
  }

  toReceipt(id: string, receiptKind: string) {
    if (receiptKind != 'رصيد اول')
      this._router.navigate([`/SafeReceipt/${id}`]);
    else this._router.navigate([`/AddSafe/${this.id}`]);
  }

  printDocument() {
    window.print();
  }

  marked: boolean = false;

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
    markVal.forEach((e: HTMLElement | any) => e.classList.remove('calcMark'));

    this.marked = false;
  }
}
