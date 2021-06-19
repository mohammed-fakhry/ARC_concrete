import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Concrete } from 'src/app/classes/concrete';
import { ConcreteBon } from 'src/app/classes/concrete-bon';
import { ConcreteCustomer } from 'src/app/classes/concrete-customer';
import { Truck } from 'src/app/classes/truck';
import { DoneDialogComponent } from 'src/app/dialogs/done-dialog/done-dialog.component';
import { ConcreteService } from 'src/app/services/concrete.service';
import { GlobalVarsService } from 'src/app/services/global-vars.service';
import { MainService } from 'src/app/services/main.service';
import { StockService } from 'src/app/services/stock.service';
import { TruckService } from 'src/app/services/truck.service';
import { Location } from '@angular/common';
import { TruckOrder } from 'src/app/classes/truck-order';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-add-concrete-bon',
  templateUrl: './add-concrete-bon.component.html',
  styleUrls: ['./add-concrete-bon.component.scss'],
})
export class AddConcreteBonComponent implements OnInit {
  id!: string | null;

  concreteList: Concrete[] = [];
  customerList: ConcreteCustomer[] = [];
  truckList: Truck[] = [];

  customerInfo: ConcreteCustomer = new ConcreteCustomer();
  truckInfo: Truck = new Truck();

  concreteBon: ConcreteBon = new ConcreteBon();

  formValid = {
    mainForm: false,
    concrete: { concreteName: true, qty: true },
  };

  concreteUpdated: boolean = false;
  dateExpires: boolean = false;

  constructor(
    public _mainService: MainService,
    public _glopal: GlobalVarsService,
    public _router: Router,
    public activeRoute: ActivatedRoute,
    public _stockService: StockService,
    public _concrete: ConcreteService,
    public _truckService: TruckService,
    public _location: Location,
    public _auth: AuthService,
    public _dialog: MatDialog
  ) {
    this._glopal.loading = true;
    this._glopal.currentHeader = 'اضافة بون خرسانة';
  }

  ngOnInit(): void {
    this.onStart();
  }

  onStart() {
    this.id = this.activeRoute.snapshot.paramMap.get('id');

    if (this._glopal.loading == false) this._glopal.loading = true;

    Promise.all([
      this.getConcreats(),
      this.getConcreteCustomers(),
      this.getTruckList(),
    ]).then((data: any) => {
      const result = {
        concretes: data[0],
        customers: data[1],
        trucks: data[2],
      };

      this.concreteList = result.concretes;
      this.customerList = result.customers;
      this.truckList = result.trucks.filter(
        (truck: Truck) => truck.truckType == 'خلاطة'
      );

      this.startForm();
    });
  }

