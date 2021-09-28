import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MainService } from 'src/app/services/main.service';
import { GlobalVarsService } from 'src/app/services/global-vars.service';
import { TruckService } from 'src/app/services/truck.service';
import { TruckOrder } from 'src/app/classes/truck-order';
import { Truck } from 'src/app/classes/truck';
import { ActivatedRoute, Router } from '@angular/router';
import { SafeService } from 'src/app/services/safe.service';
import { OtherAcc } from 'src/app/classes/other-acc';
import { FilterByDateDialogComponent } from 'src/app/dialogs/filter-by-date-dialog/filter-by-date-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-truck-ordet-list',
  templateUrl: './truck-ordet-list.component.html',
  styleUrls: ['./truck-ordet-list.component.scss'],
})
export class TruckOrdetListComponent implements OnInit {
  listData: MatTableDataSource<any> | any;
  displayedColumns: string[] = [
    'id',
    'date_time',
    'orderId',
    'truckCapacity',
    'truckCustomerName',
    'LoadTimes',
    'totalQty',
    'price',
    'totalVal',
    'netVal',
    'notes',
  ];

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  searchTxt: string = '';

  accArr: any[] = [];

  id: string | null = null;

  totalIncome: number = 0;
  // totalExpencies: number = 0;
  netIncome: number = 0;

  totalCashIn: number = 0;

  truckOtherAccInfo: OtherAcc = new OtherAcc();

  searchDate = { from: '', to: '' };

  truckInfo: Truck = new Truck();

  constructor(
    public _mainService: MainService,
    public _glopal: GlobalVarsService,
    public activeRoute: ActivatedRoute,
    public _safeService: SafeService,
    public _truckService: TruckService,
    public _dialog: MatDialog,
    public _router: Router
  ) {
    this._glopal.currentHeader = 'أذون السيارات';
    this._glopal.loading = true;
  }

  ngOnInit(): void {
    window.addEventListener('resize', () => {
      this._mainService.handleTableHeight();
    });

    this.onStart();
  }

  onStart(from?: string, to?: string) {
    this.id = this.activeRoute.snapshot.paramMap.get('id');
    // const isId = this.id ?? undefined;

    if (!from) {
      this.searchDate = { from: '', to: '' };
    }

    if (this.id) {
      this.getTruckList().then((data: Truck[]) => {
        this.truckInfo =
          data.find((truck: Truck) => this.id == truck.id) ?? new Truck();

        if (this.id) {
          if (this.truckInfo.truckType == 'مضخة') {
            this.getPumpOrderList(this.id, from, to).then(
              (data: TruckOrder[]) => {
                this.handleTruck_orders(data, from, to);
              }
            );
          } else {
            this.getOrderList(this.id, from, to).then((data: TruckOrder[]) => {
              this.handleTruck_orders(data, from, to);
            });
          }
        }

        /* if (this.truckInfo.truckType == 'مضخة') {
          if (this.id)
            this.getPumpOrderList(this.id, from, to).then(
              (data: TruckOrder[]) => {
                this.handleTruck_orders(data, from, to);
              }
            );
        } else {
          if (this.id)
            this.getOrderList(this.id, from, to).then((data: TruckOrder[]) => {
              this.handleTruck_orders(data, from, to);
            });
        } */
      });
    } else {
      this._truckService
        .all_truckOrderList()
        .subscribe((data: TruckOrder[]) => {
          this.handleTruck_orders(data);
        });
    }
  }

  handleTruck_orders(data: any, from?: string, to?: string) {
    this.fillListData(this.makeTruckAcc(data));

    this._mainService.handleTableHeight();

    this._glopal.currentHeader = `${
      this.truckInfo.name
        ? 'حركة نقلات السيارة |' + this.truckInfo.name
        : 'تفاصيل اذون المُعدات'
    }`;

    if (this.id) {
      this.truckOtherAcc(from, to).then((responce: OtherAcc[]) => {
        if (this.truckInfo.truckType != 'سيارة') {
          this.displayedColumns = [
            'id',
            'date_time',
            'orderId',
            'truckCustomerName',
            'totalQty',
            'price',
            'totalVal',
            'netVal',
            'notes',
          ];
        }

        this.truckOtherAccInfo = responce[0];

        this._glopal.loading = false;
      });
    } else {
      this._glopal.loading = false;
    }
  }

