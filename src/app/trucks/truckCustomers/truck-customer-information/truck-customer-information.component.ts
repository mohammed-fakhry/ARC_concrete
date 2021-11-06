import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { TruckCustomer } from 'src/app/classes/truck-customer';
import { MainService } from 'src/app/services/main.service';
import { GlobalVarsService } from 'src/app/services/global-vars.service';
import { TruckService } from 'src/app/services/truck.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Truck } from 'src/app/classes/truck';
import { FilterByDateDialogComponent } from 'src/app/dialogs/filter-by-date-dialog/filter-by-date-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { AccHeaderTotals } from 'src/app/classes/acc-header-totals';
import { SafeReceipt } from 'src/app/classes/safe-receipt';
import { AddDiscoundDialogComponent } from 'src/app/dialogs/add-discound-dialog/add-discound-dialog.component';
import { SafeService } from 'src/app/services/safe.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-truck-customer-information',
  templateUrl: './truck-customer-information.component.html',
  styleUrls: ['./truck-customer-information.component.scss'],
})
export class TruckCustomerInformationComponent implements OnInit {
  id: string | null = null;

  listData: MatTableDataSource<any> | any;

  truckTypes: {
    meter: {
      trucks: any[];
      truckTotal: number;
      loaders: any[];
      loadersTotal: number;
      diggers: any[];
      diggersTotal: number;
      harras: any[];
      harrasTotal: number;
    };

    daily: {
      trucks: any[];
      truckTotal: number;
      loaders: any[];
      loadersTotal: number;
      diggers: any[];
      diggersTotal: number;
      harras: any[];
      harrasTotal: number;
    };

    hourly: {
      trucks: any[];
      truckTotal: number;
      loaders: any[];
      loadersTotal: number;
      diggers: any[];
      diggersTotal: number;
      harras: any[];
      harrasTotal: number;
    };
  } = {
    meter: {
      trucks: [],
      truckTotal: 0,
      loaders: [],
      loadersTotal: 0,
      diggers: [],
      diggersTotal: 0,
      harras: [],
      harrasTotal: 0,
    },

    daily: {
      trucks: [],
      truckTotal: 0,
      loaders: [],
      loadersTotal: 0,
      diggers: [],
      diggersTotal: 0,
      harras: [],
      harrasTotal: 0,
    },

    hourly: {
      trucks: [],
      truckTotal: 0,
      loaders: [],
      loadersTotal: 0,
      diggers: [],
      diggersTotal: 0,
      harras: [],
      harrasTotal: 0,
    },
  };

  countTotals = {
    meter: 0,
    daily: 0,
    hourly: 0,
  };

  displayedColumns: string[] = [
    'id',
    'date_time',
    'receiptDetail',
    'minVal',
    'addVal',
    'balance',
    'note',
  ];

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  searchTxt: string = '';

  customerInfo: TruckCustomer = new TruckCustomer();

  pureAcc: any[] = [];
  tempAccArry: any[] = [];
  accArr: any[] = [];

  calcArr: {
    arr: number[];
    total: number;
  } = { arr: [], total: 0 };

  headerTotals: AccHeaderTotals = new AccHeaderTotals();

  marked: boolean = false;
  markColor: string = '';

  truckList: Truck[] = [];

  showTruckWorks: boolean = false;

  searchDate: { from: string; to: string } = { from: '', to: '' };

  isFiltered: boolean = false;

  constructor(
    public _mainService: MainService,
    public _glopal: GlobalVarsService,
    public _truckService: TruckService,
    public _router: Router,
    public _safeService: SafeService,
    public _snackBar: MatSnackBar,
    public _auth: AuthService,
    public activeRoute: ActivatedRoute,
    public _dialog: MatDialog
  ) {
    this._glopal.loading = true;
    this._glopal.currentHeader = 'تفاصيل حساب عميل مُعدات';
  }

  ngOnInit(): void {
    this.onStart();

    window.addEventListener('resize', () => {
      this._mainService.handleTableHeight();
    });
  }

  onStart() {
    this.id = this.activeRoute.snapshot.paramMap.get('id');

    Promise.all([
      this.getTruckCustomerAcc(),
      this.gettruckCustomer(),
      this.getTruckList(),
    ])
      .then((data: any) => {
        const result = {
          acc: data[0],
          customer: data[1][0],
          trucks: data[2],
        };

        this.truckList = result.trucks;
        this.customerInfo = result.customer;

        /* remove 0 price from data */
        this.pureAcc = result.acc.filter((acc: any) => acc.orderPrice > 0);

        this.tempAccArry = [...this.pureAcc];
        this.fillListData(this.makeCustomerAcc(this.pureAcc));

        // this.maketTruckWorks(result.acc);
      })
      .then(() => {
        this._mainService.handleTableHeight();
        this._glopal.loading = false;
      });
  }