  startForm() {
    this.concreteBon = new ConcreteBon();
    this.truckInfo = new Truck();

    if (this.id) {
      this._concrete
        .concreteBonList(this.id)
        .subscribe((data: ConcreteBon[]) => {
          this.concreteBon = data[0];
          this._glopal.loading = false;

          this.truckInfo =
            this.truckList.find(
              (truck) => truck.id == this.concreteBon.truckId
            ) ?? new Truck();
        });
    } else {
      this.concreteBon.date = this._mainService.makeDate(new Date(Date.now()));
      this.concreteBon.time = this._mainService.makeTime(new Date(Date.now()));
      this.concreteBon.madeBy = this._auth.uName.realName;
      this._glopal.loading = false;
    }
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

  getTruckList(): Promise<Truck[]> {
    return new Promise((res) => {
      this._truckService.trucksList().subscribe((data: Truck[]) => res(data));
    });
  }

  customerNameChanged(concreteBonForm: NgForm) {
    const isCustomer = this.customerList.find(
      (customer) => customer.fullName === this.concreteBon.concreteCustomer_name
    );

    if (isCustomer) {
      this.customerInfo = isCustomer;
      this.concreteBon.concreteCustomer_id = this.customerInfo.id;
      concreteBonForm.form.controls['concreteCustomer_name'].setErrors(null);
    } else {
      this.customerInfo = new ConcreteCustomer();
      this.concreteBon.concreteCustomer_id = null;
      concreteBonForm.form.controls['concreteCustomer_name'].setErrors({
        incorrect: true,
      });
    }
  }

  truckNameChanged(concreteBonForm: NgForm) {
    const isTruck = this.truckList.find(
      (truck) => truck.name == this.concreteBon.truckName
    );

    if (isTruck) {
      this.truckInfo = isTruck;
      concreteBonForm.form.controls['truckName'].setErrors(null);
      this.concreteBon.truckId = isTruck.id;
    } else {
      this.truckInfo = new Truck();
      this.concreteBon.truckId = null;
      concreteBonForm.form.controls['truckName'].setErrors({
        incorrect: true,
      });
    }
  }

  concreteNameChanged(concreteBonForm: NgForm) {
    const concreteInfo = this.concreteList.find(
      (concrete) => concrete.name === this.concreteBon.concreteName
    ); //new Concrete();

    if (concreteInfo) {
      this.concreteBon.concreteId = concreteInfo.id;

      this.formValid.concrete.concreteName = true;

      concreteBonForm.form.controls['concreteName'].setErrors(null);
    } else {
      this.concreteBon.concreteId = null;

      this.formValid.concrete.concreteName = false;

      concreteBonForm.form.controls['concreteName'].setErrors({
        incorrect: true,
      });
    }
  }

  openDialog = () => {
    let dialogRef = this._dialog.open(DoneDialogComponent, {
      data: {
        header: `تم ${this.id ? 'تعديل' : 'اضافة'} بيانات بون الخرسانة`,
        info: `العميل | ${this.concreteBon.concreteCustomer_name}`,
        discription: [
          `نوع الخرسانة | ${this.concreteBon.concreteName}`,
          `الكمية | ${this.concreteBon.concreteQty}`,
          `المضخة | ${this.concreteBon.pump}`,
        ],
        btns: {
          addNew: 'اضافة بيانات جديدة',
          goHome: 'بونات الخرسانة',
        },
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result == 'addNew') {
        if (this.id) this._router.navigate(['/AddConcreteBon']);
        else this.onStart();
      } else if (result == 'back') {
        this._location.back();
      } else {
        this._router.navigate(['/ConcreteBonList']);
      }
    });
  };

  recordTruckOrder() {
    let truckOrder: TruckOrder = {
      orderId: null,
      truckId: this.truckInfo.id,
      truckName: '',
      truckCapacity: this.truckInfo.capacity,
      truckModel: '',
      orderType: this.truckInfo.owner,
      truckType: this.truckInfo.truckType,
      loadingType: 'متر',
      truckCustomerId: '1',
      truckCustomerName: '',
      LoadTimes: this.concreteBon.concreteQty,
      totalQty: 0,
      price: 5.5,
      totalVal: 0,
      date_time: `${this.concreteBon.date}T${this.concreteBon.time}`,
      notes: `بون خرسانة رقم (${this.concreteBon.bonManualNum})`,
      stockTransactionDetailsId: '1',
      stockTransactionId: '1',
      madeBy: this.concreteBon.madeBy,
    };

    /* if (this.id) {
      truckOrder.orderId = this.id;
      this._truckService.updateTruckOrder(truckOrder, 'id').subscribe();
    } else */ this._truckService.postTruckOrder(truckOrder).subscribe();
  }

  recordConcreteBon() {
    if (this.id) {
      this._concrete.updateConcreteBon(this.concreteBon).subscribe(() => {
        this.openDialog();
      });
      this.recordTruckOrder();
    } else
      this._concrete.postConcreteBon(this.concreteBon).subscribe(() => {
        this.openDialog();
        this.recordTruckOrder();
      });
  }

  onSubmit(concreteReceiptForm: NgForm) {
    if (concreteReceiptForm.valid) this.recordConcreteBon();
  }
}
