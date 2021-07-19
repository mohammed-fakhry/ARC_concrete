import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Product } from 'src/app/classes/product';
import { Stock } from 'src/app/classes/stock';
import { StockingDetails } from 'src/app/classes/stocking-details';
import { GlobalVarsService } from 'src/app/services/global-vars.service';
import { MainService } from 'src/app/services/main.service';
import { StockService } from 'src/app/services/stock.service';
import { StockingService } from 'src/app/services/stocking.service';
import { Location } from '@angular/common';
import { StockingHeader } from 'src/app/classes/stocking-header';
import { DeleteDialogComponent } from 'src/app/dialogs/delete-dialog/delete-dialog.component';
import { DoneDialogComponent } from 'src/app/dialogs/done-dialog/done-dialog.component';
import { SearchInvoiceDialogComponent } from 'src/app/dialogs/search-invoice-dialog/search-invoice-dialog.component';

@Component({
  selector: 'app-stocking',
  templateUrl: './stocking.component.html',
  styleUrls: ['./stocking.component.scss'],
})
export class StockingComponent implements OnInit {
  productsList: Product[] = [];
  stocksList: Stock[] = [];
  productsInp: StockingDetails[] = [];
  stockingHeader = new StockingHeader();
  dataList: any[] = [];
  reported: boolean = false;
  expand: boolean = false;
  opened: boolean = false;
  reportState: string = 'التقرير';
  reportCond!: {
    cond: string;
    stockName: string | null;
    stockId: number | null;
    inpHeader: string;
    toStockBtn: string;
    index: number | null;
  };

  inputValid!: {
    product: { cond: boolean; msg: string }[];
    //serial: string[];
  };

  reportArr:
    | {
        over: {
          productName: string;
          qty: number;
          class: string;
          price: number;
          productCategory: string;
          stock: string | undefined;
        }[];
        min: {
          productName: string;
          qty: number;
          class: string;
          price: number;
          productCategory: string;
          stock: string | undefined;
        }[];
        totalOver: number;
        totalMin: number;
      }
    | any;

  mainReportNet: number = 0;
  productsCategories: any[] = [];
  loaded: boolean = false;
  id!: string;
  idKeys!: { next: number; prev: number };

