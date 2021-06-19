import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { ProductsAvg } from 'src/app/classes/products-avg';
import { MainService } from 'src/app/services/main.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { GlobalVarsService } from 'src/app/services/global-vars.service';
import { StockService } from 'src/app/services/stock.service';
import { MatDialog } from '@angular/material/dialog';
import { FilterByDateDialogComponent } from 'src/app/dialogs/filter-by-date-dialog/filter-by-date-dialog.component';
import { Chart } from 'chart.js';
import { SafeService } from 'src/app/services/safe.service';
import { SafeData } from 'src/app/classes/safe-data';

@Component({
  selector: 'app-product-profits',
  templateUrl: './product-profits.component.html',
  styleUrls: ['./product-profits.component.scss'],
})
export class ProductProfitsComponent implements OnInit {
  id: string | null = null;
  productsList: ProductsAvg[] = [];
  productPricesList: {
    productName: string;
    price: number;
    productId: number;
  }[] = [];

  listData: MatTableDataSource<any> | any;

  isFiltered: boolean = false;

  totalProfits: number = 0;
  totalExpencies: number = 0;

  mainsafeInfo: SafeData = new SafeData();

  date: { from: string; to: string } | null = null;

  displayedColumns: string[] = [
    'productName',
    'inQty',
    'outQty',
    'remainQty',

    'maxPriceIn',
    'maxPriceOut',
    'minPriceIn',
    'minPriceOut',

    'priceInAVG',
    'priceOutAVG',
    'productProfit',
    'allProductProfit',
  ];

  profitsChart!: any;

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  searchTxt: string = '';

  uncompleted: boolean = true;

  constructor(
    public _mainService: MainService,
    public activeRoute: ActivatedRoute,
    public _glopal: GlobalVarsService,
    public _stockService: StockService,
    public _router: Router,
    public _dialog: MatDialog,
    public _safeService: SafeService
  ) {
    this._glopal.loading = true;
  }

  ngOnInit(): void {
    window.addEventListener('resize', () => {
      this._mainService.handleTableHeight();
    });

    this.onStart();
    this._router.events.subscribe((val) => {
      if (
        val instanceof NavigationEnd &&
        this._router.url.includes('ProductsProfits')
      ) {
        this.onStart();
      }
    });
  }

  onStart(displayUncompleted?: boolean) {
    this.id = this.activeRoute.snapshot.paramMap.get('id');
    this._glopal.loading = true;
    let mainProductsList: ProductsAvg[] = [];

    Promise.all([
      this.getProductsAvg(),
      this.getProductsLastPrice(),
      this.getSafes(),
    ])
      .then((data: any[]) => {
        const result = {
          avgList: data[0],
          lastPricesList: data[1],
          safes: data[2],
        };
        this.productPricesList = result.lastPricesList;

        this.mainsafeInfo = result.safes[0];

        mainProductsList = result.avgList.filter(
          (p: any) => p.outQty > 0 && p.productProfit != 0
        );

        if (displayUncompleted) {
          this.uncompleted = false;
        } else {
          const isUncompleted = mainProductsList.find(
            (product: ProductsAvg) => product.minPriceIn == 0
          );

          this.uncompleted = isUncompleted ? true : false;
        }
        this._glopal.currentHeader = `تقرير ارباح مخزن | ${mainProductsList[0].stockName}`;
      })
      .then(() => {
        if (!this.uncompleted) {
          this.getTotalExpencies(this.mainsafeInfo.safeId).then((data: any) => {
            this.totalExpencies = data.totalEXP;
            this.generateProfitsChart(this.totalProfits, this.totalExpencies);
          });
          this.productsList = this.makeProductsList(mainProductsList);
          this.fillListData(this.productsList);
          this._mainService.handleTableHeight();
        }
        this._glopal.loading = false;
      });
  }

  makeProductsList(productsList: ProductsAvg[]) {

    console.log(this.productsList)
    for (let i = 0; i < productsList.length; i++) {
      if (productsList[i].priceInAVG == 0) {
        let found = this.productPricesList.find(
          (p) => p.productId == productsList[i].productId
        );
        if (found) {
          productsList[i].priceInAVG = found.price;
          productsList[i].productProfit =
            productsList[i].priceOutAVG - found.price;
        }
      }
    }
    return productsList;
  }

