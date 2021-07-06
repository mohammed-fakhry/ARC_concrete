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

  /*
  id: i + 2,
  receiptId: data[i].receiptId,
  receiptDetail: data[i].receiptDetail,
  minVal: minVal,
  addVal: addVal,
  balance: balance,
  date_time: data[i].date_time,
  note: data[i].note,
  */
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

  totals: { onUs: number; toUs: number } = { toUs: 0, onUs: 0 };

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
        this.pureAcc = result.acc;

        this.tempAccArry = [...this.pureAcc];
        this.fillListData(
          this.makeCustomerAcc(
            this.pureAcc.filter((acc: any) => acc.orderPrice > 0)
          )
        );

        // this.maketTruckWorks(result.acc);
      })
      .then(() => {
        this._mainService.handleTableHeight();
        this._glopal.loading = false;
      });
  }

  maketTruckWorks() {
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

        if (truckInfo.truckType == 'سيارة') {
          this.truckTypes.meter.trucks = [
            ...this.truckTypes.meter.trucks,
            truck_meter,
          ];

          this.truckTypes.daily.trucks = [
            ...this.truckTypes.daily.trucks,
            truck_daily,
          ];

          this.truckTypes.hourly.trucks = [
            ...this.truckTypes.hourly.trucks,
            truck_hourly,
          ];
        }

        if (truckInfo.truckType == 'لودر') {
          this.truckTypes.meter.loaders = [
            ...this.truckTypes.meter.loaders,
            truck_meter,
          ];

          this.truckTypes.daily.loaders = [
            ...this.truckTypes.daily.loaders,
            truck_daily,
          ];

          this.truckTypes.hourly.loaders = [
            ...this.truckTypes.hourly.loaders,
            truck_hourly,
          ];
        }

        if (truckInfo.truckType == 'حفار') {
          this.truckTypes.meter.diggers = [
            ...this.truckTypes.meter.diggers,
            truck_meter,
          ];

          this.truckTypes.daily.diggers = [
            ...this.truckTypes.daily.diggers,
            truck_daily,
          ];

          this.truckTypes.hourly.diggers = [
            ...this.truckTypes.hourly.diggers,
            truck_hourly,
          ];
        }

        if (truckInfo.truckType == 'هراس') {
          this.truckTypes.meter.harras = [
            ...this.truckTypes.meter.harras,
            truck_meter,
          ];

          this.truckTypes.daily.harras = [
            ...this.truckTypes.daily.harras,
            truck_daily,
          ];

          this.truckTypes.hourly.harras = [
            ...this.truckTypes.hourly.harras,
            truck_hourly,
          ];
        }
      }
    }

    this.truckTypes.meter.diggersTotal = this.truckTypes.meter.diggers
      .map((d: any) => d.totalWork)
      .reduce((a: any, b: any) => a + b, 0);
    this.truckTypes.meter.harrasTotal = this.truckTypes.meter.harras
      .map((d: any) => d.totalWork)
      .reduce((a: any, b: any) => a + b, 0);
    this.truckTypes.meter.loadersTotal = this.truckTypes.meter.loaders
      .map((d: any) => d.totalWork)
      .reduce((a: any, b: any) => a + b, 0);
    this.truckTypes.meter.truckTotal = this.truckTypes.meter.trucks
      .map((d: any) => d.totalWork)
      .reduce((a: any, b: any) => a + b, 0);

    this.truckTypes.daily.diggersTotal = this.truckTypes.daily.diggers
      .map((d: any) => d.totalWork)
      .reduce((a: any, b: any) => a + b, 0);
    this.truckTypes.daily.harrasTotal = this.truckTypes.daily.harras
      .map((d: any) => d.totalWork)
      .reduce((a: any, b: any) => a + b, 0);
    this.truckTypes.daily.loadersTotal = this.truckTypes.daily.loaders
      .map((d: any) => d.totalWork)
      .reduce((a: any, b: any) => a + b, 0);
    this.truckTypes.daily.truckTotal = this.truckTypes.daily.trucks
      .map((d: any) => d.totalWork)
      .reduce((a: any, b: any) => a + b, 0);

    this.truckTypes.hourly.diggersTotal = this.truckTypes.hourly.diggers
      .map((d: any) => d.totalWork)
      .reduce((a: any, b: any) => a + b, 0);
    this.truckTypes.hourly.harrasTotal = this.truckTypes.hourly.harras
      .map((d: any) => d.totalWork)
      .reduce((a: any, b: any) => a + b, 0);
    this.truckTypes.hourly.loadersTotal = this.truckTypes.hourly.loaders
      .map((d: any) => d.totalWork)
      .reduce((a: any, b: any) => a + b, 0);
    this.truckTypes.hourly.truckTotal = this.truckTypes.hourly.trucks
      .map((d: any) => d.totalWork)
      .reduce((a: any, b: any) => a + b, 0);

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

    setTimeout(() => (this.showTruckWorks = true), 100);
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

    this.totals = {onUs: 0, toUs: 0}

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
        note: data[i].note,
      };

      this.accArr = [...this.accArr, newData];

      this.totals.onUs = this.totals.onUs + minVal
      this.totals.toUs = this.totals.toUs + addVal
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
    // this.searchResults(pureData);
    // this.tempAccArry = pureData;
  };

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

      const truckworkes = document.querySelector('#truckworkes') as HTMLElement;

      truckworkes.style.top = '170px';

      if (cond == 'all') {
        col.forEach((e: HTMLElement | any) => {
          return e.classList.add('col-md-6');
        });

        window.print();

        col.forEach((e: HTMLElement | any) => {
          return e.classList.remove('col-md-6');
        });
      } else {
        col.forEach((e: HTMLElement | any) => {
          return e.classList.add('d-none');
        });

        // truckworkes
        const trucksDom = document.querySelector(`#${cond}`) as HTMLElement;

        trucksDom.classList.remove('d-none');
        trucksDom.classList.add('col-md-6');

        window.print();

        col.forEach((e: HTMLElement | any) => {
          return e.classList.remove('d-none');
        });

        //trucksDom.classList.remove('d-none')
        trucksDom.classList.remove('col-md-6');
      }

      truckworkes.style.top = '52px';
    } else {
      window.print();
    }
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
          acc.date_time >= start && acc.date_time <= end && acc.orderPrice > 0
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
