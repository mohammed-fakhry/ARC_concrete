import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Concrete } from 'src/app/classes/concrete';
import { ConcreteCustomer } from 'src/app/classes/concrete-customer';
import { ConcreteMaterial } from 'src/app/classes/concrete-material';
import { ConcreteReceipDetails } from 'src/app/classes/concrete-receip-details';
import { ConcreteReceipt } from 'src/app/classes/concrete-receipt';
import { Product } from 'src/app/classes/product';
import { Stock } from 'src/app/classes/stock';
import { StockTransaction } from 'src/app/classes/stock-transaction';
import { StockTransactionD } from 'src/app/classes/stock-transaction-d';
import { DoneDialogComponent } from 'src/app/dialogs/done-dialog/done-dialog.component';
import { AuthService } from 'src/app/services/auth.service';
import { ConcreteService } from 'src/app/services/concrete.service';
import { GlobalVarsService } from 'src/app/services/global-vars.service';
import { MainService } from 'src/app/services/main.service';
import { StockService } from 'src/app/services/stock.service';
import { Location } from '@angular/common';
import { TruckService } from 'src/app/services/truck.service';
import { ConcreteBon } from 'src/app/classes/concrete-bon';
import { DeleteDialogComponent } from 'src/app/dialogs/delete-dialog/delete-dialog.component';

@Component({
  selector: 'app-add-concrete-receipt',
  templateUrl: './add-concrete-receipt.component.html',
  styleUrls: ['./add-concrete-receipt.component.scss'],
})
export class AddConcreteReceiptComponent implements OnInit {
  id!: string | null;

  addByBon!: {
    date: string | null;
    customerId: string | null;
    customerProject: string | null;
  };

  productList: Product[] = [];
  concreteList: Concrete[] = [];
  dataList: string[] = [];

  concreteReceipt: ConcreteReceipt = new ConcreteReceipt();
  customerList: ConcreteCustomer[] = [];
  customerInfo: ConcreteCustomer = new ConcreteCustomer();
  concreteBons: ConcreteBon[] = [];

  stockList: Stock[] = [];

  totalsArry: number[] = [];
  totalsArryBfAddVal: number[] = [];

  discoundsArry: any[] = []; /* { description: string; val: number }[] | */

  totalBeforAddTaxes: number = 0;
  // addTaxVal: number = 0;
  mainTotal: number = 0;

  recieptMaterials: {
    qty: number;
    materials: ConcreteMaterial[];
  }[] = [];

  formValid = {
    mainForm: false,
    concretes: [{ concreteName: true, qty: true }],
  };

  invoiceTotal: number = 0;

  concreteUpdated: boolean = false;
  dateExpires: boolean = false;

  constructor(
    public _mainService: MainService,
    public _glopal: GlobalVarsService,
    public _router: Router,
    public activeRoute: ActivatedRoute,
    public _stockService: StockService,
    public _concrete: ConcreteService,
    public _dialog: MatDialog,
    public _location: Location,
    public _truckService: TruckService,
    public _auth: AuthService
  ) {
    this._glopal.loading = true;
    this._glopal.currentHeader = 'اذن خرسانة';
  }

  ngOnInit(): void {
    window.addEventListener('resize', () => {
      this._mainService.handleTableHeight();
    });

    this.onStart();
  }