  clearTruckTypes() {
    this.truckTypes = {
      meter: {
        trucks: [],
        truckTotal: 0,
        loaders: [],
        loadersTotal: 0,
        diggers: [],
        diggersTotal: 0,
        harras: [],
        harrasTotal: 0,
      },

      daily: {
        trucks: [],
        truckTotal: 0,
        loaders: [],
        loadersTotal: 0,
        diggers: [],
        diggersTotal: 0,
        harras: [],
        harrasTotal: 0,
      },

      hourly: {
        trucks: [],
        truckTotal: 0,
        loaders: [],
        loadersTotal: 0,
        diggers: [],
        diggersTotal: 0,
        harras: [],
        harrasTotal: 0,
      },
    };
  }

  setTruckWorksByType(
    truckInfo: Truck,
    values: { truck_meter: any; truck_daily: any; truck_hourly: any }
  ) {
    if (truckInfo.truckType == 'سيارة') {
      this.truckTypes.meter.trucks = [
        ...this.truckTypes.meter.trucks,
        values.truck_meter,
      ];

      this.truckTypes.daily.trucks = [
        ...this.truckTypes.daily.trucks,
        values.truck_daily,
      ];

      this.truckTypes.hourly.trucks = [
        ...this.truckTypes.hourly.trucks,
        values.truck_hourly,
      ];
    }

    if (truckInfo.truckType == 'لودر') {
      this.truckTypes.meter.loaders = [
        ...this.truckTypes.meter.loaders,
        values.truck_meter,
      ];

      this.truckTypes.daily.loaders = [
        ...this.truckTypes.daily.loaders,
        values.truck_daily,
      ];

      this.truckTypes.hourly.loaders = [
        ...this.truckTypes.hourly.loaders,
        values.truck_hourly,
      ];
    }

    if (truckInfo.truckType == 'حفار') {
      this.truckTypes.meter.diggers = [
        ...this.truckTypes.meter.diggers,
        values.truck_meter,
      ];

      this.truckTypes.daily.diggers = [
        ...this.truckTypes.daily.diggers,
        values.truck_daily,
      ];

      this.truckTypes.hourly.diggers = [
        ...this.truckTypes.hourly.diggers,
        values.truck_hourly,
      ];
    }

    if (truckInfo.truckType == 'هراس') {
      this.truckTypes.meter.harras = [
        ...this.truckTypes.meter.harras,
        values.truck_meter,
      ];

      this.truckTypes.daily.harras = [
        ...this.truckTypes.daily.harras,
        values.truck_daily,
      ];

      this.truckTypes.hourly.harras = [
        ...this.truckTypes.hourly.harras,
        values.truck_hourly,
      ];
    }
  }

