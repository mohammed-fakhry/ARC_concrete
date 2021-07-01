import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Customer } from 'src/app/classes/customer';
import { Product } from 'src/app/classes/product';
import { Stock } from 'src/app/classes/stock';
import { CustomerService } from 'src/app/services/customer.service';
import { GlobalVarsService } from 'src/app/services/global-vars.service';
import { MainService } from 'src/app/services/main.service';
import { StockService } from 'src/app/services/stock.service';
import { Location } from '@angular/common';
import { InvoiceInp } from 'src/app/classes/invoice-inp';
import { StockTransaction } from 'src/app/classes/stock-transaction';
import { StockTransactionD } from 'src/app/classes/stock-transaction-d';
import { NgForm } from '@angular/forms';
import { DeleteDialogComponent } from 'src/app/dialogs/delete-dialog/delete-dialog.component';
import { DoneDialogComponent } from 'src/app/dialogs/done-dialog/done-dialog.component';
import { Changedinvoice } from 'src/app/classes/changedinvoice';
import { AuthService } from 'src/app/services/auth.service';
import { CasherDialogComponent } from 'src/app/dialogs/casher-dialog/casher-dialog.component';
import { TruckService } from 'src/app/services/truck.service';
import { Truck } from 'src/app/classes/truck';
import { TruckOrder } from 'src/app/classes/truck-order';

@Component({
  selector: 'app-stock-invoice',
  templateUrl: './stock-invoice.component.html',
  styleUrls: ['./stock-invoice.component.scss'],
})
export class StockInvoiceComponent implements OnInit {
  stockTransaction: { info: InvoiceInp }[] = [];

  stockInvoice = {
    transactionType: 'فاتورة شراء',
    stockTransactionId: 0,
    invNumber: 0,
    stockId: 0,
    stockName: '',
    sndStockId: 0,
    truckId: '100',
    truckName: '',
    truckOwner: '',
    truckCapacity: 1,
    sndStockName: '',
    customerName: '',
    customerId: 1,
    date_time: '',
    invoiceTotal: 0,
    notes: '',
    uncompleted: '',
    madeBy: '',
    isUpdated: false,
    addtaxes: 0,
  };
  submitBtn: string = '';
  userSession = sessionStorage.getItem('n');
  user: any; //: { i: string; realName: string };

  inputValid: {
    customerName: { cond: boolean; msg: string };
    product: { cond: boolean; msg: string }[];
    formValid: boolean;
  } = {
    customerName: { cond: true, msg: '' },
    product: [],
    formValid: true,
  };

  dateExpires: boolean = false;

  invoiceType: string = 'customerInvoice';

  dataList: any[] = [];
  totalsArry: number[] = [];
  truckList: Truck[] = [];

  truckInfo: Truck = new Truck();

  stocksList: Stock[] = [];
  customerList: Customer[] = [];

  filteredCustomer: Customer[] = [];

  productsList: Product[] = [];
  productQtys: { loadTimes: number; payLoadPrice: number }[] = [];
  allProducts: Product[] = [];
  productPricesList: {
    productName: string;
    price: number;
    productId: number;
  }[] = [];
  //products: string[] = [];
  changedData: Changedinvoice[] = [];

  id: string | null = null;
  cantDel: boolean = true;
  invoiceCond: string = '';
  checkedStatue: boolean = false;
  showDiscound: boolean = false;
  custInfo: Customer = new Customer();

  transactionTypeDom: HTMLElement = document.querySelector(
    '#transactionType'
  ) as HTMLElement;

  /* productInpDom: HTMLElement = document.querySelector(
    '.productInpDom'
  ) as HTMLElement; */

  moreMenu = {
    discound: 'اضافة خصم',
  };

  constructor(
    public activeRoute: ActivatedRoute,
    public _router: Router,
    public _glopal: GlobalVarsService,
    public _mainService: MainService,
    public _dialog: MatDialog,
    public _customerService: CustomerService,
    public _stockService: StockService,
    public _location: Location,
    public _snackBar: MatSnackBar,
    public _truckService: TruckService,
    public _auth: AuthService
  ) {
    this._glopal.currentHeader = 'فاتورة (شراء | بيع)';
    this.userSession = sessionStorage.getItem('n');
    if (this.userSession) this.user = sessionStorage.getItem(this.userSession);
    this._glopal.loading = true;
  }

  ngOnInit(): void {
    window.addEventListener('resize', () => {
      this._mainService.handleTableHeight();
    });

    this.transactionTypeDom = document.querySelector(
      '#transactionType'
    ) as HTMLElement;

    this.onStart();
    //this.html_inputs = document.querySelector('.form-control') as HTMLElement
    this._router.events.subscribe((val) => {
      if (
        val instanceof NavigationEnd &&
        this._router.url.includes('StockInvoice')
      ) {
        this.onStart();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key == 'F8') {
        this.checkedStatue = !this.checkedStatue;
        this.stockInvoice.uncompleted =
          this.stockInvoice.uncompleted == 'بيانات غير مكتملة'
            ? ''
            : 'بيانات غير مكتملة';
      }
    });
  }

  selectText(inputId: string, i: number) {
    const input = document.getElementById(`${inputId}${i}`) as HTMLInputElement;
    if (input) {
      input.select();
    }
  }