  getProductsAvg(date?: { from: string; to: string }) {
    return new Promise((res) => {
      if (this.id)
        this._stockService
          .getProductAvrList(this.id, date)
          .subscribe((data: ProductsAvg[]) => {
            res(data);
          });
    });
  }

  getSafes() {
    return new Promise((res) => {
      this._safeService.getSafes().subscribe((data: SafeData[]) => {
        res(data);
      });
    });
  }

  getTotalExpencies(id: number, date?: { from: string; to: string }) {
    return new Promise((res) => {
      this._stockService
        .getTotalExpencies(id, date)
        .subscribe((data: any[]) => {
          res(data[0]);
        });
    });
  }

  fillListData = (data: any) => {
    this.listData = new MatTableDataSource(data);
    this.listData.sort = this.sort;
    this.listData.paginator = this.paginator;
    this.totalProfits = this.getTotalProfits(data);
  };

  search() {
    this.listData.filter = this.searchTxt;
  }

  getTotalProfits(data: ProductsAvg[]): number {
    return data
      .map((t) => t.productProfit * t.outQty)
      .reduce((acc, value) => acc + value, 0);
  }

  getProductsLastPrice() {
    return new Promise((res) => {
      if (this.id)
        this._stockService
          .productsLastPriceList(this.id)
          .subscribe((data: any[]) => {
            res(data);
          });
    });
  }

  openFilterDateDialog = (data: any) => {
    let dialogRef = this._dialog.open(FilterByDateDialogComponent, data);

    dialogRef.afterClosed().subscribe((result) => {
      if (result !== 'cancel')
        this.filterByDate(result.fromDate, result.toDate);
    });
  };

  filterByDate(from: string, to: string) {
    this._glopal.loading = true;
    this.getProductsAvg({ from: from, to: to }).then((data: any) => {
      this.date = { from: from, to: to };
      // filter
      let filtered = data.filter(
        (p: any) => p.outQty > 0 && p.productProfit != 0
      );
      let arrayToFill = this.makeProductsList(filtered);
      this.fillListData(arrayToFill);
      this.getTotalExpencies(this.mainsafeInfo.safeId, this.date).then(
        (data: any) => {
          this.totalExpencies = data.totalEXP;
          this.updateProfitsChart(this.totalProfits, this.totalExpencies);
        }
      );
      // done filter
      this.isFiltered = true;
      this.displayedColumns = [
        'productName',
        'inQty',
        'outQty',
        'maxPriceIn',
        'maxPriceOut',
        'minPriceIn',
        'minPriceOut',
        'priceInAVG',
        'priceOutAVG',
        'productProfit',
        'allProductProfit',
      ];
      this._glopal.loading = false;
    });
  }

  generateProfitsChart(profits: number, expence: number) {
    const colorPlate: string[] = ['54, 162, 235', '255, 99, 132'];

    this.profitsChart = new Chart('profitsChart', {
      type: 'polarArea',
      data: {
        labels: ['الارباح', 'المصاريف'],
        datasets: [
          {
            label: '',
            data: [profits, expence],
            maxBarThickness: 50,
            backgroundColor: colorPlate.map((c: string) => `rgba(${c}, 0.8)`),
            /* borderColor: colorPlate.map((c: string) => `rgba(${c})`), */
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true,
              },
            },
          ],
        },
      },
    });
  }

  updateProfitsChart(profits: number, expence: number) {
    //this.profitsChart.data.labels = ['الارباح', 'المصاريف']
    this.profitsChart.data.datasets[0].data = [profits, expence];
    this.profitsChart.update();
  }

  showAll() {
    this.fillListData(this.productsList);
    this.getTotalExpencies(this.mainsafeInfo.safeId).then((data: any) => {
      this.totalExpencies = data.totalEXP;
      this.updateProfitsChart(this.totalProfits, this.totalExpencies);
    });
    /* coloms with  remainQty*/
    this.date = null;
    this.displayedColumns = [
      'productName',
      'inQty',
      'outQty',
      'remainQty',
      'maxPriceIn',
      'maxPriceOut',
      'minPriceIn',
      'minPriceOut',
      'priceInAVG',
      'priceOutAVG',
      'productProfit',
      'allProductProfit',
    ];
    this.isFiltered = false;
  }
}
