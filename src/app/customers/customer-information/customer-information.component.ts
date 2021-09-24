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
import { AccHeaderTotals } from 'src/app/classes/acc-header-totals';
import { TruckService } from 'src/app/services/truck.service';
import { Truck } from 'src/app/classes/truck';
import { TruckCustomer } from 'src/app/classes/truck-customer';

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

  headerTotals: AccHeaderTotals = new AccHeaderTotals();

  headerTotalDetail: {
    income: { products: number; cash: number; truckUse: number };
    outcome: { products: number; cash: number };
  } = {
    income: { products: 0, cash: 0, truckUse: 0 },
    outcome: { products: 0, cash: 0 },
  };

  customerInfo: Customer = new Customer();

  isFiltered: boolean = false;

  calcArr: {
    arr: number[];
    total: number;
  } = { arr: [], total: 0 };

  accArr: any[] = [];

  /* truckCustomerInfo */
  pureTruckAcc: any[] = [];

  countTotals = {
    meter: 0,
    daily: 0,
    hourly: 0,
  };
  truckList: Truck[] = [];
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
  truckCustomerInfo: TruckCustomer = new TruckCustomer();

  tempAccArry: any[] = [];

  productsQty: any[] = [];
  productQty_remainVal: {
    begainWith: number;
    invoiceValues: number;
    receiptsValues: number;
    netQty: number;
    priceAvrg: number;
    paidQty: number;
    remainQty: number;
  } = {
    begainWith: 0,
    invoiceValues: 0,
    receiptsValues: 0,
    netQty: 0,
    priceAvrg: 0,
    paidQty: 0,
    remainQty: 0,
  };

  constructor(
    public _mainService: MainService,
    public activeRoute: ActivatedRoute,
    public _router: Router,
    public _glopal: GlobalVarsService,
    public _customerService: CustomerService,
    public _snackBar: MatSnackBar,
    public _safeService: SafeService,
    public _auth: AuthService,
    public _truckService: TruckService,
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

        /* if linked with truckCustomer */
        if (
          this.customerInfo.truckCustomerId != '0' &&
          this.customerInfo.truckCustomerId
        ) {
          this.setTruckCustomer(
            this.customerInfo.truckCustomerId,
            result.customerAcc
          );
        } else {
          this.fillListData(this.makeCustomerAcc(result.customerAcc));
          this.truckCustomerInfo.currentVal = 0;
          this._mainService.handleTableHeight();
          this._glopal.loading = false;
        }

        this._glopal.currentHeader = `تفاصيل حساب | ${this.customerInfo.customerName}`;
      }
    );
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

      // console.log(values)
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

  makeTruckWorks(tempTruckAccArry: any) {
    this.clearTruckTypes();
    const trucksIds = [
      ...new Set(tempTruckAccArry.map((truck: any) => truck.truckId)),
    ];

    // console.log(trucksIds);

    for (let i = 0; i < trucksIds.length; i++) {
      const truckInfo = this.truckList.find(
        (truck) => truck.id == trucksIds[i]
      );

      if (truckInfo) {
        const truck_daily = {
          truckInfo: truckInfo,
          totalWork: tempTruckAccArry
            .filter(
              (d: any) => d.truckId == trucksIds[i] && d.loadingType == 'يومية'
            )
            .map((d: any) => d.LoadTimes)
            .reduce((a: any, b: any) => a + b, 0),
        };

        const truck_hourly = {
          truckInfo: truckInfo,
          totalWork: tempTruckAccArry
            .filter(
              (d: any) => d.truckId == trucksIds[i] && d.loadingType == 'ساعة'
            )
            .map((d: any) => d.LoadTimes)
            .reduce((a: any, b: any) => a + b, 0),
        };

        const truck_meter = {
          truckInfo: truckInfo,
          totalWork: tempTruckAccArry
            .filter(
              (d: any) => d.truckId == trucksIds[i] && d.loadingType == 'متر'
            )
            .map((d: any) => d.LoadTimes * d.truckCapacity)
            .reduce((a: any, b: any) => a + b, 0),
        };

        // if (truckInfo.name == 'عربية 3681') console.log({truck_daily, truck_hourly, truck_meter})

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

    // this.makeTruckWorks_asProduct();
    // console.log(tempTruckAccArry)
  }

  setTruckCustomer(truckCustomerId: string, customerAcc: any) {
    this.fillListData(this.makeCustomerAcc(customerAcc));

    Promise.all([
      this.getTruckCustomerAcc(truckCustomerId),
      this.gettruckCustomer(truckCustomerId),
      this.getTruckList(),
    ]).then((data: any) => {
      const result = {
        acc: data[0],
        truckCustomer: data[1][0],
        trucks: data[2],
      };
      this.pureTruckAcc = result.acc.filter((acc: any) => acc.orderPrice > 0);
      this.truckList = result.trucks;
      // this.tempAccArry = result.acc;

      this.truckCustomerInfo = result.truckCustomer;

      this.makeTruckWorks(this.pureTruckAcc);

      this._mainService.handleTableHeight();

      this._glopal.loading = false;
    });
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

    // this.totals = { onUs: 0, toUs: 0 };

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
        productName: data[i].productName,
        productQty: data[i].productQty,
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
    return `${productQty} ${detail} ${unitPrice}`;
  }

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

  getTruckList(): Promise<Truck[]> {
    return new Promise((res) => {
      this._truckService.trucksList().subscribe((data: Truck[]) => {
        res(data);
      });
    });
  }

  gettruckCustomer(truckCustomerId: string): Promise<TruckCustomer[]> {
    return new Promise((res) => {
      this._truckService
        .truckCustomersList(truckCustomerId)
        .subscribe((data: TruckCustomer[]) => res(data));
    });
  }

  getTruckCustomerAcc(truckCustomerId: string) {
    return new Promise((res) => {
      this._truckService
        .getTruckCustomerAcc(truckCustomerId)
        .subscribe((data: any[]) => res(data));
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
  };

  setHeaderTotals(accArr: any) {
    if (accArr.length > 0) {
      this.headerTotals.openedVal =
        accArr[0].balance +
        (accArr[0].recieptType == 'رصيد اول'
          ? 0
          : accArr[0].minVal - accArr[0].addVal);

      const filteredAcc = accArr.filter(
        (acc: any) => acc.recieptType != 'رصيد اول'
      );

      const productsTotals = filteredAcc.filter((acc: any) =>
        acc.recieptType.includes('فاتورة')
      );
      const cashTotals = filteredAcc.filter((acc: any) =>
        acc.recieptType.includes('ايصال')
      );
      const truckUses = filteredAcc.filter((acc: any) =>
        acc.recieptType.includes('اذن تشغيل')
      );

      this.headerTotalDetail = {
        income: {
          products: productsTotals.reduce((a: any, b: any) => a + b.minVal, 0),
          cash: cashTotals.reduce((a: any, b: any) => a + b.minVal, 0),
          truckUse: truckUses.reduce((a: any, b: any) => a + b.minVal, 0),
        },
        outcome: {
          products: productsTotals.reduce((a: any, b: any) => a + b.addVal, 0),
          cash: cashTotals.reduce((a: any, b: any) => a + b.addVal, 0),
        },
      };

      this.headerTotals.income = filteredAcc
        //.map((a: any) => a.minVal)
        .reduce((a: any, b: any) => a + b.minVal, 0);

      this.headerTotals.outcome = filteredAcc
        //.map((a: any) => a.addVal)
        .reduce((a: any, b: any) => a + b.addVal, 0);
    } else {
      this.headerTotals = new AccHeaderTotals();
    }

    this.countProductQty(accArr);
  }

  countProductQty(accArr: any) {
    const productArr = accArr
      .filter((acc: any) => acc.productName)
      .map((acc: any) => {
        return {
          recieptType: acc.recieptType,
          productName: acc.productName,
          productQty: acc.productQty,
          addVal: acc.addVal,
          minVal: acc.minVal,
        };
      });

    const products = [
      ...new Set(productArr.map((product: any) => product.productName)),
    ];

    this.productsQty = [];

    for (let i = 0; i < products.length; i++) {
      /* sold */
      const sold = productArr.filter(
        (product: any) =>
          product.productName == products[i] &&
          product.recieptType.includes('فاتورة بيع')
      );

      const allQty_out = sold.reduce((a: any, b: any) => a + b.productQty, 0);

      /* purchused */
      const purchused = productArr.filter(
        (product: any) =>
          product.productName == products[i] &&
          product.recieptType.includes('فاتورة شراء')
      );

      const allQty_in = purchused.reduce(
        (a: any, b: any) => a + b.productQty,
        0
      );

      /* row */
      const row = {
        productName: products[i],
        out: allQty_out,
        in: allQty_in,
      };

      /* if only one product */
      if (products.length == 1 && !this.isFiltered) {
        const invoiceValues =
          this.headerTotalDetail.outcome.products -
          this.headerTotalDetail.income.products;

        const receiptsValues =
          this.headerTotalDetail.income.cash -
          this.headerTotalDetail.outcome.cash +
          this.headerTotalDetail.income.truckUse;

        const netQty = row.out - row.in;

        const priceAvrg = invoiceValues / netQty;

        const begainWith = this.isFiltered
          ? this.headerTotals.openedVal / priceAvrg
          : 0;

        this.productQty_remainVal = {
          begainWith: begainWith,
          invoiceValues: invoiceValues,
          receiptsValues: receiptsValues,
          netQty: netQty,
          priceAvrg: priceAvrg,
          paidQty: receiptsValues / priceAvrg,
          remainQty: begainWith + netQty - receiptsValues / priceAvrg,
        };
      }

      this.productsQty.push(row);
    }
  }

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

    if (from && to) {
      let start = `${from} 00:00`;
      let end = `${to} 23:59`;

      let newArr = this.accArr.filter((acc) => {
        return acc.date_time >= start && acc.date_time <= end;
      });

      this.isFiltered = true;
      this.fillListData(newArr);

      /* if linked truckCustomer */
      if (
        this.customerInfo.truckCustomerId != '0' &&
        this.customerInfo.truckCustomerId
      ) {
        const tempTruckAcc = this.pureTruckAcc.filter((acc) => {
          return acc.date_time >= start && acc.date_time <= end;
        });
        this.makeTruckWorks(tempTruckAcc);
      }
    }
  }

  filterList(cond: string) {
    this.searchTxt = '';

    if (cond == 'showAll') {
      this.isFiltered = false;
      this.fillListData(this.accArr);
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
              this._mainService.playMouseClickClose();
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
    //safeReceipt.transactionAccKind = 'موظفين';
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
      safeReceiptId: receipt.safeReceiptId ? receipt.safeReceiptId : null, //
      receiptKind: receipt.receiptKind, //
      date_time: receipt.date_time, //
      //fst safe inpts
      safeName: receipt.safeName, //
      currentSafeVal: receipt.currentSafeVal, //
      safeId: receipt.safeId, //
      // sec section
      transactionAccKind: transactionAccKind, //
      // acc inpts
      accId: transactionAccKind == 'حساب' ? receipt.accId : 0, //
      AccName: transactionAccKind == 'حساب' ? receipt.AccName : '', //
      currentAccVal: receipt.currentAccVal ? receipt.currentAccVal : 0, //
      //safe inpts
      secSafeName: receipt.secSafeName ? receipt.secSafeName : '', //
      secSafeId: receipt.secSafeId ? receipt.secSafeId : 1, //
      current_SecSafeVal: receipt.current_SecSafeVal
        ? receipt.current_SecSafeVal
        : 0, //
      // customer inpts
      customerId: transactionAccKind == 'عميل' ? receipt.customerId : 1, //
      customerName: receipt.customerName ? receipt.customerName : '', //
      currentCustomerVal: receipt.currentCustomerVal
        ? receipt.currentCustomerVal
        : 0, //
      // concreteCustomer inpts
      concreteCustomer_id: '0', //
      concreteCustomerName: '', //
      concreteCustomerVal: 0, //
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