  calcUnits(
    qty: number,
    metrPrice: number
  ): { loadTimes: number; payLoadPrice: number } {
    const seperate = {
      loadTimes: Number((qty / this.stockInvoice.truckCapacity).toFixed(3)),
      payLoadPrice: metrPrice * this.stockInvoice.truckCapacity,
    };

    return seperate;
  }

  saveOldData = (
    oldDetails: StockTransactionD,
    oldHeader: StockTransaction
  ): Changedinvoice => {
    const userInfo = this._auth.uName;

    return {
      changedId: null,
      // invoice information
      stockTransactionId: oldDetails.stockTransactionId,
      stockTransactionDetailsId: oldDetails.stockTransactionDetailsId,
      invNumber: oldHeader.invNumber,
      stockId: oldHeader.stockId,
      stockName: oldHeader.stockName,
      transactionType:
        oldHeader.transactionType == 1
          ? `فاتورة شراء رقم (${oldHeader.stockTransactionId})`
          : `فاتورة بيع رقم (${oldHeader.stockTransactionId})`,
      // customer
      customerId: 0,
      customerName: '',
      oldCustomerId: oldHeader.customerId,
      oldCustomerName: oldHeader.customerName,
      // product
      productId: null,
      productName: '',
      oldProductId: oldDetails.productId,
      oldPruductName: oldDetails.productName,
      // qty
      Qty: 0,
      oldQty: oldDetails.Qty,
      // price
      price: 0,
      oldPrice: oldDetails.price,
      // notes
      notes: '',
      oldNotes: oldHeader.notes,
      // type and date
      changedType: 0,
      date_time: '',
      changedDisc: '',
      userId: userInfo ? userInfo.i : 0,
      realName: userInfo ? userInfo.realName : '',
      userPic: userInfo ? userInfo.userPic : 'defultpersonImg.jpg',
    };
  };

  onStart() {
    // get the new Id
    this.id = this.activeRoute.snapshot.paramMap.get('id');

    // reset defult varibals Vals
    this.submitBtn = 'تسجيل';
    this.inputValid.formValid = true;
    let userSession = sessionStorage.getItem('n');
    if (userSession) this.user = JSON.parse(userSession);

    // clear Arrys Vals
    this.stockTransaction = [];
    this.inputValid.product = [];
    this.dataList = [];
    this.totalsArry = [];
    this.truckList = [];

    this.truckInfo = new Truck();

    if (!this._glopal.loading) this._glopal.loading = true;

    Promise.all([
      this.getStocks(),
      this.getCustomers(),
      this.getProducts(),
      this.getTruckList(),
    ])
      .then((data: any[]) => {
        const result = {
          stocks: data[0],
          customers: data[1],
          products: data[2],
          trucks: data[3],
        };

        // store stocksData and customersData
        this.stocksList = result.stocks;
        this.customerList = result.customers.filter(
          (customer: Customer) => !customer.customerName.includes('كاشير')
        );

        // store products
        this.productsList = this.productListFactory([], result.products);
        this.allProducts = result.products;
        this.truckList = result.trucks.filter(
          (truck: Truck) => truck.truckType == 'سيارة'
        );

        if (!this.id) {
          this.addfildes();
          this.fillNewInvoice();

          this.dateExpires = false;

          if (this._router.url === '/CaherReceipt') {
            this.prepareForCasher();
          } else {
            this.invoiceCond = 'فاتورة جديدة';
            if (this.transactionTypeDom) this.transactionTypeDom.focus();
            this._glopal.loading = false;
          }
          // to filterCustomers Arr
          this.stockNameChanged();
        }

        if (this.id) {
          this.prepareForEdit();
        }
      })
      .then(() => {
        this._mainService.handleTableHeight();
        this._glopal.loading = false;
      });
  }

  prepareForCasher() {
    this.getLocalJson()
      .then((data: any) => {
        const sTransaction = data.stockTransaction;
        /*
        stockTransaction: {
          customerId: 151
          customerName: "تقفيل المحل - سيف"
          date_time: ""
          invNumber: null
          invoiceTotal: 0
          notes: ""
          sndStockId: null
          stockId: 8
          stockName: "المحل سيف"
          stockTransactionId: null
          transactionType: 2
          uncompleted: ""
        }

        {
          transactionType: string;
          stockTransactionId: number;
          stockId: number;
          stockName: string;
          customerName: string;
          customerId: number;
          date_time: string;
          invoiceTotal: number;
          notes: string;
          uncompleted: string;
        }
        */
        this.stockInvoice.transactionType = sTransaction.transactionType;
        this.stockInvoice.stockId = sTransaction.stockId;
        this.stockInvoice.stockName = sTransaction.stockName;
        this.stockInvoice.customerName = sTransaction.customerName;
        this.stockInvoice.customerId = sTransaction.customerId;
        this.invoiceCond = `كاشير ${sTransaction.customerName}`;
      })
      .then(() => {
        this._glopal.loading = false;
      });
  }