  onStart() {
    this.id = this.activeRoute.snapshot.paramMap.get('id');

    this.addByBon = {
      date: this.activeRoute.snapshot.paramMap.get('date'),
      customerId: this.activeRoute.snapshot.paramMap.get('customerId'),
      customerProject:
        this.activeRoute.snapshot.paramMap.get('customerProject'),
    };

    this.productList = [];
    this.concreteList = [];
    this.concreteBons = [];
    this.dataList = [];
    this.recieptMaterials = [];
    this.discoundsArry = [];
    this.totalsArry = [];
    this.totalsArryBfAddVal = [];
    this.concreteReceipt.totalInAr = '';
    this.concreteReceipt.addTaxesVal = 0;
    this.mainTotal = 0;
    this.invoiceTotal = 0;

    this.dateExpires = false;

    this.concreteReceipt.date_time = this._mainService
      .makeTime_date(new Date(Date.now()))
      .replace('T', ' ');

    Promise.all([
      this.getConcreats(),
      this.getProducts(),
      this.getConcreteCustomers(),
      this.getStocks(),
    ])
      .then((data: any) => {
        const result = {
          concretes: data[0],
          products: data[1],
          concreteCustomers: data[2],
          stocks: data[3],
        };

        this.concreteList = result.concretes;
        this.productList = result.products;
        this.customerList = result.concreteCustomers;
        this.stockList = result.stocks;

        const stockInfo = this.stockList[1];

        if (
          this.addByBon.customerId &&
          this.addByBon.date &&
          this.addByBon.customerProject
        ) {
          this.fillByBons(
            this.addByBon.date,
            this.addByBon.customerId,
            this.addByBon.customerProject
          );
        } else if (this.id) {
          this.fillToEdit();
        } else {
          this.concreteReceipt = new ConcreteReceipt();

          this.concreteReceipt.stockTransaction.stockId = stockInfo.stockId;
          this.concreteReceipt.stockTransaction.stockName = stockInfo.stockName;
          this.concreteReceipt.date_time = this._mainService.makeTime_date(
            new Date(Date.now())
          );
          this.concreteReceipt.madeBy = this._auth.uName.realName;

          this._glopal.loading = false;

          this.startForm();
        }
      })
      .then(() => {
        this._mainService.handleTableHeight();
        this.calcTotalDiscound();
      });
  }

  fillByBons(date: string, customerId: string, customerProject: string) {
    this.concreteReceipt = new ConcreteReceipt();
    this.concreteReceipt.madeBy = this._auth.uName.realName;

    if (customerProject != '0') {
      this.concreteReceipt.customerProject = customerProject;
    }

    this.concreteListByBon(date, customerId, customerProject)
      .then((data: ConcreteBon[]) => {
        this.concreteBons = data;

        this.customerInfo =
          this.customerList.find((customer) => customer.id == customerId) ??
          new ConcreteCustomer();

        this.concreteReceipt.date_time = this._mainService.makeTime_date(
          new Date(Date.now())
        );

        const stockInfo = this.stockList[1];

        this.concreteReceipt.date_time = `${date}T23:59`;
        // customerInfo
        this.concreteReceipt.concreteCustomer_name = this.customerInfo.fullName;
        this.concreteReceipt.concreteCustomer_id = this.customerInfo.id;

        // stockInfo
        this.concreteReceipt.stockTransaction.stockId = stockInfo.stockId;
        this.concreteReceipt.stockTransaction.stockName = stockInfo.stockName;

        this.fillDetailsByBon(data);
      })
      .then(() => {
        this._glopal.loading = false;
      });
  }

  fillDetailsByBon(bons: ConcreteBon[]) {
    const concretNames = [...new Set(bons.map((bon) => bon.concreteName))];

    for (let i = 0; i < concretNames.length; i++) {
      const concreteArr = bons.filter(
        (bon) => bon.concreteName == concretNames[i]
      );

      const qty = concreteArr
        .map((bon) => bon.concreteQty)
        .reduce((a, b) => a + b, 0);

      this.addRow();

      this.concreteReceipt.receiptDetails[
        i
      ].concreteName = `${concretNames[i]}`;

      this.productNameChanged(i);

      this.concreteReceipt.receiptDetails[i].concreteQty = qty;

      this.calcTotal(i);
      this.calcMaterial(i);

      if (i == concretNames.length - 1) {
        const pumps = bons
          .filter(
            (bon) => !bon.pump.includes('ثابت') && !bon.pump.includes('مزراب')
          )
          .map((bon) => {
            return {
              name: bon.pump,
              qty: bon.concreteQty,
            };
          });

        const PumpsNames = [...new Set(pumps.map((pump) => pump.name))];

        for (let indx = 0; indx < PumpsNames.length; indx++) {
          const concreteArr = pumps.filter(
            (pump) => pump.name == PumpsNames[indx]
          );

          const qty = concreteArr
            .map((pump) => pump.qty)
            .reduce((a, b) => a + b, 0);

          this.addRow();

          this.concreteReceipt.receiptDetails[
            indx + i + 1
          ].concreteName = `${PumpsNames[indx]}`;

          this.productNameChanged(indx + i + 1);

          this.concreteReceipt.receiptDetails[indx + i + 1].concreteQty = qty;

          this.calcTotal(indx + i + 1);
          this.calcMaterial(indx + i + 1);
        }
      }
    }
  }