  constructor(
    public activeRoute: ActivatedRoute,
    public _router: Router,
    public _glopal: GlobalVarsService,
    public _mainService: MainService,
    public _dialog: MatDialog,
    public _stockService: StockService,
    public _snackBar: MatSnackBar,
    public _location: Location,
    public _stockingService: StockingService
  ) {
    this._glopal.currentHeader = 'الجرد الفعلى للمخازن';
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
        this._router.url.includes('Stocking')
      ) {
        this.clearAllArr();
        this.onStart();
      }
    });
  }

  openIfClosed() {
    if (this.opened === false) this.opened = true;
  }

  getStocks() {
    return new Promise((res) => {
      this._stockService.getStockes().subscribe((data: Stock[]) => res(data));
    });
  }

  productLastSoldPrice(stockId: string) {
    return new Promise((res) => {
      this._stockService
        .productLastSoldPrice(stockId)
        .subscribe((data: any[]) => {
          res(data);
        });
    });
  }

  productListFactory = (data: any, productList: Product[]): Product[] => {
    if (data.length == 0) return productList;
    else {
      for (let i = 0; i < productList.length; i++) {
        const productSold = data.find(
          (product: any) => product.productId === productList[i].productId
        );
        if (productSold) productList[i].lastPrice = productSold.price;
      }
      return productList;
    }
  };

  makeProductList(stockId: number, allProducts: Product[]) {
    this.productLastSoldPrice(`${stockId}`).then((data: any) => {
      this.productsList = this.productListFactory(data, allProducts);
    });
  }

  get_next_prev(currentId: string) {
    return new Promise((res) => {
      this._stockingService
        .get_next_prev('stocking', currentId)
        .subscribe((data: any) => res(data));
    });
  }

  makeDefultData() {
    /* add vals for memory varibals */
    this.inputValid = {
      product: [{ cond: true, msg: '' }],
    };
    /* the main report */
    this.reportArr = { over: [], min: [], totalOver: 0, totalMin: 0 };
    /* the main table vals for backend */
    this.stockingHeader = new StockingHeader();
    this.stockingHeader.stockingDate = this._mainService.makeTime_date(
      new Date(Date.now())
    );
  }

  waitForTable() {
    return new Promise((res) => {
      setTimeout(() => {
        if (!this.id) {
          this.loaded = true;
          this._glopal.loading = false;
        } else {
          this.fillToUpdate(this.id);
        }
        res('done');
      }, 300);
    });
  }

  onStart() {
    this._glopal.loading = true;

    this.makeDefultData();
    let isId = this.activeRoute.snapshot.paramMap.get('id');
    if (isId) this.id = isId;
    Promise.all([this.getProducts(), this.getStocks()]).then((data: any[]) => {
      let result = {
        products: data[0],
        stocks: data[1],
        //ids: data[2][0],
      };

      //this.idKeys = result.ids;
      this.stocksList = result.stocks;
      this.makeProductList(this.stocksList[0].stockId, result.products);
      // wait till => addfildes()
      setTimeout(() => {
        if (!this.id) {
          this.addfildes();
          this.loaded = true;
          this._glopal.loading = false;
        } else {
          this.fillToUpdate(this.id);
          this.get_next_prev(this.id).then(
            (ids: any) => (this.idKeys = ids[0])
          );
          // wait till => fillToUpdate()
          setTimeout(() => {
            this.putValsToInp();
            this.postToReport();
          }, 100);
        }
        setTimeout(() => {
          this._mainService.handleTableHeight();
        }, 100);

        // close the side barInputs if its an old stocking
        if (this.id) this.opened = false;
        else this.opened = true;
      }, 250);
    });
  }

  /* data requests */
  getStokingList(id: string) {
    return new Promise((res) => {
      this._stockingService
        .stockingListById(id)
        .subscribe((data: StockingDetails[]) => {
          res(data);
        });
    });
  }

  getStockingHeader(id: string) {
    return new Promise((res) => {
      this._stockingService
        .stockingHeaderList(id)
        .subscribe((data: StockingHeader[]) => {
          res(data);
        });
    });
  }

  getProducts() {
    return new Promise((res) => {
      this._stockService.getProduct().subscribe((data: Product[]) => res(data));
    });
  }

  /* input Methods */
  fillToUpdate(id: string) {
    this.stokesReport = [];
    // this.getStokingList(id)
    Promise.all([this.getStokingList(id), this.getStockingHeader(id)])
      .then((data: any[]) => {
        const result: {
          stockingDetails: StockingDetails[];
          stockingHeader: StockingHeader;
        } = {
          stockingDetails: data[0],
          stockingHeader: data[1][0],
        };

        this.stockingHeader = result.stockingHeader;
        const stocksIds = [
          ...new Set(result.stockingDetails.map((d) => d.stockId)),
        ];
        for (let i = 0; i < stocksIds.length; i++) {
          const stock = this.findStock(stocksIds[i]);
          if (stock) {
            const stockInpts = result.stockingDetails.filter(
              (d) => d.stockId == stock.stockId
            );
            this.postToStock(stock, null, stockInpts);
          }
        }
      })
      .then(() => {
        this.loaded = true;
        this._glopal.loading = false;
      });
    // open side nav to input if closed
    this.openIfClosed();
  }

  clearAllArr() {
    this.productsInp = [];
    this.inputValid.product = [];
    this.dataList = [];
    this.reportCond = {
      cond: 'all',
      stockName: null,
      stockId: null,
      inpHeader: 'الاصناف',
      toStockBtn: 'ترحيل لمخزن',
      index: null,
    };
  }

  addfildes() {
    this.clearAllArr();
    for (let i = 0; i < 15; i++) {
      this.addRow(i);
    }
  }

  addRow(i: number | null = null, productInp: any = null) {
    const indx: number = i ? i : this.dataList.length;
    this.inputValid.product.push({ cond: true, msg: '' });
    //this.inputValid.serial.push(`${indx + 1}`);
    this.dataList.push(`datalistproducts${indx}`);
    /* fill Inputs */
    if (productInp) {
      this.productsInp.push(productInp);
    } else {
      const productInputs = new StockingDetails();
      this.productsInp.push(productInputs);
    }
  }

  deleteRow(i: number) {
    if (this.productsInp[i].stockingDetailsId) {
      this.openDelDialog('delRow', i);
    } else {
      this.spliceInput(i);
    }
  }

  /* delete the input row for every array manage inputs */
  spliceInput(i: any) {
    // valid information array
    this.inputValid.product.splice(i, 1);
    // the products list for every input row
    this.dataList.splice(i, 1);
    // the main product information
    this.productsInp.splice(i, 1);
  }

  productChanged(i: number) {
    let productInfo = this.findProduct(this.productsInp[i].productName);
    if (!productInfo) {
      if (!this.productsInp[i].productName) {
        this.productsInp[i].productId = null;
        this.productsInp[i].computerQty = 0;
        this.productsInp[i].realQty = 0;
        this.productsInp[i].net = 0;
        this.inputValid.product[i] = { cond: true, msg: '' };
      } else {
        this.inputValid.product[i] = {
          cond: false,
          msg: 'يجب ادخال اسم صنف صحيح',
        };
      }
      this.productsInp[i].productCategory = '';
    } else {
      this.inputValid.product[i] = { cond: true, msg: '' };
      this.productsInp[i].productId = productInfo.productId;
      this.productsInp[i].productCategory = productInfo.productCategory;
      this.productsInp[i].price = productInfo.lastPrice;
    }
  }

  filteredProductInp(data: any[]) {
    return data.filter((p) => p.productName);
  }

  putValsToInp(index: any = null) {
    this.clearAllArr();

    if ((index && index != 'click') || index == 0) {
      for (let p = 0; p < this.stokesReport[index].productsInp.length; p++) {
        this.addRow(p, this.stokesReport[index].productsInp[p]);
      }
      this.reportCond = {
        cond: 'stock',
        stockName: this.stokesReport[index].stockName,
        stockId: this.stokesReport[index].stockId,
        inpHeader: `تعديل اصناف مخزن ${this.stokesReport[index].stockName}`,
        toStockBtn: 'تعديل',
        index: index,
      };
    } else {
      for (let i = 0; i < this.stokesReport.length; i++) {
        for (let p = 0; p < this.stokesReport[i].productsInp.length; p++) {
          this.addRow(p, this.stokesReport[i].productsInp[p]);
        }
        this.reportCond = {
          cond: 'allStockes',
          stockName: null,
          stockId: null,
          inpHeader: 'جميع اصناف المخازن',
          toStockBtn: 'ترحيل لمخزن',
          index: null,
        };
      }
    }
    // open side nav to input if closed
    if (index || index == 0) this.openIfClosed();
  }

  /* find methods */
  findProduct = (inp: string): Product | undefined => {
    return this.productsList.find((product) => product.productName === inp);
  };

  findStock = (id: number): Stock | undefined => {
    return this.stocksList.find((stock) => stock.stockId == id);
  };

  /* reports */
  calcMainNet() {
    if (this.stokesReport.length > 0) {
      this.mainReportNet = this.stokesReport
        .map((r) => r.net)
        .reduce((a, b) => a + b, 0);
    } else {
      this.mainReportNet = 0;
    }
  }

  delStockTable(i: number) {
    this.stokesReport.splice(i, 1);
    this.calcMainNet();
  }

  aynlizeReport = (productsInp: StockingDetails) => {
    const stock = productsInp.stockId
      ? this.findStock(productsInp.stockId)?.stockName
      : '';
    let report = {
      productName: productsInp.productName,
      qty: productsInp.net,
      price: productsInp.price,
      productCategory: productsInp.productCategory,
      class: '',
      stock: stock ? stock : '',
    };
    return report;
  };

  postToReport() {
    if (this.reportCond.cond == 'allStockes') {
      this.reportState = 'تقرير جميع المخازن';
    }
    if (this.reportCond.cond == 'all') {
      this.reportState = 'تقرير';
    }
    if (this.reportCond.cond == 'stock') {
      this.reportState = `تقرير مخزن ${this.reportCond.stockName}`;
    }

    this.reportArr = {
      over: [],
      min: [],
      totalOver: 0,
      totalMin: 0,
    };

    for (let i = 0; i < this.productsInp.length; i++) {
      if (this.productsInp[i].productName) {
        let computerQty = this.productsInp[i].computerQty
          ? this.productsInp[i].computerQty
          : 0;
        let realQty = this.productsInp[i].realQty
          ? this.productsInp[i].realQty
          : 0;

        this.productsInp[i].net = realQty - computerQty;

        if (this.productsInp[i].net > 0) {
          this.reportArr.over.push(this.aynlizeReport(this.productsInp[i]));
        } else if (this.productsInp[i].net < 0) {
          this.reportArr.min.push(this.aynlizeReport(this.productsInp[i]));
        }
      }
    }
    this.reportArr.totalOver = this.reportArr.over
      .map((r: any) => r.qty * r.price)
      .reduce((a: any, b: any) => a + b, 0);

    this.reportArr.totalMin = this.reportArr.min
      .map((r: any) => r.qty * r.price)
      .reduce((a: any, b: any) => a + b, 0);

    this.mainReportNet = this.reportArr.totalMin + this.reportArr.totalOver;

    this.reported = true;
    this.expand = true;
    this.opened = false;
  }

  stokesReport: {
    stockId: number;
    stockName: string;
    productsInp: StockingDetails[];
    totalOver: number;
    totalMin: number;
    net: number;
    reportArr: {
      over: {
        productName: string;
        qty: number;
        class: string;
        price: number;
      }[];
      min: { productName: string; qty: number; class: string; price: number }[];
    };
  }[] = [];

  postToStock(
    stock: Stock,
    cond: string | null,
    productsInp: StockingDetails[]
  ) {
    let overArr = [];
    let minArr = [];
    for (let i = 0; i < productsInp.length; i++) {
      if (productsInp[i].productName) {
        let computerQty = productsInp[i].computerQty
          ? productsInp[i].computerQty
          : 0;
        let realQty = productsInp[i].realQty ? productsInp[i].realQty : 0;

        productsInp[i].net = realQty - computerQty;
        productsInp[i].stockId = stock.stockId;
        if (productsInp[i].productName) {
          let reportAnliz = this.aynlizeReport(productsInp[i]);
          if (productsInp[i].net > 0) {
            overArr.push(reportAnliz);
          } else if (productsInp[i].net < 0) {
            minArr.push(this.aynlizeReport(productsInp[i]));
          }
        }
      }
    }

    const totalOver = overArr
      .map((r) => r.qty * r.price)
      .reduce((a, b) => a + b, 0);

    const totalMin = minArr
      .map((r) => r.qty * r.price)
      .reduce((a, b) => a + b, 0);

    const report = { over: overArr, min: minArr };
    const stockInfo = {
      stockId: stock.stockId,
      stockName: stock.stockName,
      totalOver: totalOver,
      totalMin: totalMin,
      net: totalOver + totalMin,
      productsInp: this.filteredProductInp(productsInp),
      reportArr: report,
    };

    let index = this.stokesReport.findIndex((s) => s.stockId === stock.stockId);

    if (index != -1 || cond === 'edit') {
      this.stokesReport[index] = stockInfo;
    } else if (cond === 'saveNewTable') {
      this.stokesReport.push(stockInfo);
      this.saveNewTable(this.stokesReport.length - 1, parseInt(this.id));
    } else {
      this.stokesReport.push(stockInfo);
    }

    this.calcMainNet();
    this.addfildes();
  }

  maxBy = (arr: any[], key: string) => {
    return arr.reduce((max, obj) => {
      return max[key] >= obj[key] ? max : obj;
    });
  };

  minBy = (arr: any[], key: string) => {
    return arr.reduce((max, obj) => {
      return max[key] <= obj[key] ? max : obj;
    });
  };

  mergeReport() {
    this.reported = false;
    let cond: string[] = ['over', 'min'];

    this.reportState = 'التقرير بعد الدمج';

    /* for product has family */
    let reportwithCateg: any = [];
    /* products without a family */
    let otherReport: any = [];

    const makeCategories = new Promise((res) => {
      /* this promise to make sure every arr is finished */
      for (let c = 0; c < cond.length; c++) {
        for (let i = 0; i < this.reportArr[`${cond[c]}`].length; i++) {
          if (this.reportArr[`${cond[c]}`][i].productCategory) {
            reportwithCateg = [
              ...reportwithCateg,
              this.reportArr[`${cond[c]}`][i],
            ];
          } else {
            /* this arr will push to the report arry as it is */
            otherReport = [...otherReport, this.reportArr[`${cond[c]}`][i]];
          }
        }
      }

      /* unique product families */
      let productFamilies = [
        ...new Set(
          reportwithCateg
            .filter((p: any) => p.productCategory)
            .map((p: any) => p.productCategory)
        ),
      ];

      /* the result => filtered families */
      res(productFamilies);
    }).then((productFamilies: any) => {
      this.reportArr = { min: [], over: [], totalMin: 0, totalOver: 0 };
      for (let i = 0; i < productFamilies.length; i++) {
        let filtered = reportwithCateg.filter(
          (r: any) => r.productCategory === productFamilies[i]
        );
        let newNet: number;

        if (filtered.length > 1) {
          newNet = filtered
            .map((r: any) => r.qty)
            .reduce((a: any, b: any) => a + b);
        } else {
          newNet = filtered[0].qty;
        }

        /**
         * check product.qty if over or min
         * get the information of product
         * so we can know which stock and price for the uncorrect product.qty
         */
        const rowInfo =
          newNet > 0
            ? this.maxBy(filtered, 'qty')
            : this.minBy(filtered, 'qty');

        // set vals for new report table
        let newReport = {
          productName:
            filtered.length > 1 ? productFamilies[i] : filtered[0].productName,
          qty: newNet,
          productCategory: productFamilies[i],
          class: filtered.length > 1 ? 'marked' : '',
          price: rowInfo.price,
          stock: rowInfo.stock ? rowInfo.stock : '',
        };

        if (newReport.qty > 0) {
          this.reportArr.over.push(newReport);
        } else if (newReport.qty < 0) {
          this.reportArr.min.push(newReport);
        }
      }

      for (let i = 0; i < otherReport.length; i++) {
        if (otherReport[i].qty > 0) {
          this.reportArr.over.push(otherReport[i]);
        } else {
          this.reportArr.min.push(otherReport[i]);
        }
      }
    });
  }

  addToStock() {
    if (this.reportCond.toStockBtn == 'تعديل') {
      for (let i = 0; i < this.productsInp.length; i++) {
        const inputs = this.productsInp[i];
        if (inputs.stockingDetailsId) {
          this._stockingService.updateStockingDetails(inputs).subscribe();
          //this.stokesReport = [];
        } else if (inputs.productId && !inputs.stockingDetailsId && this.id) {
          if (this.reportCond.stockId) {
            const stockingData: StockingDetails = {
              stockingDetailsId: null,
              stockingId: parseInt(this.id),
              productId: inputs.productId,
              productName: inputs.productName,
              productCategory: inputs.productCategory,
              stockId: this.reportCond.stockId,
              realQty: inputs.realQty,
              computerQty: inputs.computerQty,
              price: inputs.price,
              net: inputs.net,
            };
            this.recordStockingDetails(stockingData);
          }
        }
        if (i == this.productsInp.length - 1) {
          this.reportArr.min = [];
          this.reportArr.over = [];
          this.opened = false;
        }
      }
      if (this.reportCond.stockId) {
        let stock = this.findStock(this.reportCond.stockId);
        if (stock) this.postToStock(stock, 'edit', this.productsInp);
      }
    } else {
      this.openSearchDialog();
    }
  }

  /* handling varibals values */
  fillStockingDetails = (
    stokesReportIndx: number,
    productsInpIndx: number,
    stockingId: number
  ): StockingDetails => {
    const details = this.stokesReport[stokesReportIndx];
    const productsInp = details.productsInp[productsInpIndx];
    return {
      stockingDetailsId: null,
      stockingId: stockingId,
      productId: productsInp.productId,
      productName: productsInp.productName,
      productCategory: productsInp.productCategory,
      stockId: details.stockId,
      realQty: productsInp.realQty,
      computerQty: productsInp.computerQty,
      price: productsInp.price,
      net: productsInp.net,
    };
  };

  /* save to backEnd */

  recordStockingDetails(stockingData: StockingDetails) {
    this._stockingService.postStockingDetails(stockingData).subscribe();
  }

  recordStocking(stocking: StockingHeader) {
    return new Promise((res) => {
      this._stockingService.postStoking(stocking).subscribe((data: any) => {
        res(data[0]);
      });
    });
  }

  saveNewTable(stokingIndx: number, stockingId: number) {
    const stokingInpts: StockingDetails[] = this.stokesReport[stokingIndx]
      .productsInp;
    for (let i = 0; i < stokingInpts.length; i++) {
      const stockingData: StockingDetails = this.fillStockingDetails(
        stokingIndx,
        i,
        stockingId
      );
      this.recordStockingDetails(stockingData);
    }
    this.openDialog('saveNewTable');
  }

  updateHeader() {
    this._stockingService.updateStocking(this.stockingHeader).subscribe(() => {
      this.openDialog('editNotes');
    });
  }

  saveData() {
    this._glopal.loading = true;
    this.recordStocking(this.stockingHeader)
      .then((stockingId: any) => {
        for (let s = 0; s < this.stokesReport.length; s++) {
          const stokingInpts: StockingDetails[] = this.stokesReport[s]
            .productsInp;
          for (let i = 0; i < stokingInpts.length; i++) {
            const stockingData: StockingDetails = this.fillStockingDetails(
              s,
              i,
              stockingId
            );
            this.recordStockingDetails(stockingData);
          }
        }
      })
      .then(() => {
        this.openDialog();
        this._glopal.loading = false;
      });
  }

  /* dialogs */
  openDelDialog = (cond: string, i: number) => {
    const prosuctInp = this.productsInp[i];
    let dialogRef = this._dialog.open(DeleteDialogComponent, {
      data: {
        header: 'يجب مراجعة البيانات قبل الحذف',
        info: `الصنف | ${prosuctInp.productName}`,
        discription: [
          `عدد الكمبيوتر | ${prosuctInp.computerQty}`,
          `العدد الفعلى | ${prosuctInp.realQty}`,
          `صافى | ${prosuctInp.net}`,
        ],
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result == 'true') {
        let detailId = this.productsInp[i].stockingDetailsId;
        if (cond === 'delRow' && detailId) {
          this._stockingService
            .deleteStockingDetails(detailId)
            .subscribe(() => {
              this.spliceInput(i);
            });
        }
      }
    });
  };

  openDialog = (cond?: string) => {
    let dialogRef = this._dialog.open(DoneDialogComponent, {
      data: {
        header: 'تم حفظ بيانات الجرد',
        info: `بالتوقيت | ${this.stockingHeader.stockingDate.replace(
          'T',
          ' '
        )}`,
        discription: [``],
        btns: {
          addNew: "اضافة بيانات جديدة",
          goHome: "بيانات الجرد الفعلى"
        }
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result == 'addNew') {
        if (this.id) {
          this._router.navigate(['/Stocking']);
        } else {
          location.reload();
        }
      } else if (result == 'goHome') {
        this._router.navigate(['/StockingList']);
      } else if (result == 'back') {
        if (this.id) {
          /*
           * if save new table if it saved to database without this stock !!
           * will get the new data from database
           */
          if (cond === 'saveNewTable') this.onStart();
        } else {
          this._location.back();
        }
      }
    });
  };

  openSearchDialog() {
    this._glopal.loading = true;
    let dialogRef = this._dialog.open(SearchInvoiceDialogComponent, {
      data: `stockForStocking`,
    });

    dialogRef.afterClosed().subscribe((result) => {
      let stock: Stock | any = this.findStock(result);
      if (stock) {
        const findRecorded = this.stokesReport.find(
          (stock) => stock.stockId == result
        );
        if (!findRecorded) {
          const condition = this.id ? 'saveNewTable' : null;
          this.postToStock(stock, condition, this.productsInp);
        } else {
          this._snackBar.open(
            `تم ترحيل البيانات لـ ( ${findRecorded.stockName} ) بالفعل`,
            'اخفاء',
            {
              duration: 3500,
            }
          );
        }
      }
    });
  }

  /* print */
  printDocument() {
    let inpBox = document.querySelector('#inpBox') as HTMLElement;
    inpBox.classList.remove('stickyBox');
    window.print();
    inpBox.classList.add('stickyBox');
  }
}