  prepareForEdit() {
    Promise.all([this.getStockTransAction(), this.getStockTranseDetail()]).then(
      (data: any[]) => {
        if (data[0].length > 0) {

          console.log(data)
          this.fillToEdit(data);
          // to filterCustomers Arr
          this.stockNameChanged();
          this.invoiceCond = `الفاتورة رقم (${this.id})`;
          this.cantDel = true;
          this.submitBtn = 'تعديل';

          let custFounded = this.customerList.find(
            (customer) => customer.customerId === this.stockInvoice.customerId
          );
          if (custFounded) this.custInfo = custFounded;
          if (this.transactionTypeDom) this.transactionTypeDom.focus();
        }
      }
    );
  }

  fillToEdit(data: any[]) {
    let result = {
      stockTransaction: data[0][0],
      StockTransactionDetails: data[1],
    };

    /* const currentTime = this._mainService.makeTime_date(new Date(Date.now()));

    this._mainService.updateExpired(
      currentTime,
      result.stockTransaction.date_time
    ); */

    this.dateExpires = this._mainService.dateExpired(
      result.stockTransaction.date_time
    );

    const transactionType =
      result.stockTransaction.transactionType == 3
        ? 'اذن نقل'
        : result.stockTransaction.transactionType == 2
        ? 'فاتورة بيع'
        : 'فاتورة شراء';

    this.invoiceType =
      result.stockTransaction.transactionType == 3
        ? 'stockTrance'
        : 'customerInvoice';

    this.stockInvoice = {
      transactionType: transactionType,
      stockTransactionId: result.stockTransaction.stockTransactionId,
      invNumber: result.stockTransaction.invNumber,
      stockId: result.stockTransaction.stockId,
      stockName: result.stockTransaction.stockName,
      sndStockId: result.stockTransaction.sndStockId,
      sndStockName:
        this.findStockById(result.stockTransaction.sndStockId)?.stockName ?? '',
      truckId: result.stockTransaction.truckId,
      truckName: result.stockTransaction.truckName,
      truckCapacity: result.stockTransaction.truckCapacity,
      truckOwner: result.stockTransaction.truckOwner,
      customerName: result.stockTransaction.customerName,
      customerId: result.stockTransaction.customerId,
      date_time: result.stockTransaction.date_time,
      invoiceTotal: result.stockTransaction.invoiceTotal,
      notes: result.stockTransaction.notes,
      uncompleted: result.stockTransaction.uncompleted,
      madeBy: result.stockTransaction.madeBy,
      isUpdated: result.stockTransaction.isUpdated,
      addtaxes: result.stockTransaction.addtaxes,
    };

    this.truckInfo =
      this.truckList.find(
        (truck: Truck) => truck.id == this.stockInvoice.truckId
      ) ?? new Truck();

    this.transactionTypeChanged(this.invoiceType);

    this.checkedStatue = this.stockInvoice.uncompleted ? true : false;
    let invoiceHasDiscound = result.StockTransactionDetails.some(
      (a: any) => a.discound > 0
    );
    if (invoiceHasDiscound) this.discoundShow();

    for (let i = 0; i < result.StockTransactionDetails.length; i++) {
      const details = result.StockTransactionDetails[i];
      if (i == 0) this.truckInfo.metrPrice = details.truckOrder_realPrice;
      const total = details.price * details.Qty;
      const discoundVal = (total * details.discound) / 100;

      let tranceDetail: InvoiceInp = {
        stockTransactionDetailsId: details.stockTransactionDetailsId,
        product: details.productName,
        productId: details.productId,
        productUnit: details.productUnit,
        qty: details.Qty,
        price: details.price,
        discound: details.discound,
        total: total - discoundVal,
        truckOrder_realPrice: details.truckOrder_realPrice,
        notes: details.notes,
      };

      this.dataList.push(`datalistproducts${i}`);
      this.stockTransaction.push({ info: tranceDetail });
      this.inputValid.product.push({ cond: true, msg: '' });
      this.totalsArry.push(tranceDetail.total);
      this.productQtys.push(
        this.calcUnits(tranceDetail.qty, tranceDetail.price)
      );

      const oldDetails = this.saveOldData(details, result.stockTransaction);
      this.changedData.push(oldDetails);
    }
  }

  addRow() {
    if (this.cantDel) this.cantDel = false;

    this.stockTransaction.push({ info: new InvoiceInp() });
    this.inputValid.product.push({ cond: true, msg: '' });
    this.dataList.push(`datalistproducts${this.dataList.length}`);
    this.stockTransaction[this.stockTransaction.length - 1].info.total = 0;
    this.totalsArry.push(0);
    this.productQtys.push({ loadTimes: 0, payLoadPrice: 0 });
  }

  addfildes() {
    this.stockTransaction = [];
    this.inputValid.product = [];
    this.dataList = [];
    this.totalsArry = [];
    this.productQtys = [];

    for (let i = 0; i < 10; i++) {
      this.stockTransaction.push({ info: new InvoiceInp() });
      this.inputValid.product.push({ cond: true, msg: '' });
      this.dataList.push(`datalistproducts${i}`);
      this.stockTransaction[i].info.total = 0;
      this.totalsArry.push(0);
      this.productQtys.push({ loadTimes: 0, payLoadPrice: 0 });
    }
  }

  // get from backend Promises
  getStocks() {
    return new Promise((res) => {
      this._stockService.getStockes().subscribe((data: Stock[]) => res(data));
    });
  }