  makeTruckAcc(mainData: TruckOrder[]) {
    const data = mainData.filter((order: TruckOrder) => {
      if (order.realPrice == 0 && order.truckCustomerName == 'نقلات من المخزن')
        return false;
      else return true;
    });

    this.accArr = [];

    this.totalCashIn = data
      .filter((d) => d.orderType == 'safereceipt')
      .map((d) => d.totalVal * -1)
      .reduce((a, b) => a + b, 0);

    for (let i = 0; i < data.length; i++) {
      const totalVal =
        data[i].orderType == 'safereceipt'
          ? data[i].totalVal
          : (data[i].loadingType != 'متر' ? 1 : data[i].truckCapacity) *
            data[i].LoadTimes *
            data[i].realPrice;

      const netVal = i == 0 ? totalVal : this.accArr[i - 1].netVal + totalVal;

      const newRow = {
        id: i + 1,
        LoadTimes: data[i].LoadTimes,
        date_time: data[i].date_time.replace('T', ' '),
        orderId: data[i].orderId,
        orderType: data[i].orderType,
        loadingType: data[i].loadingType,
        price: data[i].realPrice,
        totalQty: data[i].totalQty,
        totalVal: totalVal,
        netVal: netVal,
        truckCapacity: data[i].truckCapacity,
        truckCustomerId: data[i].truckCustomerId,
        truckCustomerName:
          data[i].orderType == 'safereceipt'
            ? 'ايصال نقدية'
            : data[i].truckCustomerName,
        truckId: data[i].truckId,
        truckModel: data[i].truckModel,
        truckName: data[i].truckName,
        notes: data[i].notes,
        stockTransactionDetailsId: data[i].stockTransactionDetailsId,
        stockTransactionId: data[i].stockTransactionId,
      };

      this.accArr = [...this.accArr, newRow];

      if (i == data.length - 1) {
        this.totalIncome = netVal + this.totalCashIn;
      }
    }

    return this.accArr.reverse();
  }

  truckOtherAcc(from?: string, to?: string): Promise<OtherAcc[]> {
    return new Promise((res) => {
      if (this.id)
        this._safeService
          .getTruckOtherAcc(this.id, from, to)
          .subscribe((data: OtherAcc[]) => res(data));
    });
  }

  getOrderList(id: string, from?: string, to?: string): Promise<TruckOrder[]> {
    return new Promise((res) => {
      this._truckService
        .truckOrderList('truckId', id, from, to)
        .subscribe((data: TruckOrder[]) => res(data));
    });
  }

  getPumpOrderList(
    id: string,
    from?: string,
    to?: string
  ): Promise<TruckOrder[]> {
    return new Promise((res) => {
      this._truckService
        .getPumpOrderList('pumpId', id, from, to)
        .subscribe((data: TruckOrder[]) => res(data));
    });
  }

  getTruckList(): Promise<Truck[]> {
    return new Promise((res) => {
      this._truckService.trucksList().subscribe((data: Truck[]) => {
        res(data);
      });
    });
  }

  fillListData = (data: any) => {
    this.listData = new MatTableDataSource(data);
    this.listData.sort = this.sort;
    this.listData.paginator = this.paginator;

    this.setHeaderTotals(data);
  };

  headerTotals: { type: string | any; qty: number }[] = [];

  setHeaderTotals(data: any) {
    this.headerTotals = [];
    const unique = [
      ...new Set(
        data
          .filter((acc: any) => acc.loadingType)
          .map((acc: any) => acc.loadingType)
      ),
    ];

    for (let i = 0; i < unique.length; i++) {
      const filtered = data.filter((acc: any) => acc.loadingType === unique[i]);

      let qty = filtered.reduce((a: any, b: any) => a + b.LoadTimes, 0);

      if (unique[i] == 'ساعة') {
        const seperate = this.calcHours(qty);

        let dailyIndx = this.headerTotals.findIndex(
          (head: any) => head.type == 'يومية'
        );

        let rowHourly = {
          type: 'ساعة',
          qty: seperate.hours,
        };

        this.headerTotals.push(rowHourly);

        if (dailyIndx == -1) {
          let rowDaily = {
            type: 'يومية',
            qty: seperate.dayes,
          };

          this.headerTotals.push(rowDaily);
        } else {
          this.headerTotals[dailyIndx].qty =
            this.headerTotals[dailyIndx].qty + seperate.dayes;
        }

        // يومية
      } else if (unique[i] == 'يومية') {
        let dailyIndx = this.headerTotals.findIndex(
          (head: any) => head.type == 'يومية'
        );

        if (dailyIndx == -1) {
          let rowDaily = {
            type: 'يومية',
            qty: qty,
          };

          this.headerTotals.push(rowDaily);
        } else {
          this.headerTotals[dailyIndx].qty =
            this.headerTotals[dailyIndx].qty + qty;
        }
      } else {
        const row = {
          type: unique[i]
            ? unique[i] == 'متر'
              ? 'نقلات ' +
                '(' +
                filtered
                  .reduce((a: any, b: any) => a + b.totalQty, 0)
                  .toFixed(2) +
                ')' +
                ' متر'
              : unique[i]
            : '',
          qty: qty,
        };

        this.headerTotals.push(row);
      }
    }
  }

  calcHours(qty: any) {
    const qtyFloat = `${qty / 7}`;

    let dot = qtyFloat.indexOf('.');

    return {
      dayes: dot > 0 ? parseInt(qtyFloat.slice(0, dot)) : qty / 7,
      hours:
        dot > 0
          ? Number.parseFloat(qtyFloat.slice(dot, qtyFloat.length)) * 7
          : 0,
    };
  }

  search(searchFor?: string) {
    if (searchFor) this.searchTxt = searchFor;
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
    this.onStart(from, to);
    /* if (from) {
      let start = `${from} 00:00`;
      let end = `${to} 23:59`;

      let newArr = this.accArr.filter((acc) => {
        return acc.date_time >= start && acc.date_time <= end;
      });
      this.fillListData(newArr);
    } */
  }

  routToInvoice(stockTransactionId: string) {
    if (stockTransactionId > '1')
      this._router.navigate([`/StockInvoice/${stockTransactionId}`]);
  }
}