  maketTruckWorks() {
    this.clearTruckTypes();
    const trucksIds = [
      ...new Set(this.tempAccArry.map((truck: any) => truck.truckId)),
    ];

    for (let i = 0; i < trucksIds.length; i++) {
      const truckInfo = this.truckList.find(
        (truck) => truck.id == trucksIds[i]
      );

      if (truckInfo) {
        const truck_daily = {
          truckInfo: truckInfo,
          totalWork: this.tempAccArry
            .filter(
              (d: any) => d.truckId == trucksIds[i] && d.loadingType == 'يومية'
            )
            .map((d: any) => d.LoadTimes)
            .reduce((a: any, b: any) => a + b, 0),
        };

        const truck_hourly = {
          truckInfo: truckInfo,
          totalWork: this.tempAccArry
            .filter(
              (d: any) => d.truckId == trucksIds[i] && d.loadingType == 'ساعة'
            )
            .map((d: any) => d.LoadTimes)
            .reduce((a: any, b: any) => a + b, 0),
        };

        const truck_meter = {
          truckInfo: truckInfo,
          totalWork: this.tempAccArry
            .filter(
              (d: any) => d.truckId == trucksIds[i] && d.loadingType == 'متر'
            )
            .map((d: any) => d.LoadTimes * d.truckCapacity)
            .reduce((a: any, b: any) => a + b, 0),
        };

        this.setTruckWorksByType(truckInfo, {
          truck_meter: truck_meter,
          truck_daily: truck_daily,
          truck_hourly: truck_hourly,
        });
      }
    }

    this.truckTypes.meter.diggersTotal = this.truckTypes.meter.diggers.reduce(
      (a: any, b: any) => a + b.totalWork,
      0
    );
    this.truckTypes.meter.harrasTotal = this.truckTypes.meter.harras.reduce(
      (a: any, b: any) => a + b.totalWork,
      0
    );
    this.truckTypes.meter.loadersTotal = this.truckTypes.meter.loaders.reduce(
      (a: any, b: any) => a + b.totalWork,
      0
    );
    this.truckTypes.meter.truckTotal = this.truckTypes.meter.trucks.reduce(
      (a: any, b: any) => a + b.totalWork,
      0
    );

    this.truckTypes.daily.diggersTotal = this.truckTypes.daily.diggers.reduce(
      (a: any, b: any) => a + b.totalWork,
      0
    );
    this.truckTypes.daily.harrasTotal = this.truckTypes.daily.harras.reduce(
      (a: any, b: any) => a + b.totalWork,
      0
    );
    this.truckTypes.daily.loadersTotal = this.truckTypes.daily.loaders.reduce(
      (a: any, b: any) => a + b.totalWork,
      0
    );
    this.truckTypes.daily.truckTotal = this.truckTypes.daily.trucks.reduce(
      (a: any, b: any) => a + b.totalWork,
      0
    );

    this.truckTypes.hourly.diggersTotal = this.truckTypes.hourly.diggers.reduce(
      (a: any, b: any) => a + b.totalWork,
      0
    );
    this.truckTypes.hourly.harrasTotal = this.truckTypes.hourly.harras.reduce(
      (a: any, b: any) => a + b.totalWork,
      0
    );
    this.truckTypes.hourly.loadersTotal = this.truckTypes.hourly.loaders.reduce(
      (a: any, b: any) => a + b.totalWork,
      0
    );
    this.truckTypes.hourly.truckTotal = this.truckTypes.hourly.trucks.reduce(
      (a: any, b: any) => a + b.totalWork,
      0
    );

    this.countTotals = {
      daily:
        this.truckTypes.daily.harrasTotal +
        this.truckTypes.daily.diggersTotal +
        this.truckTypes.daily.loadersTotal +
        this.truckTypes.daily.truckTotal,
      hourly:
        this.truckTypes.hourly.harrasTotal +
        this.truckTypes.hourly.diggersTotal +
        this.truckTypes.hourly.loadersTotal +
        this.truckTypes.hourly.truckTotal,
      meter:
        this.truckTypes.meter.harrasTotal +
        this.truckTypes.meter.diggersTotal +
        this.truckTypes.meter.loadersTotal +
        this.truckTypes.meter.truckTotal,
    };

    setTimeout(() => {
      this.showTruckWorks = true;
    }, 100);
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
      const minVal = data[i].receiptDetail.includes('ايصال استلام نقدية')
        ? data[i].totalVal
        : 0;
      const addVal =
        data[i].receiptDetail.includes('ايصال صرف نقدية') ||
        !data[i].receiptDetail.includes('ايصال استلام نقدية')
          ? data[i].totalVal
          : 0;

      const balance = addVal - minVal + this.accArr[i].balance;

      let newData = {
        id: i + 2,
        receiptId: data[i].receiptId,
        receiptDetail: data[i].receiptDetail,
        orderPrice: data[i].orderPrice,
        minVal: minVal,
        addVal: addVal,
        balance: balance,
        date_time: data[i].date_time,
        date: data[i].date_time.replace(' ', 'T'),
        note: data[i].note,
      };

      this.accArr = [...this.accArr, newData];
    }