  getTruckList(): Promise<Truck[]> {
    return new Promise((res) => {
      this._truckService.trucksList().subscribe((data: Truck[]) => res(data));
    });
  }

  getCustomers() {
    return new Promise((res) => {
      this._customerService
        .getCustomer()
        .subscribe((data: Customer[]) => res(data));
    });
  }

  getProducts() {
    return new Promise((res) => {
      this._stockService.getProduct().subscribe((data: Product[]) => res(data));
    });
  }

  getStockTransAction() {
    return new Promise((res) => {
      if (this.id)
        this._stockService
          .getStockTransactionList(this.id)
          .subscribe((data: StockTransaction[]) => res(data));
    });
  }

  getStockTranseDetail() {
    return new Promise((res) => {
      if (this.id)
        this._stockService
          .getStockTransactionDetailsList(this.id)
          .subscribe((data: StockTransactionD[]) => {
            res(data);
          });
    });
  }

  getStockProducts(stockId: string) {
    return new Promise((res) => {
      this._stockService
        .getStockProductsList(stockId)
        .subscribe((data: any[]) => res(data));
    });
  }

  getLocalJson() {
    return new Promise((res) => {
      this._stockService
        .getLocalJson('assets/jsons/CINPT.json')
        .subscribe((data: any[]) => {
          res(data);
        });
    });
  }

  // find
  findCustomer = (inp: string): Customer | undefined => {
    return this.filteredCustomer.find(
      (customer) => customer.customerName === inp
    );
  };

  findProduct = (inp: string): Product | undefined => {
    return this.productsList.find((product) => product.productName === inp);
  };

  findStock = (inp: string): Stock | undefined => {
    return this.stocksList.find((stock) => stock.stockName === inp);
  };

  findStockById = (id: any): Stock | undefined => {
    return this.stocksList.find((stock) => stock.stockId == id);
  };

  transactionTypeChanged(invoiceType: string) {
    this.invoiceType = invoiceType;
    this.changeProductList(invoiceType);
    if (invoiceType === 'customerInvoice') {
      this.stockInvoice.sndStockId = 1;
      this.stockInvoice.sndStockName = '';
    }
    if (invoiceType === 'stockTrance') {
      this.stockInvoice.customerId = 1;
      this.stockInvoice.customerName = '';
    }
    // stockTrance
  }

