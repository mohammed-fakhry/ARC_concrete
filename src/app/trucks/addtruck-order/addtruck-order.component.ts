import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Truck } from 'src/app/classes/truck';
import { TruckCustomer } from 'src/app/classes/truck-customer';
import { TruckOrder } from 'src/app/classes/truck-order';
import { DoneDialogComponent } from 'src/app/dialogs/done-dialog/done-dialog.component';
import { AuthService } from 'src/app/services/auth.service';
import { GlobalVarsService } from 'src/app/services/global-vars.service';
import { MainService } from 'src/app/services/main.service';
import { TruckService } from 'src/app/services/truck.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-addtruck-order',
  templateUrl: './addtruck-order.component.html',
  styleUrls: ['./addtruck-order.component.scss'],
})
export class AddtruckOrderComponent implements OnInit {
  truckOrder: TruckOrder = new TruckOrder();
  orderCondition: string = 'اذن جديد';
  truckList: Truck[] = [];
  truckInfo: Truck = new Truck();
  truckCustomerList: TruckCustomer[] = [];

  id: string | null = null;
  dateExpires: boolean = false;

  totalMeters: number = 0;

  constructor(
    public _truckService: TruckService,
    public activeRoute: ActivatedRoute,
    public _router: Router,
    public _glopal: GlobalVarsService,
    public _mainService: MainService,
    public _dialog: MatDialog,
    public _snackBar: MatSnackBar,
    public _location: Location,
    public _auth: AuthService
  ) {
    this._glopal.currentHeader = 'ذن تشوين جديد';
    this._glopal.loading = true;
  }

  ngOnInit(): void {
    this.onStart();
  }

  onStart() {
    this.id = this.activeRoute.snapshot.paramMap.get('id');

    if (this._glopal.loading == false) this._glopal.loading = true;

    this.truckList = [];

    Promise.all([this.getTruckList(), this.gettruckCustomerList()]).then(
      (data: any) => {
        const result = {
          trucks: data[0],
          truckCustomers: data[1],
        };

        this.truckList = result.trucks;
        this.truckCustomerList = result.truckCustomers;

        if (this.id) {
          this.getTruckOrder().then((data: TruckOrder[]) => {
            this.truckOrder = data[0];

            this.dateExpires = this._mainService.dateExpired(
              this.truckOrder.date_time
            );

            this.loadingTypeChanged();
            this.calcTotal();

            this._glopal.loading = false;
          });
        } else {
          this.truckOrder = new TruckOrder();
          this.truckOrder.date_time = this._mainService.makeTime_date(
            new Date(Date.now())
          );

          this.dateExpires = false;
          this.truckOrder.madeBy = this._auth.uName.realName;

          this._glopal.loading = false;
        }
      }
    );
  }

  getTruckOrder(): Promise<TruckOrder[]> {
    return new Promise((res) => {
      if (this.id)
        this._truckService
          .truckOrderList('id', this.id)
          .subscribe((data: TruckOrder[]) => {
            res(data);
          });
    });
  }

  getTruckList(): Promise<Truck[]> {
    return new Promise((res) => {
      this._truckService.trucksList().subscribe((data: Truck[]) => res(data));
    });
  }

  gettruckCustomerList(): Promise<TruckCustomer[]> {
    return new Promise((res) => {
      this._truckService
        .truckCustomersList()
        .subscribe((data: TruckCustomer[]) => res(data));
    });
  }

  truckNameChanged(truckOrderForm: NgForm) {
    const isTruck = this.truckList.find(
      (truck: Truck) => truck.name == this.truckOrder.truckName
    );

    if (isTruck) {
      this.truckInfo = isTruck;
      truckOrderForm.form.controls['truckName'].setErrors(null);
      this.truckOrder.truckId = this.truckInfo.id;
      this.truckOrder.truckCapacity = this.truckInfo.capacity;
      this.truckOrder.orderType = this.truckInfo.owner;

      this.truckOrder.loadingType =
        this.truckInfo.truckType == 'سيارة' ? 'متر' : 'ساعة';
      // if (this.truckInfo.truckType == "سيارة")
    } else {
      truckOrderForm.form.controls['truckName'].setErrors({
        incorrect: true,
      });

      this.truckInfo = new Truck();

      this.truckOrder.truckId = '';
      this.truckOrder.truckCapacity = 0;
      this.truckOrder.orderType = '';
    }

    this.calcTotal();
  }

  calcTotal() {
    this.truckOrder.totalVal =
      this.truckOrder.LoadTimes *
      this.truckOrder.price *
      (this.truckOrder.truckCapacity ? this.truckOrder.truckCapacity : 0);

    this.totalMeters =
      this.truckOrder.LoadTimes *
      (this.truckOrder.truckCapacity ? this.truckOrder.truckCapacity : 0);
  }

  truckCustomerNameChanged(truckOrderForm: NgForm) {
    const customerInfo = this.truckCustomerList.find(
      (cust) => cust.fullName == this.truckOrder.truckCustomerName
    );

    if (customerInfo) {
      this.truckOrder.truckCustomerId = customerInfo.id ?? '';
      truckOrderForm.form.controls['truckCustomerName'].setErrors(null);
    } else {
      truckOrderForm.form.controls['truckCustomerName'].setErrors({
        incorrect: true,
      });

      this.truckOrder.truckCustomerId = '';
    }
  }

  loadingTypeChanged() {
    if (this.truckOrder.loadingType != 'متر') {
      this.truckOrder.truckCapacity = 1;
    }
    //console.log(this.truckOrder.loadingType);
  }

  recordTruckOrder() {
    if (this.id) {
      this._truckService.updateTruckOrder(this.truckOrder, 'id').subscribe();
    } else {
      this._truckService.postTruckOrder(this.truckOrder).subscribe();
    }

    this.openDialog();
  }

  openDialog = () => {
    let dialogRef = this._dialog.open(DoneDialogComponent, {
      data: {
        header: `تم ${this.id ? 'تعديل' : 'تسجيل'} بيانات الاذن`,
        info: this.truckInfo.name,
        discription: [
          `اسم العميل | ${this.truckOrder.truckCustomerName}`,
          `اجمالى | ${this.truckOrder.totalVal}`,
          `ملاحظات | ${this.truckOrder.notes}`,
        ],
        btns: {
          addNew: 'اضافة بيانات جديدة',
          goHome: 'عملاء المعدات',
        },
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result == 'addNew') {
        if (this.id) this._router.navigate(['/AddTruckorder']);
        else this.onStart();
      } else if (result == 'back') {
        this._location.back();
      } else {
        this._router.navigate(['/TruckCustomerList']);
      }
    });
  };

  onSubmit(truckOrderForm: NgForm) {
    if (truckOrderForm.valid) {
      this.recordTruckOrder();
    }
  }
}
