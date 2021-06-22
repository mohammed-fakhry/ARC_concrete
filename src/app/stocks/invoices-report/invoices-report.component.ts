import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MainService } from 'src/app/services/main.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { GlobalVarsService } from 'src/app/services/global-vars.service';
import { MatDialog } from '@angular/material/dialog';
import { StockService } from 'src/app/services/stock.service';
import { FilterByDateDialogComponent } from 'src/app/dialogs/filter-by-date-dialog/filter-by-date-dialog.component';
import { Stock } from 'src/app/classes/stock';
import { AuthService } from 'src/app/services/auth.service';
import { TruckOrder } from 'src/app/classes/truck-order';
import { TruckService } from 'src/app/services/truck.service';
import { Truck } from 'src/app/classes/truck';

@Component({
  selector: 'app-invoices-report',
  templateUrl: './invoices-report.component.html',
  styleUrls: ['./invoices-report.component.scss'],
})
export class InvoicesReportComponent implements OnInit {
  listData: MatTableDataSource<any> | any;

  displayedColumns: string[] = [
    'id',
    'date_time',
    'transactionType',
    'customerName',
    'productName',
    'Qty',
    'price',
    'total',
    'notes',
    'madeBy',
  ];

  headerVals = {
    product: 'الصنف',
    qty: 'الكمية',
    total: 'اجمالى',
    productBtnClass: 'textBtn tBtn-dark pl-2',
  };

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  searchTxt!: string | null;
  url:
    | {
        id: string;
        searchFor: string;
        invDirection: string;
      }
    | any;
  accArr: any;
  isFiltered: boolean = false;
  searchedFor: any;
  stock: Stock = new Stock();

  constructor(
    public _mainService: MainService,
    public activeRoute: ActivatedRoute,
    public _router: Router,
    public _glopal: GlobalVarsService,
    public _dialog: MatDialog,
    public _auth: AuthService,
    public _truckService: TruckService,
    public _stockService: StockService
  ) {
    this._glopal.loading = true;
    let isUrl = this.getRouteSnapshot();
    if (isUrl) this.url = isUrl;
  }

  ngOnInit(): void {
    window.addEventListener('resize', () => {
      this._mainService.handleTableHeight();
    });

    this._router.events.subscribe((val) => {
      if (
        val instanceof NavigationEnd &&
        this._router.url.includes('invoiceReport')
      ) {
        setTimeout(() => this.onStart(), 0);
      }
    });
    setTimeout(() => this.onStart(), 0);
  }

  getRouteSnapshot() {
    return {
      id: this.activeRoute.snapshot.paramMap.get('id'),
      searchFor: this.activeRoute.snapshot.paramMap.get('searchFor'),
      invDirection: this.activeRoute.snapshot.paramMap.get('invDirection'),
    };
  }

  onStart() {
    this.accArr = [];
    let isUrl = this.getRouteSnapshot();
    if (isUrl) this.url = isUrl;

    if (
      this.url.searchFor !==
      'productTransaction' /* .includes('productTransaction') */
    ) {
      if (this.url.invDirection == '1')
        this._glopal.currentHeader = 'تقرير فواتير شراء مخزن';
      if (this.url.invDirection == '2')
        this._glopal.currentHeader = 'تقرير فواتير بيع مخزن';
      if (this.url.invDirection == '0')
        this._glopal.currentHeader = 'تقرير الحركة الاجمالية لاصناف مخزن';
    }

    if (this.url) {
      this._glopal.loading = true;
      this.getInvoicesReport()
        .then((data: any) => {
          if (data.length > 0) {
            const stockName = data[0].stockName;
            if (this.url.searchFor === 'productTransaction') {
              this._glopal.currentHeader = `تقرير حركة صنف | ${stockName}`;
              this.fillListData(this.productTransaction(data));
              this.searchedFor = data[0].productName;
            }

            if (this.url.searchFor.includes('invoice')) {
              this.headerVals = {
                product: 'الصنف',
                qty: 'الكمية (قطعة)',
                total: 'اجمالى',
                productBtnClass: 'textBtn tBtn-dark pl-2',
              };
              this.fillListData(data);
              this.accArr = data;
              this.searchedFor =
                data.length == 0 ? 'لا توجد بيانات' : data[0].stockName;
            }
          } else {
            this.searchedFor = 'لا توجد بيانات';
          }
        })
        .then(() => {
          this._mainService.handleTableHeight();
          this._glopal.loading = false;
        });
    }
  }

  productTransaction(data: any[]) {
    this.accArr = [];

    this.headerVals = {
      product: 'وارد',
      qty: 'منصرف',
      total: 'صافى',
      productBtnClass: 'pl-2',
    };

    //اذن نقل اضافة

    for (let i = 0; i < data.length; i++) {
      let add =
        data[i].transactionType.includes('فاتورة شراء') ||
        data[i].transactionType.includes('اذن نقل اضافة')
          ? data[i].Qty
          : 0;
      let min =
        data[i].transactionType.includes('فاتورة بيع') ||
        data[i].transactionType.includes('اذن نقل خصم')
          ? data[i].Qty
          : 0;
      let total = i == 0 ? add - min : add - min + this.accArr[i - 1].totalInt;

      /* const mainCalc = this.calcUnits(
        total,
        data[i].productUnit,
        data[i].price
      ); */

      // let totalInBacket = mainCalc.netQty;

      let newData = {
        Qty: min,
        customerId: data[i].customerId,
        customerName: data[i].customerName,
        date_time: data[i].date_time.replace('T', ' '),
        notes: data[i].notes,
        price: data[i].price,
        discound: data[i].discound,
        productId: data[i].productId,
        /* change the productName to in qty when product transaction */
        productName: `${add}`,
        stockName: data[i].stockName,
        stockTransactionId: data[i].stockTransactionId,
        stockTransactionDetailsId: data[i].stockTransactionDetailsId,
        truckId: data[i].truckId,
        total: total,
        totalInt: total,
        transactionType: data[i].transactionType,
        uncompleted: data[i].uncompleted,
        madeBy: data[i].madeBy,
      };
      this.accArr = [...this.accArr, newData];
    }

    return this.accArr;
  }