  fillToEdit() {
    this.getConcreteReciept().then((data: ConcreteReceipt[]) => {
      if (!data[0].stockTransaction) {
        data[0].stockTransaction = new StockTransaction();
      }
      this.concreteReceipt = data[0];

      const arTotal = `${data[0].totalInAr}`;

      for (let i = 0; i < this.concreteReceipt.receiptDetails.length; i++) {
        const receiptDetails = this.concreteReceipt.receiptDetails[i];
        const concreteInfo = this.concreteList.find(
          (concrete) => concrete.id == receiptDetails.concreteId
        );

        if (concreteInfo) {
          this.concreteReceipt.receiptDetails[i].concreteInfo = concreteInfo;
          this.recieptMaterials.push({
            qty: receiptDetails.concreteQty,
            materials: concreteInfo?.materials,
          });
        }

        this.dataList.push(`datalistproducts${this.dataList.length}`);
        this.formValid.concretes.push({ concreteName: true, qty: true });
        this.totalsArry.push(receiptDetails.total);
        this.totalsArryBfAddVal.push(
          receiptDetails.concreteQty * receiptDetails.concretePrice
        );
        this.calcTotal(i);
      }

      this.concreteUpdated = this.concreteReceipt.receiptDetails.some(
        (d) => d.concreteInfo.lastUpdated > this.concreteReceipt.date_time
      );

      this.dateExpires = this._mainService.dateExpired(
        this.concreteReceipt.date_time
      );

      this.calcInvoiceTotal();

      this.customerInfo =
        this.customerList.find(
          (customer) => this.concreteReceipt.concreteCustomer_id == customer.id
        ) ?? new ConcreteCustomer();

      this.formValid.mainForm = true;

      if (arTotal) this.concreteReceipt.totalInAr = arTotal;

      if (this.concreteReceipt.recordedByBon) this.getReceiptElements();

      this._glopal.loading = false;
    });
  }

  concreteElements: {
    concrete: string;
    element: string;
    qty: number;
    pump: string;
  }[] = [];

  elementLoading: boolean = false;

  getReceiptElements() {
    this.concreteElements = [];

    this.elementLoading = true;
    this.getBonsByReceiptId().then((data: ConcreteBon[]) => {
      const concretes = [...new Set(data.map((d) => d.concreteName))];
      const elements = [...new Set(data.map((d) => d.notes))];
      const pumps = [...new Set(data.map((d) => d.pump))];

      for (let i = 0; i < concretes.length; i++) {
        for (let nI = 0; nI < elements.length; nI++) {
          for (let nP = 0; nP < pumps.length; nP++) {
            const rowInfo = data.find(
              (d) =>
                d.concreteName == concretes[i] &&
                d.notes == elements[nI] &&
                d.pump == pumps[nP]
            );

            if (rowInfo) {
              const row = {
                concrete: rowInfo.concreteName,
                element: rowInfo.notes,
                pump: rowInfo.pump,
                qty: data
                  .filter(
                    (d) =>
                      d.concreteName == concretes[i] &&
                      d.notes == elements[nI] &&
                      d.pump == pumps[nP]
                  )
                  .map((d) => d.concreteQty)
                  .reduce((a, b) => a + b, 0),
              };

              this.concreteElements = [...this.concreteElements, row];
            }
          }
        }
      }

      this.elementLoading = false;
    });
  }