  changeProductList(invoiceType: string) {
    if (
      invoiceType === 'stockTrance' ||
      this.stockInvoice.transactionType === 'فاتورة بيع' ||
      this.stockInvoice.transactionType === 'اذن نقل'
    ) {
      this._glopal.loading = true;
      this.productLastSoldPrice(`${this.stockInvoice.stockId}`).then(
        (data: any) => {
          this.productsList = this.productListFactory(data, this.allProducts);
          /* if (data.length > 0) {
            //let filteredData = data.filter((d: any) => d.Qty != 0);
          } else {
            this.productsList = [];
          } */
          this._glopal.loading = false;
        }
      );
    }

    if (
      invoiceType === 'customerInvoice' &&
      this.stockInvoice.transactionType === 'فاتورة شراء'
    ) {
      this.productsList = this.productListFactory([], this.allProducts);
    }

    // this.productsList = this.productListFactory([], result.products);
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

  // sellInvoice
  customerNameChanged = (stockInvoiceForm?: NgForm) => {
    /* if = null - will run for invoice to edit */
    if (this.stockInvoice.customerName === 'ارباح المحل') {
      this.stockInvoice.customerId = 302;
    } else if (this.invoiceType === 'customerInvoice') {
      let custFounded = this.findCustomer(this.stockInvoice.customerName);
      if (stockInvoiceForm != null) {
        if (custFounded) this.custInfo = custFounded;
        if (this.cantDel) this.cantDel = false;
        if (!custFounded) {
          this.inputValid.customerName = {
            cond: false,
            msg: 'العميل غير مسجل بقاعدة البيانات',
          };
          stockInvoiceForm.form.controls['customerName'].setErrors({
            incorrect: true,
          });
        } else {
          if (this.custInfo.customerId)
            this.stockInvoice.customerId = this.custInfo.customerId;
          this.inputValid.customerName.cond = true;
          stockInvoiceForm.form.controls['customerName'].setErrors(null);
        }
      }
    }
  };

  truckNameChanged(stockInvoiceForm: NgForm) {
    if (this.stockInvoice.truckName == '') {
      this.stockInvoice.truckId = '100';
      this.stockInvoice.truckCapacity = 1;
      this.stockInvoice.truckOwner = '';
      stockInvoiceForm.form.controls['truckName'].setErrors(null);

      this.truckInfo = new Truck();
    } else {
      const truckInfo = this.truckList.find(
        (truck: Truck) => truck.name == this.stockInvoice.truckName
      );

      if (truckInfo) {
        this.stockInvoice.truckId = truckInfo.id;
        this.stockInvoice.truckCapacity = truckInfo.capacity;
        this.stockInvoice.truckOwner = truckInfo.owner;
        stockInvoiceForm.form.controls['truckName'].setErrors(null);
        this.truckInfo = truckInfo;
      } else {
        this.truckInfo = new Truck();
        this.stockInvoice.truckId = '';
        this.stockInvoice.truckCapacity = 0;
        this.stockInvoice.truckOwner = '';
        stockInvoiceForm.form.controls['truckName'].setErrors({
          incorrect: true,
        });
      }
    }

    for (let i = 0; i < this.stockTransaction.length; i++) {
      if (this.stockTransaction[i].info.product) {
        this.calcQty(i);
      } else {
        break;
      }
    }
  }

  stockNameChanged(secondStock?: string) {
    if (this.cantDel) this.cantDel = false;

    this.filteredCustomer = this.filterIf_Includes();

    let stockInfo: Stock | undefined = new Stock();
    if (secondStock) {
      stockInfo = this.findStock(secondStock);
      if (stockInfo) {
        this.stockInvoice.sndStockId = stockInfo.stockId;
      }
    } else {
      stockInfo = this.findStock(this.stockInvoice.stockName);
      if (stockInfo) {
        this.stockInvoice.stockId = stockInfo.stockId;
      }
    }
  }

  filterIf_Includes(): Customer[] {
    const condArry = [
      { stockIncludes: 'حسام', customerIncludes: '- حسام' },
      { stockIncludes: 'سيف', customerIncludes: '- سيف' },
    ];

    for (let i = 0; i < condArry.length; i++) {
      if (this.stockInvoice.stockName.includes(condArry[i].stockIncludes))
        return this.customerList.filter((c) =>
          c.customerName.includes(condArry[i].customerIncludes)
        );
    }
    return this.customerList;
  }

  productChanged(i: number) {
    if (this.cantDel) this.cantDel = false;
    if (!this.chechDuplicates(i)) {
      let productInfo = this.findProduct(this.stockTransaction[i].info.product);
      if (!productInfo) {
        if (!this.stockTransaction[i].info.product) {
          this.stockTransaction[i].info.price = 0;
          this.stockTransaction[i].info.qty = 0;
          this.stockTransaction[i].info.total = 0;
          this.stockTransaction[i].info.productUnit = 1;
          this.calcQty(i);
          //this.calcTotal(i);
          this.inputValid.product[i] = { cond: true, msg: '' };
        } else {
          this.inputValid.product[i] = {
            cond: false,
            msg: 'يجب ادخال اسم صنف صحيح',
          };
        }
        this.stockTransaction[i].info.productId = 0;
      } else {
        this.inputValid.product[i] = { cond: true, msg: '' };
        this.stockTransaction[i].info.productId = productInfo.productId;
        this.stockTransaction[i].info.productUnit = productInfo.productUnit;
        this.stockTransaction[i].info.price = productInfo.lastPrice;
        this.calcQty(i);
        //this.calcTotal(i);
        /* if (this.invoiceType === 'stockTrance') {
        } */
      }
    }
  }

  isFormValid(stockInvoiceForm: NgForm) {
    if (!this.stockTransaction[0].info.product) {
      this.inputValid.product[0] = { cond: false, msg: 'يجب ادخال اسم الصنف' };
      return false;
    }

    let validArr = [];
    if (this._router.url != '/CaherReceipt')
      this.customerNameChanged(stockInvoiceForm);

    for (let i = 0; i < this.inputValid.product.length; i++) {
      if (this.inputValid.product[i].cond === false) {
        validArr.push(false);
      }
    }

    return validArr.length > 0 ? false : true;
  }

  calcTotal(i: number, cond?: string) {
    let price = this.stockTransaction[i].info.price
      ? this.stockTransaction[i].info.price
      : 0;

    if (cond != 'payLoadPrice') {
      this.productQtys[i].payLoadPrice = Number(
        (
          this.stockTransaction[i].info.price * this.stockInvoice.truckCapacity
        ).toFixed(3)
      );
    }

    let qty = this.stockTransaction[i].info.qty
      ? this.stockTransaction[i].info.qty
      : 0;
    let total = price * qty;
    let discoundVal = (total * this.stockTransaction[i].info.discound) / 100;
    this.stockTransaction[i].info.total = total - discoundVal;
    this.totalsArry[i] = this.stockTransaction[i].info.total;

    /* const totalBFTaxes = this.totalsArry.reduce((a, b) => a + b);
    const taxesVal = (this.stockInvoice.addtaxes * totalBFTaxes) / 100;

    this.stockInvoice.invoiceTotal = totalBFTaxes + taxesVal; */

    this.calcTaxes();
    this.chechDuplicates(i);
  }

  calcTaxes() {
    const totalBFTaxes = this.totalsArry.reduce((a, b) => a + b);
    const taxesVal = (this.stockInvoice.addtaxes * totalBFTaxes) / 100;

    this.stockInvoice.invoiceTotal = totalBFTaxes + taxesVal;
  }

  calcQty(i: number) {
    const truckCapacity = this.stockInvoice.truckCapacity ?? 0;
    const loadTimes = this.productQtys[i].loadTimes ?? 0;

    this.stockTransaction[i].info.qty = loadTimes * truckCapacity;

    this.calcTotal(i);
  }

  packetPriceChange(i: number) {
    this.stockTransaction[i].info.price = Number(
      (
        this.productQtys[i].payLoadPrice / this.stockInvoice.truckCapacity
      ).toFixed(3)
    );
    this.calcTotal(i, 'payLoadPrice');
  }

  chechDuplicates(i: number) {
    let price = this.stockTransaction[i].info.price;
    let qty = this.stockTransaction[i].info.qty;
    let product = this.stockTransaction[i].info.product;
    let duplicated = [];
    if (product) {
      duplicated = this.stockTransaction.filter(
        (t) =>
          t.info.price == price &&
          t.info.product == product &&
          t.info.qty == qty
      );
    }

    if (duplicated.length > 1) {
      this.inputValid.product[i] = {
        cond: false,
        msg: 'لا يمكن تكرار نفس القيم مرة اخرى',
      };
    }

    return duplicated.length > 1 ? true : false;
  }

  generateTransactionType(): number {
    if (this.stockInvoice.transactionType === 'فاتورة شراء') return 1;
    if (this.stockInvoice.transactionType === 'فاتورة بيع') return 2;
    if (this.stockInvoice.transactionType === 'اذن نقل') return 3;
    else return 4;
  }

  fillStockTransAction(id?: string, isUpdated?: boolean): StockTransaction {
    //if (!isUpdated) isUpdated = false;
    return {
      stockTransactionId: id ? id : '',
      invNumber: Date.now(),
      stockId: this.stockInvoice.stockId,
      stockName: this.stockInvoice.stockName,
      sndStockId: this.stockInvoice.sndStockId,
      truckId: this.stockInvoice.truckId,
      truckName: this.stockInvoice.truckName,
      truckCapacity: this.stockInvoice.truckCapacity,
      truckOwner: this.stockInvoice.truckOwner,
      customerId: this.stockInvoice.customerId,
      customerName: this.stockInvoice.customerName,
      transactionType: this.generateTransactionType(),
      invoiceTotal: this.stockInvoice.invoiceTotal,
      date_time: this.stockInvoice.date_time,
      notes: this.stockInvoice.notes,
      uncompleted: this.stockInvoice.uncompleted,
      madeBy: this._auth.uName.realName,
      isUpdated: isUpdated ?? this.stockInvoice.isUpdated,
      addtaxes: this.stockInvoice.addtaxes,
    };
  }

  recordStockTransAction() {
    return new Promise((res) => {
      this._stockService
        .creatStockTransaction(this.fillStockTransAction())
        .subscribe((data: any) => {
          res(data);
        });
    });
  }

  recordStockTransactionD(stockTransactionId: string) {
    for (let i = 0; i < this.stockTransaction.length; i++) {
      const oldData = this.changedData.find(
        (s) =>
          s.stockTransactionDetailsId ===
          this.stockTransaction[i].info.stockTransactionDetailsId
      );
      if (
        !this.stockTransaction[i].info.productId &&
        this.stockTransaction[i].info.stockTransactionDetailsId
      ) {
        if (oldData) {
          oldData.changedType = 0;
          oldData.customerId = oldData.customerId;
          oldData.productId = oldData.oldProductId;
          oldData.Qty = oldData.Qty;
          oldData.price = oldData.price;
          oldData.date_time = this._mainService
            .makeTime_date(new Date(Date.now()))
            .replace('T', ' ');
          oldData.notes = oldData.oldNotes;
          this._stockService.postChangedInvoice(oldData).subscribe(
            () => {
              this._stockService
                .deleteStockTransactionDetails(
                  this.stockTransaction[i].info.stockTransactionDetailsId
                )
                .subscribe();

              this._truckService
                .deleteTruckOrder(
                  this.stockTransaction[i].info.stockTransactionDetailsId,
                  'transId'
                )
                .subscribe();
            },
            (error) => {
              if (error.status == '201') {
                this._stockService
                  .deleteStockTransactionDetails(
                    this.stockTransaction[i].info.stockTransactionDetailsId
                  )
                  .subscribe();

                this._truckService
                  .deleteTruckOrder(
                    this.stockTransaction[i].info.stockTransactionDetailsId,
                    'transId'
                  )
                  .subscribe();
              }
            }
          );
        }
        //this._stockService.postChangedInvoice()
      }
      if (this.stockTransaction[i].info.productId) {
        let tranceDetail: StockTransactionD = {
          stockTransactionId: stockTransactionId,
          stockTransactionDetailsId:
            this.stockTransaction[i].info.stockTransactionDetailsId,
          productId: this.stockTransaction[i].info.productId,
          productName: this.stockTransaction[i].info.product,
          productUnit: this.stockTransaction[i].info.productUnit,
          price: this.stockTransaction[i].info.price,
          Qty: this.stockTransaction[i].info.qty,
          discound: this.stockTransaction[i].info.discound,
          truckOrder_realPrice:
            this.stockTransaction[i].info.truckOrder_realPrice,
          notes: this.stockTransaction[i].info.notes,
        };
        if (tranceDetail.stockTransactionDetailsId) {
          this.recordTruckOrder(
            this.productQtys[i].loadTimes,
            stockTransactionId,
            tranceDetail.stockTransactionDetailsId,
            'update'
          );

          this._stockService
            .UpdateStockTransactionDetails(tranceDetail)
            .subscribe(
              () => {
                if (oldData) {
                  if (this.isChanges(tranceDetail, oldData)) {
                    this.postIfChanges(tranceDetail, oldData);
                  }
                }
              },
              (error) => {
                if (error.status == '201') {
                  if (oldData) {
                    if (this.isChanges(tranceDetail, oldData)) {
                      this.postIfChanges(tranceDetail, oldData);
                    }
                  }
                }
              }
            );
        } else {
          this._stockService
            .creatStockTransactionDetails(tranceDetail)
            .subscribe((data: any) => {
              this.recordTruckOrder(
                this.productQtys[i].loadTimes,
                stockTransactionId,
                data[0],
                'post'
              );
            });
        }
      }
    }
  }

  postIfChanges(tranceDetail: StockTransactionD, oldData: Changedinvoice) {
    oldData.productId = tranceDetail.productId;
    oldData.Qty = tranceDetail.Qty;
    oldData.price = tranceDetail.price;
    oldData.date_time = this._mainService
      .makeTime_date(new Date(Date.now()))
      .replace('T', ' ');
    oldData.notes = this.stockInvoice.notes;
    oldData.customerId = this.stockInvoice.customerId;
    oldData.changedType = 1;
    oldData.productId = tranceDetail.productId;
    this._stockService.postChangedInvoice(oldData).subscribe();
    if (!this.stockInvoice.isUpdated && this.id) {
      //this.stockInvoice.isUpdated = true;
      this._stockService
        .UpdateStockTransaction(this.fillStockTransAction(this.id, true))
        .subscribe();
    }
  }

  isChanges = (
    tranceDetails: StockTransactionD,
    oldData: Changedinvoice
  ): boolean => {
    if (
      tranceDetails.productId != oldData.oldProductId ||
      tranceDetails.Qty != oldData.oldQty ||
      (tranceDetails.price != oldData.oldPrice && oldData.oldPrice != 0)
    ) {
      return true;
    }
    return false;
  };

  openDelDialog = () => {
    let dialogRef = this._dialog.open(DeleteDialogComponent, {
      data: {
        header: 'برجاء التأكد من بيانات الفاتورة قبل الحذف !',
        info: `رقم | (${this.id})`,
        discription: [
          `لحساب : ${this.stockInvoice.customerName}`,
          `مخزن | ${this.stockInvoice.stockName}`,
          `بقيمة | ${this.stockInvoice.invoiceTotal}`,
        ],
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result == 'true') {
        this.deleteInvoice();
      }
    });
  };

  delTranceDetail = (id: number) => {
    return new Promise((res) => {
      this._stockService
        .deleteStockTransactionDetails(id)
        .subscribe(() => res('done'));
    });
  };

  deleteInvoice() {
    this._glopal.loading = true;
    const processLoop = async () => {
      for (let i = 0; i < this.stockTransaction.length; i++) {
        const oldData = this.changedData.find(
          (s) =>
            s.stockTransactionDetailsId ===
            this.stockTransaction[i].info.stockTransactionDetailsId
        );
        if (oldData) {
          oldData.changedType = 2;
          oldData.customerId = oldData.customerId;
          oldData.productId = oldData.oldProductId;
          oldData.Qty = oldData.Qty;
          oldData.price = oldData.price;
          oldData.date_time = this._mainService
            .makeTime_date(new Date(Date.now()))
            .replace('T', ' ');
          oldData.customerId = this.stockInvoice.customerId;

          this._stockService.postChangedInvoice(oldData).subscribe();
        }

        this._truckService
          .deleteTruckOrder(
            this.stockTransaction[i].info.stockTransactionDetailsId,
            'transId'
          )
          .subscribe();

        const personId = await this.delTranceDetail(
          this.stockTransaction[i].info.stockTransactionDetailsId
        );
      }
    };

    processLoop().then(() => {
      if (this.id)
        this._stockService
          .deleteStockTransaction(parseInt(this.id))
          .subscribe(() => {
            this._glopal.loading = false;
            this._location.back();
          });
    });
  }

  fillNewInvoice() {
    this.addfildes();

    this.stockInvoice = {
      transactionType: 'فاتورة شراء',
      stockTransactionId: 0,
      invNumber: 0,
      stockId: this.stocksList[0].stockId,
      stockName: this.stocksList[0].stockName,
      sndStockId: 1,
      sndStockName: '',
      truckId: '100',
      truckName: '',
      truckCapacity: 1,
      truckOwner: '',
      customerName: '',
      customerId: 1,
      date_time: this._mainService.makeTime_date(new Date(Date.now())),
      invoiceTotal: 0,
      notes: '',
      uncompleted: '',
      madeBy: this._auth.uName.realName,
      isUpdated: false,
      addtaxes: 0,
    };

    this.checkedStatue = false;

    this.stockInvoice.transactionType = 'فاتورة شراء';
    this.invoiceCond = 'فاتورة جديدة';
    this.stockInvoice.invoiceTotal = 0;
    this.inputValid.formValid = true;

    this.productsList = this.productListFactory([], this.allProducts);
  }

  checkStatu() {
    this.cantDel = false;
    if (!this.checkedStatue) {
      this.stockInvoice.uncompleted = '';
    } else {
      this.stockInvoice.uncompleted = 'بيانات غير مكتملة';
    }
  }

  moreOptions(option: string) {
    if (option === 'discound') this.discoundShow();
  }

  discoundShow() {
    if (this.moreMenu.discound === 'اضافة خصم') {
      this.showDiscound = true;
      this.moreMenu.discound = 'الغاء الخصم';
    } else if (this.moreMenu.discound === 'الغاء الخصم') {
      this.showDiscound = false;
      this.moreMenu.discound = 'اضافة خصم';
      for (let i = 0; i < this.stockTransaction.length; i++) {
        this.stockTransaction[i].info.discound = 0;
        if (this.stockTransaction[i].info.productId) {
          this.calcTotal(i);
        }
      }
    }
  }

  openDialog = (dataVals: {
    header: string;
    info: string;
    discription: string[];
  }) => {
    let dialogRef = this._dialog.open(DoneDialogComponent, {
      data: {
        header: dataVals.header,
        info: dataVals.info,
        discription: dataVals.discription,
        btns: {
          addNew: 'اضافة بيانات جديدة',
          goHome: 'موردين | مستهلكين',
        },
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result == 'addNew') {
        if (this.id) {
          this._router.navigate(['/StockInvoice']);
        } else {
          this.fillNewInvoice();
        }
      } else if (result == 'back') {
        this._location.back();
      } else {
        this._router.navigate(['/CustomerList']);
      }
    });
  };

  openCasherDialog(stockInvoiceForm: NgForm) {
    let dialogRef = this._dialog.open(CasherDialogComponent, {
      data: this.stockInvoice.invoiceTotal,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.recordInvoice(stockInvoiceForm);
      }
    });
  }