  getTruckList(): Promise<Truck[]> {
    return new Promise((res) => {
      this._truckService.trucksList().subscribe((data: Truck[]) => {
        res(data);
      });
    });
  }

  fixLepshetAwad() {
    this.getTruckList().then((trucks: Truck[]) => {
      const dataArr = this.accArr;

      for (let i = 0; i < dataArr.length; i++) {
        const acc = dataArr[i];

        const truckInfo = trucks.find((truck) => truck.id == acc.truckId);

        // console.log(truckInfo)
        /*
        Qty: 1100
        customerId: "103"
        customerName: "كساره الفهد"
        date_time: "2022-06-15 07:30"
        discound: 0
        madeBy: "فخري"
        notes: "  "
        price: 65
        productId: "2"
        productName: "سن 1"
        productUnit: 1
        stockName: "المخزن الرئيسى"
        stockTransactionDetailsId: "2251"
        stockTransactionId: "1195"
        total: 71500
        transactionType: "فاتورة شراء ( 1195 )"
        truckId: "19"
        uncompleted: ""
        */

        /*
        1	orderIdPrimary
        2	truckId
        3	orderType
        4	loadingType
        5	truckCustomerId
        6	LoadTimes
        7	price
        8	date_time
        9	notes
        10	stockTransactionDetailsId
        11	madeBy


        */

        if (truckInfo) {


          if (
            acc.transactionType.includes('فاتورة بيع') &&
            acc.productName.includes('رمل') &&
            truckInfo.owner == 'سيارة الشركة'
          ) {
            const truckOrder: TruckOrder = {
              orderId: null,
              truckId: acc.truckId,
              truckName: '',
              truckCapacity: truckInfo.capacity,
              truckModel: '',
              orderType: truckInfo.owner,
              truckType: 'سيارة',
              loadingType: 'متر',
              truckCustomerId: '1',
              truckCustomerName: '',
              LoadTimes: Math.ceil(acc.Qty / truckInfo.capacity),
              totalQty: 0,
              price: 0,
              realPrice: 0,
              totalVal: 0,
              date_time: acc.date_time.replace(' ', 'T'),
              notes: `${acc.customerName} | فاتورة (${acc.stockTransactionId})`,
              stockTransactionDetailsId: acc.stockTransactionDetailsId,
              stockTransactionId: '',
              madeBy: acc.madeBy,
            };

            console.log(truckOrder)

            // console.log({ i: i, length: dataArr.length - 1 });

            this._truckService
              .updateTruckOrder(truckOrder, 'transId')
              .subscribe();
          }
        }
      }
    });

    // console.log(this.accArr.filter((d: any) => d.customerName == 'محجر م.اسماعيل عبدالعاطي'));
  }

  /* calcUnits(
    qty: number,
    productUnit: number,
    unitPrice: number
  ): { netQty: string; backetPrice: number } {
    const qtyFloat = `${qty / productUnit}`;
    let dot = qtyFloat.indexOf('.');

    const seperate = {
      // backet: dot > 0 ? parseInt(qtyFloat.slice(0, dot)) : qty / productUnit,
      netQty:
        dot > 0
          ? `${parseFloat(qtyFloat.slice(0, dot))}.${Math.round(
              parseFloat(qtyFloat.slice(dot, qtyFloat.length)) * productUnit
            )}`
          : `${qty / productUnit}`,
      backetPrice: unitPrice * productUnit,
    };

    return seperate;
  } */

  getInvoicesReport() {
    return new Promise((res) => {
      this._stockService
        .getInvoicesReport(
          this.url.searchFor,
          this.url.id,
          this.url.invDirection
        )
        .subscribe((data: any[]) => res(data));
    });
  }

  fillListData = (pureData: any) => {
    const data = pureData.reverse();
    this.listData = new MatTableDataSource(data);
    this.listData.sort = this.sort;
    this.listData.paginator = this.paginator;
  };

  search() {
    this.listData.filter = this.searchTxt;
  }

  openFilterDialog = (data: any) => {
    let dialogRef = this._dialog.open(FilterByDateDialogComponent, data);

    dialogRef.afterClosed().subscribe((result) => {
      if (result !== 'cancel')
        this.filterByDate(result.fromDate, result.toDate);
    });
  };

  filterByDate(from?: string, to?: string) {
    this.searchTxt = null;

    if (from) {
      let start = `${from} 00:00`;
      let end = `${to} 23:59`;

      let newArr = this.accArr.filter((acc: any) => {
        return acc.date_time >= start && acc.date_time <= end;
      });

      this.isFiltered = true;
      this.fillListData(newArr);
    }
  }

  filterList(cond: string) {
    this.searchTxt = null;

    if (cond == 'showAll') {
      this.isFiltered = false;
      this.fillListData(this.accArr);
    }

    if (cond == 'filterUncomplete') {
      this.isFiltered = true;
      let uncompleted = this.accArr.filter((a: any) => a.uncompleted);
      this.fillListData(uncompleted);
    }
  }

  printDocument() {
    window.print();
  }

  openSearchProduct(productId: string) {
    if (!this.url.searchFor.includes('productTransaction'))
      this._router.navigate([
        `/invoiceReport/productTransaction/${productId}/${this.url.id}`,
      ]);
    else console.log(this.url);
  }
}