  getConcreteReciept(): Promise<ConcreteReceipt[]> {
    return new Promise((res) => {
      if (this.id)
        this._concrete
          .getConcreteReciept(this.id)
          .subscribe((data: ConcreteReceipt[]) => {
            res(data);
          });
    });
  }

  getBonsByReceiptId(): Promise<ConcreteBon[]> {
    return new Promise((res) => {
      if (this.id)
        this._concrete
          .concreteBonsByReceiptId(this.id)
          .subscribe((data: ConcreteBon[]) => {
            res(data);
          });
    });
  }

  concreteListByBon(
    date: string,
    customerId: string,
    customerProject: string
  ): Promise<ConcreteBon[]> {
    return new Promise((res) => {
      this._concrete
        .concreteListByBon(date, customerId, customerProject)
        .subscribe((data: ConcreteBon[]) => res(data));
    });
  }

  startForm() {
    if (this.id) {
    } else {
      this.addFildes();
    }
  }

  addFildes() {
    for (let i = 0; i < 5; i++) {
      this.addRow();
      this.calcTotal(i);
    }
  }

  addRow() {
    const receiptDetails = new ConcreteReceipDetails();
    this.concreteReceipt.receiptDetails.push(receiptDetails);
    this.dataList.push(`datalistproducts${this.dataList.length}`);
    this.formValid.concretes.push({ concreteName: true, qty: true });
    this.recieptMaterials.push({ qty: 0, materials: [] });
    this.totalsArry.push(0);
    this.totalsArryBfAddVal.push(0);
  }

  getProducts(): Promise<Product[]> {
    return new Promise((res) => {
      this._stockService.getProduct().subscribe((data: Product[]) => res(data));
    });
  }

  getConcreats(): Promise<Concrete[]> {
    return new Promise((res) => {
      this._concrete.concreteList().subscribe((data: Concrete[]) => res(data));
    });
  }

  getConcreteCustomers(): Promise<ConcreteCustomer[]> {
    return new Promise((res) => {
      this._concrete
        .concreteCustomerList()
        .subscribe((data: ConcreteCustomer[]) => res(data));
    });
  }

  getStocks() {
    return new Promise((res) => {
      this._stockService.getStockes().subscribe((data: Stock[]) => res(data));
    });
  }

  manualNumChanged(concreteReceiptForm: NgForm) {
    if (
      this.concreteReceipt.manualNum != 'مستخلص مضخة ثابتة' &&
      this.concreteReceipt.manualNum != ''
    ) {
      this._concrete
        .checkConcreteManualNum(this.concreteReceipt.manualNum)
        .subscribe((data: any) => {
          if (data.length > 0) {
            concreteReceiptForm.form.controls['manualNum'].setErrors({
              incorrect: true,
            });
            this._mainService.playshortFail();
          } else {
            concreteReceiptForm.form.controls['manualNum'].setErrors(null);
          }
        });
    } else {
      concreteReceiptForm.form.controls['manualNum'].setErrors(null);
    }
  }

  customerNameChanged(concreteReceiptForm?: NgForm) {
    const isCustomer = this.customerList.find(
      (customer) =>
        customer.fullName === this.concreteReceipt.concreteCustomer_name
    );

    if (isCustomer) {
      this.customerInfo = isCustomer;
      this.concreteReceipt.concreteCustomer_id = this.customerInfo.id;

      if (concreteReceiptForm)
        concreteReceiptForm.form.controls['concreteCustomer_name'].setErrors(
          null
        );
    } else {
      this.customerInfo = new ConcreteCustomer();
      this.concreteReceipt.concreteCustomer_id = null;

      if (concreteReceiptForm) {
        concreteReceiptForm.form.controls['concreteCustomer_name'].setErrors({
          incorrect: true,
        });
        this._mainService.playshortFail();
      }
    }
  }