  passDialog(id: string) {
    this._glopal.loading = false;
    let header = this.id ? 'تم تعديل' : 'تم تسجيل';
    let discription = [
      `فاتورة رقم | (${id})`,
      `المخزن | ${this.stockInvoice.stockName}`,
      `بقيمة | ${this.stockInvoice.invoiceTotal}`,
    ];

    if (this.stockInvoice.notes)
      discription.push(`ملاحظات | ${this.stockInvoice.notes}`);

    this.openDialog({
      header: `${header} ${this.stockInvoice.transactionType}`,
      info: `باسم | ${this.stockInvoice.customerName}`,
      discription: discription,
    });
  }

  recordInvoice(stockInvoiceForm: NgForm) {
    this.isFormValid(stockInvoiceForm);
    this._glopal.loading = true;
    if (this.id) {
      if (this._glopal.check.edi) {
        this._stockService
          .UpdateStockTransaction(this.fillStockTransAction(this.id))
          .subscribe();
        this.recordStockTransactionD(this.id);

        this.passDialog(this.id);
      } else {
        this._snackBar.open('لا توجد صلاحية للتعديل', 'اخفاء', {
          duration: 2500,
        });
        this._glopal.loading = false;
      }
    } else {
      this.recordStockTransAction().then((data: any) => {
        this.recordStockTransactionD(data[0]);
        this.passDialog(data[0]);
        /* if (this._router.url.includes('CaherReceipt')) {
          window.print();
          this.onStart();
        } else {
          this.passDialog(data[0]);
        } */
      });
    }
  }