    return this.accArr;
  }

  getTruckCustomerAcc() {
    return new Promise((res) => {
      if (this.id)
        this._truckService
          .getTruckCustomerAcc(this.id)
          .subscribe((data: any[]) => res(data));
    });
  }

  gettruckCustomer(): Promise<TruckCustomer[]> {
    return new Promise((res) => {
      if (this.id)
        this._truckService
          .truckCustomersList(this.id)
          .subscribe((data: TruckCustomer[]) => res(data));
    });
  }

  getTruckList(): Promise<Truck[]> {
    return new Promise((res) => {
      this._truckService.trucksList().subscribe((data: Truck[]) => {
        res(data);
      });
    });
  }

  fillListData = (pureData: any) => {
    const data = pureData.reverse();
    this.listData = new MatTableDataSource(data);
    this.listData.sort = this.sort;
    this.listData.paginator = this.paginator;
    this.setHeaderTotals(data.reverse());

    this.maketTruckWorks()
  };

  setHeaderTotals(accArr: any) {
    if (accArr.length > 0) {
      this.headerTotals.openedVal =
        accArr[0].balance +
        (accArr[0].receiptDetail == 'رصيد اول'
          ? 0
          : accArr[0].minVal - accArr[0].addVal);

      const filteredAcc = accArr.filter(
        (acc: any) => acc.receiptDetail != 'رصيد اول'
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
    if (cond) {
      // let boxes = document.querySelectorAll('.box') as HTMLElement[];

      const col = document.querySelectorAll('.col-lg-3');

      const headerBox = document.querySelector('.headerBox') as HTMLElement;

      const customerInformationTable = document.querySelector(
        '#customerInformationTable'
      ) as HTMLElement;

      customerInformationTable.classList.add('d-none');

      headerBox.style.display = 'none';

      if (cond == 'all') {
        col.forEach((e: HTMLElement | any) => {
          return e.classList.add('col-md-6');
        });

        window.print();

        customerInformationTable.classList.remove('d-none');

        col.forEach((e: HTMLElement | any) => {
          return e.classList.remove('col-md-6');
        });
      } else {
        col.forEach((e: HTMLElement | any) => {
          return e.classList.add('d-none');
        });

        // truckworkes
        const cardHeader = document.querySelectorAll('.cardHeader');
        const trucksDom = document.querySelector(`#${cond}`) as HTMLElement;

        cardHeader.forEach((e: HTMLElement | any) => {
          return e.classList.add('d-none');
        });

        trucksDom.classList.remove('d-none');
        trucksDom.classList.add('col-md-6');

        window.print();

        customerInformationTable.classList.remove('d-none');

        cardHeader.forEach((e: HTMLElement | any) => {
          return e.classList.remove('d-none');
        });

        col.forEach((e: HTMLElement | any) => {
          return e.classList.remove('d-none');
        });

        cardHeader.forEach((e: HTMLElement | any) => {
          return e.classList.remove('d-none');
        });

        //trucksDom.classList.remove('d-none')
        trucksDom.classList.remove('col-md-6');
      }

      headerBox.style.display = 'block';
    } else {
      const truckworkes = document.querySelector(`#truckworkes`) as HTMLElement;

      truckworkes.classList.add('d-none')
      window.print();
      truckworkes.classList.remove('d-none')
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
            const safeReceipt = this.recieptData_forDb(result, 'عميل معدات');
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

    // customer information
    safeReceipt.truckCustomerId =
      transactionAccKind == 'عميل معدات' ? this.customerInfo?.id ?? '' : '0';
    safeReceipt.truckCustomerName =
      transactionAccKind == 'عميل معدات' ? this.customerInfo.fullName : '';
    safeReceipt.receiptVal = receipt.receiptVal;
    safeReceipt.recieptNote = receipt.recieptNote ? receipt.recieptNote : '';
    safeReceipt.madeBy = this._auth.uName.realName;
    return safeReceipt;
  }

  gotoReceipt(receiptDetail: string, id: string) {
    if (
      receiptDetail.includes('ايصال استلام نقدية') ||
      receiptDetail.includes('ايصال صرف نقدية')
    ) {
      this._router.navigate([`/SafeReceipt/${id}`]);
      return;
    }

    if (
      !receiptDetail.includes('ايصال استلام نقدية') &&
      !receiptDetail.includes('ايصال صرف نقدية')
    ) {
      this._router.navigate([`/UpdateTruckorder/${id}`]);
      return;
    }

    if (receiptDetail.includes('رصيد اول')) {
      this._router.navigate([`/UpdateTruckCustomer/${this.customerInfo.id}`]);
      return;
    }
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

      /* .filter((acc: any) => acc.orderPrice > 0) */

      let newArr = this.accArr.filter((acc) => {
        return (
          acc.date_time >= start &&
          acc.date_time <= end /* && acc.orderPrice > 0 */
        );
      });

      this.tempAccArry = this.pureAcc.filter((acc) => {
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

      this.tempAccArry = this.pureAcc;
    }
  }
}