  productNameChanged(i: number) {
    const concreteInfo = this.concreteList.find(
      (concrete) =>
        concrete.name === this.concreteReceipt.receiptDetails[i].concreteName
    ); //new Concrete();

    if (concreteInfo) {
      this.concreteReceipt.receiptDetails[i].concreteInfo = concreteInfo;

      this.concreteReceipt.receiptDetails[i].concreteId = concreteInfo.id;

      if (this.concreteReceipt.concreteReceiptType != 'مستخلص مضخة ثابتة') {
        this.recieptMaterials[i] = {
          qty: this.concreteReceipt.receiptDetails[i].concreteQty,
          materials: concreteInfo.materials,
        };
      }

      this.formValid.concretes[i].concreteName = true;
    } else {
      this.concreteReceipt.receiptDetails[i].concreteId = null;

      this.formValid.concretes[i].concreteName = false;
      this.recieptMaterials[i] = {
        qty: 0,
        materials: [],
      };
    }

    const isInvalid = this.formValid.concretes.find(
      (concrete) => !concrete.concreteName
    );

    this.formValid.mainForm = isInvalid ? false : true;

    if (this.concreteReceipt.concreteReceiptType != 'مستخلص مضخة ثابتة') {
      this.calcMaterial();
    }
  }

  changeConcreteReceiptType(type: string) {
    this.concreteReceipt.concreteReceiptType = type;
    if (type == 'مستخلص مضخة ثابتة') {
      this.concreteReceipt.stockTransactionD = [];
      this.concreteReceipt.manualNum = type;
      this.concreteReceipt.stockTransactionId = '0';
      this.concreteReceipt.totalDiscound = 0;
    } else {
      this.concreteReceipt.manualNum = '';
      this.concreteReceipt.totalDiscound = 14;
    }
  }

  calcTotal(i: number) {
    const total =
      this.concreteReceipt.receiptDetails[i].concretePrice *
      this.concreteReceipt.receiptDetails[i].concreteQty;

    const discoundVal =
      (total * this.concreteReceipt.receiptDetails[i].discound) / 100;

    this.concreteReceipt.receiptDetails[i].total = total - discoundVal;

    // اجمالى بعد الخصم
    this.totalsArry[i] = this.concreteReceipt.receiptDetails[i].total;

    // اجمالى قبل الخصم
    this.totalsArryBfAddVal[i] = total;

    this.mainTotal = this.totalsArryBfAddVal.reduce((a, b) => a + b, 0);

    this.totalBeforAddTaxes = this.totalsArry.reduce((a, b) => a + b, 0);

    const mainDicoundVal =
      (this.mainTotal * this.concreteReceipt.totalDiscound) / 100;

    this.concreteReceipt.total = this.totalBeforAddTaxes + mainDicoundVal;

    this.makeDiscArr();
    this.calcTotalDiscound();
    this.concreteReceipt.totalInAr = `${this._mainService.inArabicWords(
      this.concreteReceipt.total
    )}`;
  }

  calcTotalDiscound() {
    this.concreteReceipt.addTaxesVal =
      (this.mainTotal * this.concreteReceipt.totalDiscound) / 100;

    this.concreteReceipt.total =
      this.totalBeforAddTaxes + this.concreteReceipt.addTaxesVal;
  }

  makeDiscArr() {
    this.discoundsArry = [];

    const filtered = [
      ...new Set(
        this.concreteReceipt.receiptDetails
          .filter((detail) => detail.concreteName && detail.discound != null)
          .map((detail) => detail.discound)
      ),
    ];

    for (let i = 0; i < filtered.length; i++) {
      const indx = this.discoundsArry.findIndex(
        (d: any) => d.discVal == filtered[i]
      );

      const totalDisc = this.concreteReceipt.receiptDetails
        .filter((detail) => detail.discound == filtered[i])
        .map(
          (detail) =>
            (detail.concreteQty * detail.concretePrice * detail.discound) / 100
        )
        .reduce((a, b) => a + b, 0);

      if (indx == -1) {
        if (filtered[i])
          this.discoundsArry.push({
            description: `خصم أ.ت.ص ${filtered[i]} %`,
            discVal: filtered[i],
            val: totalDisc,
          });
      } else {
        this.discoundsArry[i] = {
          description: `خصم أ.ت.ص ${filtered[i]} %`,
          discVal: filtered[i],
          val: totalDisc,
        };
      }
    }

    // del discound if not in recipt
    for (let dI = 0; dI < this.discoundsArry.length; dI++) {
      const isInDiscound = filtered.find(
        (d) => d == this.discoundsArry[dI].discVal
      );
      if (!isInDiscound) this.discoundsArry.splice(dI, 1);
    }

    this.discoundsArry.sort((a, b) => a.discVal - b.discVal);

    // console.log(filtered);
  }

