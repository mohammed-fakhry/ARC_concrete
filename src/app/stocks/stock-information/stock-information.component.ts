import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MainService } from 'src/app/services/main.service';
import { GlobalVarsService } from 'src/app/services/global-vars.service';
import { ActivatedRoute, Router } from '@angular/router';
import { StockService } from 'src/app/services/stock.service';
import { Product } from 'src/app/classes/product';

@Component({
  selector: 'app-stock-information',
  templateUrl: './stock-information.component.html',
  styleUrls: ['./stock-information.component.scss'],
})
export class StockInformationComponent implements OnInit {
  listData: MatTableDataSource<any> | any;
  displayedColumns: string[] = [
    'productName',
    'productUnit',
    'backetQty',
    'unitQty',
    'Qty',
    'maxPriceOut',
    'minPriceOut',
    'maxPriceIn',
    'minPriceIn',
    'lastPrice',
    'totalVal',
  ];

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  searchTxt: string = '';
  id!: string;
  totalVal: number = 0;

  allProducts: any[] = [];
  minimunQtyAlert: boolean = false;

  filterBtn: string = '';

  constructor(
    public _mainService: MainService,
    public _glopal: GlobalVarsService,
    public _router: Router,
    public activeRoute: ActivatedRoute,
    public _stockService: StockService
  ) {
    this._glopal.loading = true;
  }

  ngOnInit(): void {
    let isId = this.activeRoute.snapshot.paramMap.get('id');
    if (isId) this.id = isId;

    window.addEventListener('resize', () => {
      this._mainService.handleTableHeight();
    });

    Promise.all([
      this.getStockProducts(),
      this.getAddQtyFromTransactionStock(),
    ]).then((data: any) => {
      // stock information
      const result = {
        mainStockData: data[0],
        addFromTransaction: data[1],
      };

      this._glopal.currentHeader =
        result.mainStockData.length > 0
          ? `بيانات اصناف مخزن | ${result.mainStockData[0].stockName}`
          : 'لا توجد حركة لاصناف هذا المخزن';

      if (result.mainStockData.length > 0) {
        let filteredData = result.mainStockData
          .filter((d: any) => d.Qty != 0)
          .map((d: any) => {
            return {
              ...d,
              backetQty: this.calcUnits(d.Qty, d.productUnit).backet,
              unitQty: this.calcUnits(d.Qty, d.productUnit).unit,
            };
          });

        if (result.addFromTransaction.length > 0) {
          for (let i = 0; i < filteredData.length; i++) {
            const productInTrance = result.addFromTransaction.find(
              (product: any) => product.productId == filteredData[i].productId
            );
            if (productInTrance) {
              filteredData[i].Qty = filteredData[i].Qty + productInTrance.Qty;
            }
          }
        }

        this.totalVal = filteredData
          .map((product: any) => product.lastPrice * product.Qty)
          .reduce((a: any, b: any) => a + b);

        this.allProducts = filteredData;
        this.minimunQtyAlert = filteredData.some(
          (product: any) => product.minimumQty >= product.Qty
        );

        this.filterBtn = this.minimunQtyAlert
          ? '! اصناف وصلت الى الحد الادنى'
          : '';

        this.fillListData(filteredData);
        this._glopal.loading = false;
      } else if (result.addFromTransaction.length > 0) {
        this.fillListData(result.addFromTransaction);
        this.totalVal = result.addFromTransaction
          .map((product: any) => product.lastPrice * product.Qty)
          .reduce((a: any, b: any) => a + b);
        this._glopal.loading = false;
      } else this._glopal.loading = false;
      this._mainService.handleTableHeight();
    });
  }

  calcUnits(
    qty: number,
    productUnit: number
  ): { backet: number; unit: number } {
    const qtyFloat = `${qty / productUnit}`;
    let dot = qtyFloat.indexOf('.');

    const seperate = {
      backet: dot > 0 ? parseInt(qtyFloat.slice(0, dot)) : qty / productUnit,
      unit:
        dot > 0
          ? Math.ceil(
              parseFloat(qtyFloat.slice(dot, qtyFloat.length)) * productUnit
            )
          : 0,
    };

    return seperate;
  }

  minumumQtyFilter() {
    const filtered = this.allProducts.filter(
      (product) => product.minimumQty >= product.Qty
    );

    if (this.filterBtn == '! اصناف وصلت الى الحد الادنى') {
      if (filtered.length > 0) {
        this.fillListData(filtered);
        this.filterBtn = 'اظهار الكل';
      }
    } else if ((this.filterBtn = 'اظهار الكل')) {
      this.fillListData(this.allProducts);
      this.filterBtn = '! اصناف وصلت الى الحد الادنى';
    }
  }

  getStockProducts() {
    return new Promise((res) => {
      this._stockService
        .getStockProductsList(this.id)
        .subscribe((data: any[]) => res(data));
    });
  }

  getAddQtyFromTransactionStock() {
    return new Promise((res) => {
      if (this.id)
        this._stockService
          .getAddQtyFromTransactionStock(this.id)
          .subscribe((data: any[]) => res(data));
    });
  }

  fillListData = (data: any) => {
    this.listData = new MatTableDataSource(data);
    this.listData.sort = this.sort;
    this.listData.paginator = this.paginator;
  };

  search() {
    this.listData.filter = this.searchTxt;
  }
}
