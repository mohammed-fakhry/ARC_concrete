import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ConcreteService } from 'src/app/services/concrete.service';
import { GlobalVarsService } from 'src/app/services/global-vars.service';
import { MainService } from 'src/app/services/main.service';
import { AccHeaderTotals } from 'src/app/classes/acc-header-totals';
import { ConcreteCustomer } from 'src/app/classes/concrete-customer';
import { FilterByDateDialogComponent } from 'src/app/dialogs/filter-by-date-dialog/filter-by-date-dialog.component';

@Component({
  selector: 'app-static-mixer-financial',
  templateUrl: './static-mixer-financial.component.html',
  styleUrls: ['./static-mixer-financial.component.scss'],
})
export class StaticMixerFinancialComponent implements OnInit {
  id: string | null = null;

  listData: MatTableDataSource<any> | any;

  headerTotals: AccHeaderTotals = new AccHeaderTotals();

  productSearchBtn!: NodeListOf<Element>;

  /*
    id: i + 2,
    date_time: data[i].date_time,
    receiptDetail: data[i].receiptDetail,
    qtyDetails: data[i].qtyDetails,
    concreteDetails: data[i].concreteDetails,
    routeTo: `/${
      data[i].receiptDetail.includes('ايصال')
        ? 'SafeReceipt'
        : 'UpdateConcreteReceipt'
    }/${data[i].receiptId}`,
    minVal: data[i].minVAl,
    addVal: data[i].addVal,
    balance: balance,
    notes: data[i].notes,
  */

  displayedColumns: string[] = [
    'id',
    'date_time',
    'receiptDetail',
    'concreteDetails',
    'qtyDetails',
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

  tempAccArry: any[] = [];
  marked: boolean = false;

  calcArr: {
    arr: number[];
    total: number;
  } = { arr: [], total: 0 };

  isFiltered: boolean = false;

  staticMixerTotals = {
    income: 0,
    outcome: 0,
  };

  productsQty: any[] = [];
  totalProductsQty: number = 0;

  constructor(
    public _mainService: MainService,
    public _glopal: GlobalVarsService,
    public _router: Router,
    public activeRoute: ActivatedRoute,
    // public _snackBar: MatSnackBar,
    public _concrete: ConcreteService,
    public _dialog: MatDialog
  ) {
    this._glopal.currentHeader = 'مستخلص مضخة ثابتة';
    this._glopal.loading = true;
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
      this.getCustomerInfo(),
      this.getStaticMixerAcc(),
      this.getMixingTotal(),
    ])
      .then((data: any) => {
        const result = {
          customerInfo: data[0][0],
          accArr: data[1],
          mixerTotal: data[2],
        };

        this.staticMixerTotals = {
          income: result.mixerTotal[1].totalVal,
          outcome: result.mixerTotal[0].totalVal,
        };

        this.customerInfo = result.customerInfo;

        this.fillListData(this.makeMixerAcc(result.accArr));

        this._glopal.loading = false;
      })
      .then(() => {
        this._mainService.handleTableHeight();
      });
  }

  makeMixerAcc(data: any[]) {
    this.accArr = [];

    for (let i = 0; i < data.length; i++) {
      const balance =
        i == 0
          ? data[i].addVal - data[i].minVAl
          : data[i].addVal - data[i].minVAl + this.accArr[i - 1].balance;

      const row = {
        id: i + 2,
        date_time: data[i].date_time,
        receiptDetail: data[i].receiptDetail,
        qtyDetails: data[i].qtyDetails,
        concreteQty: data[i].concreteQty,
        concreteDetails: data[i].concreteDetails,
        routeTo: `/${
          data[i].receiptDetail.includes('ايصال')
            ? 'SafeReceipt'
            : 'UpdateConcreteBon'
        }/${data[i].receiptId}`,
        minVal: data[i].minVAl,
        addVal: data[i].addVal,
        balance: balance,
        notes: data[i].notes,
      };

      this.accArr = [...this.accArr, row];
    }

    return this.accArr;
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

  getCustomerInfo(): Promise<ConcreteCustomer[]> {
    return new Promise((res) => {
      if (this.id)
        this._concrete
          .concreteCustomerList(this.id)
          .subscribe((data: ConcreteCustomer[]) => res(data));
    });
  }

  getStaticMixerAcc() {
    return new Promise((res) => {
      if (this.id)
        this._concrete
          .getStaticMixerFinancial(this.id)
          .subscribe((data: any[]) => res(data));
    });
  }

  getMixingTotal() {
    return new Promise((res) => {
      if (this.id)
        this._concrete
          .staticMixerTotals(this.id)
          .subscribe((data: any) => res(data));
    });
  }

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

    this.countProductQty(accArr);
  }

  countProductQty(accArr: any) {
    const productArr = accArr
      .filter((acc: any) => acc.concreteDetails != '-')
      .map((acc: any) => {
        return {
          productName: acc.concreteDetails,
          productQty: acc.concreteQty,
        };
      });

    const products = [
      ...new Set(productArr.map((product: any) => product.productName)),
    ];

    this.productsQty = [];

    for (let i = 0; i < products.length; i++) {
      const row = {
        productName: products[i],
        out: productArr
          .filter((acc: any) => acc.productName == products[i])
          .reduce((a: any, b: any) => a + b.productQty, 0),
      };

      this.productsQty.push(row);
    }

    this.totalProductsQty = this.productsQty.reduce(
      (a: any, b: any) => a + b.out,
      0
    );
  }

  search(searchFor?: string, elementId?: string, indx?: number) {
    if (searchFor) {
      if (typeof this.productSearchBtn == 'undefined') {
        this.productSearchBtn = document.querySelectorAll(
          '.productSearchBtn'
        ) as NodeListOf<Element>;
      }

      if (this.productSearchBtn) {
        this.productSearchBtn.forEach((element: any) => {
          element.classList.remove('darkGrayBg');
        });

        const productNameStatic = document.getElementById(
          `${elementId}${indx}`
        ) as HTMLElement;
        if (productNameStatic) {
          productNameStatic.classList.add('darkGrayBg');
        }
      }
      this.searchTxt = searchFor == 'all' ? '' : searchFor;
    }
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
    } else {
      this.isFiltered = false;
      this.fillListData(this.accArr);
      this.searchDate = { from: '', to: '' };
    }
  }

  /* filterList(cond: string) {
    this.searchTxt = '';

    if (cond == 'showAll') {
      this.isFiltered = false;
      this.fillListData(this.accArr);
      this.searchDate = { from: '', to: '' };

    } else if (cond == 'noId') {
      // filter receipts not connected with an invoice
      this.isFiltered = true;
      const tempArr = this.accArr.filter(
        (a) => a.concretereceiptcash_id == 'noId'
      );
      this.fillListData(tempArr);
      this.searchDate = { from: '', to: '' };
    }
  } */
}