  calcInvoiceTotal() {
    this.invoiceTotal = this.concreteReceipt.stockTransactionD
      .map((row) => row.Qty * row.price)
      .reduce((a, b) => a + b, 0);
  }

  generateMaterials(): any[] {
    let allMaterials: any[] = [];

    for (let i = 0; i < this.recieptMaterials.length; i++) {
      if (this.recieptMaterials[i].materials.length > 0) {
        let newMaterials = this.recieptMaterials[i].materials.map(
          (material: ConcreteMaterial) => {
            return {
              ...material,
              mainQty: this.recieptMaterials[i].qty,
              totalQty: material.materialQty * this.recieptMaterials[i].qty,
            };
          }
        );
        allMaterials = [...allMaterials, ...newMaterials];
      }
    }

    return allMaterials;
  }

  /* calcPower(a: number, b: number) : number {
    return parseInt(Number(a * ).toFixed(3))
  } */

  calcMaterial(indx?: number) {
    if (indx === 0 || indx) {
      this.recieptMaterials[indx].qty =
        this.concreteReceipt.receiptDetails[indx].concreteQty;
      this.calcTotal(indx);
    }

    if (this.concreteReceipt.concreteReceiptType != 'مستخلص مضخة ثابتة') {
      const allMaterials = this.generateMaterials();

      let productsIds = [
        ...new Set(
          allMaterials.map((material: ConcreteMaterial) => material.productId)
        ),
      ];

      let allProducts: any[] = [];

      for (let i = 0; i < productsIds.length; i++) {
        const filterProduct = allMaterials.filter(
          (material) => material.productId == productsIds[i]
        );

        const totalQty = filterProduct
          .map((product) => product.totalQty)
          .reduce((a, b) => a + b, 0);

        const ProductInfo = {
          productId: productsIds[i],
          productName: filterProduct[0].productName,
          productCost:
            filterProduct[0].productName.includes('اسمنت') &&
            this.customerInfo.cementCustomerId != '1'
              ? 0
              : filterProduct[0].productCost,
          totalQty: parseFloat(totalQty.toFixed(4)),
        };

        allProducts = [...allProducts, ProductInfo];
      }

      this.fillTransactionDetail(allProducts);
    }
  }

  fillTransactionDetail(allProducts: any[]) {
    for (let i = 0; i < allProducts.length; i++) {
      const transIndx = this.concreteReceipt.stockTransactionD.findIndex(
        (product) => product.productName == allProducts[i].productName
      );

      if (transIndx > -1) {
        this.concreteReceipt.stockTransactionD[transIndx].Qty =
          allProducts[i].totalQty;
      } else {
        let transactionDetail = new StockTransactionD();

        transactionDetail.productId = allProducts[i].productId;
        transactionDetail.productName = allProducts[i].productName;
        transactionDetail.price = allProducts[i].productCost;
        transactionDetail.Qty = allProducts[i].totalQty;

        this.concreteReceipt.stockTransactionD.push(transactionDetail);
      }
    }

    this.calcInvoiceTotal();
  }