  recordTruckOrder(
    loadTimes: number,
    invoiceId: string,
    stockTransactionDetailsId: any,
    cond: string = 'post'
  ) {
    if (this.stockInvoice.truckName != '') {
      const price =
        this.truckInfo.customerId == this.stockInvoice.customerId.toString()
          ? 0
          : this.truckInfo.metrPrice;
      const truckOrder: TruckOrder = {
        orderId: null,
        truckId: this.stockInvoice.truckId,
        truckName: this.stockInvoice.truckName,
        truckCapacity: this.stockInvoice.truckCapacity,
        truckModel: this.truckInfo.model,
        orderType: this.stockInvoice.truckOwner,
        truckType: 'سيارة',
        loadingType: 'متر',
        truckCustomerId: '1',
        truckCustomerName: '',
        LoadTimes: loadTimes,
        totalQty: 0,
        price: 0,
        realPrice: price,
        totalVal: 0,
        date_time: this.stockInvoice.date_time,
        notes: `${this.stockInvoice.customerName} | فاتورة (${invoiceId})`,
        stockTransactionDetailsId: stockTransactionDetailsId,
        stockTransactionId: '',
        madeBy: this._auth.uName.realName,
      };

      if (cond == 'post')
        this._truckService.postTruckOrder(truckOrder).subscribe();

      if (cond == 'update')
        this._truckService.updateTruckOrder(truckOrder, 'transId').subscribe();
    }
  }

  onSubmit(stockInvoiceForm: NgForm) {
    this.isFormValid(stockInvoiceForm);
    // check if form Valid
    if (!stockInvoiceForm.valid || !this.isFormValid(stockInvoiceForm)) {
      this.inputValid.formValid = false;
      return;
    } else {
      if (this._router.url === '/CaherReceipt') {
        this.openCasherDialog(stockInvoiceForm);
      } else {
        this.recordInvoice(stockInvoiceForm);
      }
    }
  }

  toEditReport() {
    if (this._auth?.check.prem && this.stockInvoice.isUpdated)
      this._router.navigate([`/InvoiceChangesReport/${this.id}`]);
  }
}