  fillStockTransAction(id?: string, isUpdated?: boolean): StockTransaction {
    //if (!isUpdated) isUpdated = false;
    return {
      stockTransactionId: id ? id : '',
      invNumber: Date.now(),
      stockId: this.concreteReceipt.stockTransaction.stockId,
      stockName: this.concreteReceipt.stockTransaction.stockName,
      sndStockId: 1,
      truckId: '7',
      truckName: 'الخرسانة',
      truckCapacity: 1,
      truckOwner: 'سيارة الشركة',
      customerId: 100,
      customerName: 'الخرسانة',
      transactionType: 2,
      invoiceTotal: this.concreteReceipt.stockTransaction.invoiceTotal,
      date_time: this.concreteReceipt.date_time,
      notes: `${this.concreteReceipt.notes} | ${this.concreteReceipt.concreteCustomer_name}`,
      uncompleted: this.concreteReceipt.stockTransaction.uncompleted,
      madeBy: this._auth.uName.realName,
      isUpdated: isUpdated ?? this.concreteReceipt.stockTransaction.isUpdated,
      addtaxes: 0,
    };
  }

  startRecord() {
    if (this.concreteReceipt.concreteReceiptType != 'مستخلص مضخة ثابتة') {
      if (this.id) {
        this._stockService
          .UpdateStockTransaction(this.fillStockTransAction(this.id))
          .subscribe(() => {
            this.openDialog();
            this.recordStockTransaction_d(
              this.concreteReceipt.stockTransaction.stockTransactionId
            );
            this.recordReceipt(
              this.concreteReceipt.stockTransaction.stockTransactionId
            );
          });
      } else {
        this._stockService
          .creatStockTransaction(this.fillStockTransAction())
          .subscribe((data: any) => {
            this.openDialog();
            this.recordStockTransaction_d(data[0]);
            this.recordReceipt(data[0]);
          });
      }
    } else {
      this.recordReceipt('0');
      this.openDialog();
    }
  }

  recordReceipt(tranactionId: any) {
    this.concreteReceipt.stockTransactionId = tranactionId;

    if (this.id) {
      this._concrete
        .updateConcreteReceipt(this.concreteReceipt)
        .subscribe(() => {
          this.recordReceiptDetails(this.concreteReceipt.concreteReceipt_id);
        });
    } else {
      if (this.addByBon.date && this.addByBon.customerId) {
        this.concreteReceipt.recordedByBon = true;
      }

      this._concrete
        .postConcreteReceipt(this.concreteReceipt)
        .subscribe((data: any) => {
          this.recordReceiptDetails(data[0]);
          if (this.addByBon.date && this.addByBon.customerId) {
            this.makeBonAsDone(data[0]);
          }
        });
    }
  }

  makeBonAsDone(concreteReceipt_id: string) {
    for (let i = 0; i < this.concreteBons.length; i++) {
      this.concreteBons[i].concreteReceipt_id = concreteReceipt_id;

      this._concrete
        .putReceiptIdToConcreteBone(this.concreteBons[i])
        .subscribe();
    }
  }

  recordReceiptDetails(concreteReceipt_id: any) {
    for (let i = 0; i < this.concreteReceipt.receiptDetails.length; i++) {
      const receiptDetails = this.concreteReceipt.receiptDetails[i];

      if (receiptDetails.concreteId) {
        receiptDetails.concreteReceipt_id = concreteReceipt_id;
        if (receiptDetails.id) {
          this._concrete.updateConcreteReceipt_d(receiptDetails).subscribe();
        } else {
          this._concrete.postConcreteReceipt_d(receiptDetails).subscribe();
        }
      }

      /* if (i === this.concreteReceipt.receiptDetails.length - 1) {
        this.openDialog();
      } */
    }
  }

  openDelDialog = () => {
    let dialogRef = this._dialog.open(DeleteDialogComponent, {
      data: {
        header: 'برجاء التأكد من بيانات الفاتورة قبل الحذف !',
        info: `رقم | (${this.id})`,
        discription: [
          `لحساب : ${this.concreteReceipt.concreteCustomer_name}`,
          `مخزن | ${this.concreteReceipt.stockTransaction.stockName}`,
          `بقيمة | ${this.concreteReceipt.total}`,
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

  delReceipteDetail = (id: string | null) => {
    return new Promise((res) => {
      if (id)
        this._concrete
          .delConcreteReceiptDetail(id)
          .subscribe(() => res('done'));
    });
  };

  deleteInvoice() {
    this._glopal.loading = true;

    if (this.concreteReceipt.stockTransaction.stockTransactionId) {
      const processLoop_receiptDetail = async () => {
        for (
          let d = 0;
          d < this.concreteReceipt.stockTransactionD.length;
          d++
        ) {
          if (
            this.concreteReceipt.stockTransactionD[d].stockTransactionDetailsId
          ) {
            this._truckService
              .deleteTruckOrder(
                this.concreteReceipt.stockTransactionD[d]
                  .stockTransactionDetailsId,
                'transId'
              )
              .subscribe();
          }

          const personId = await this.delTranceDetail(
            this.concreteReceipt.stockTransactionD[d].stockTransactionDetailsId
          );
        }
      };

      processLoop_receiptDetail().then(() => {
        if (this.concreteReceipt.stockTransaction.stockTransactionId)
          this._stockService
            .deleteStockTransaction(
              parseInt(this.concreteReceipt.stockTransaction.stockTransactionId)
            )
            .subscribe(() => {
              console.log('stockDone');
              this.deleteReceipts();
            });
      });
    } else {
      this.deleteReceipts();
    }
  }

  deleteReceipts() {
    const processLoop_receiptDetail = async () => {
      for (let d = 0; d < this.concreteReceipt.receiptDetails.length; d++) {
        const personId = await this.delReceipteDetail(
          this.concreteReceipt.receiptDetails[d].id
        );
      }
    };

    processLoop_receiptDetail().then(() => {
      if (this.id)
        this._concrete.delConcreteReceipt(this.id).subscribe(() => {
          this._glopal.loading = false;
          this._location.back();
        });
    });
  }

  openDialog = () => {
    let dialogRef = this._dialog.open(DoneDialogComponent, {
      data: {
        header: 'تم اضافة اذن الخرسانة',
        info: `العميل | ${this.concreteReceipt.concreteCustomer_name}`,
        discription: [
          `اجمالى | ${this.concreteReceipt.total.toFixed(2)}`,
          `ملاحظات | ${this.concreteReceipt.notes}`,
        ],
        btns: {
          addNew: 'اضافة بيانات جديدة',
          goHome: 'عملاء الخرسانة',
        },
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result == 'addNew') {
        if (this.id && this.addByBon.date) {
          this._router.navigate(['/ConcreteReceipt']);
        } else {
          this.onStart();
        }
      } else if (result == 'back') {
        this._location.back();
      } else {
        this._router.navigate(['/ConcreteCustomerList']);
      }
    });
  };

  // recordStockTransaction() {}

  recordStockTransaction_d(tranactionId: any) {
    for (let i = 0; i < this.concreteReceipt.stockTransactionD.length; i++) {
      const stocktrans_d = this.concreteReceipt.stockTransactionD[i];

      let tranceDetail: StockTransactionD = {
        stockTransactionId: tranactionId,
        stockTransactionDetailsId: stocktrans_d.stockTransactionDetailsId,
        productId: stocktrans_d.productId,
        productName: stocktrans_d.productName,
        productUnit: stocktrans_d.productUnit,
        price: stocktrans_d.price,
        Qty: stocktrans_d.Qty,
        truckOrder_realPrice: 0,
        discound: 0,
        notes: '',
      };

      if (tranceDetail.stockTransactionDetailsId) {
        this._stockService
          .UpdateStockTransactionDetails(tranceDetail)
          .subscribe();
      } else {
        this._stockService
          .creatStockTransactionDetails(tranceDetail)
          .subscribe();
      }
    }
  }

  onSubmit(concreteReceiptForm: NgForm) {
    if (
      concreteReceiptForm.valid &&
      !this.formValid.concretes.some((product) => !product.concreteName)
    ) {
      this.startRecord();
    } else {
      this._mainService.playshortFail();
    }
  }

  printDocument() {
    window.print();
  }
}
