import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Customer } from 'src/app/classes/customer';
import { OtherAcc } from 'src/app/classes/other-acc';
import { Truck } from 'src/app/classes/truck';
import { DoneDialogComponent } from 'src/app/dialogs/done-dialog/done-dialog.component';
import { AuthService } from 'src/app/services/auth.service';
import { CustomerService } from 'src/app/services/customer.service';
import { GlobalVarsService } from 'src/app/services/global-vars.service';
import { MainService } from 'src/app/services/main.service';
import { SafeService } from 'src/app/services/safe.service';
import { TruckService } from 'src/app/services/truck.service';

@Component({
  selector: 'app-add-truck',
  templateUrl: './add-truck.component.html',
  styleUrls: ['./add-truck.component.scss'],
})
export class AddTruckComponent implements OnInit {
  /*
  name: string = '';
  number: string = '';
  capacity: number = 0;
  model: string = '';
  */

  id: string | null = null;

  truck: Truck = new Truck();

  truckList: Truck[] = [];

  customerList: Customer[] = [];

  inputValid: {
    name: { cond: boolean; msg: string };
    number: { cond: boolean; msg: string };
    customerName: { cond: boolean; msg: string };
  } = {
    name: {
      cond: true,
      msg: '',
    },
    number: {
      cond: true,
      msg: '',
    },
    customerName: {
      cond: true,
      msg: '',
    },
  };

  formValid: boolean = true;

  submitBtn: string = 'تسجيل';

  otherAccList: OtherAcc[] = [];

  constructor(
    public _truckService: TruckService,
    public activeRoute: ActivatedRoute,
    public _router: Router,
    public _glopal: GlobalVarsService,
    public _mainService: MainService,
    public _dialog: MatDialog,
    public _snackBar: MatSnackBar,
    public _customerService: CustomerService,
    public _safeService: SafeService,
    public _auth: AuthService
  ) {
    this._glopal.currentHeader = 'اضافة بيانات سيارة';
    this._glopal.loading = true;
  }

  ngOnInit(): void {
    // this._glopal.loading = true;
    this.onStart();
  }

  onStart() {
    this.id = this.activeRoute.snapshot.paramMap.get('id');

    if (!this._glopal.loading) this._glopal.loading = true;

    this.truck = new Truck();

    Promise.all([this.getTruckList(), this.getCustomers()]).then(
      (data: any) => {
        const result = {
          trucks: data[0],
          customers: data[1],
        };

        this.truckList = result.trucks;
        this.customerList = result.customers;

        if (this.id) {
          this.otherAccList = [];

          this.truck =
            this.truckList.find((truck: Truck) => this.id == truck.id) ??
            new Truck();
          this.submitBtn = 'تعديل';
          this._glopal.currentHeader = 'تعديل بيانات سيارة';
          // delete this truck from array if in edit
          this.truckList = data.filter((truck: Truck) => this.id != truck.id);

          this.getOtherAcc().then((data: OtherAcc[]) => {
            this.otherAccList = data;
            this._glopal.loading = false;
          });
        } else {
          this._glopal.currentHeader = 'اضافة بيانات سيارة';
          this.submitBtn = 'تسجيل';
          this._glopal.loading = false;
        }
      }
    );
  }

  getTruckList(): Promise<Truck[]> {
    return new Promise((res) => {
      this._truckService.trucksList().subscribe((data: Truck[]) => {
        res(data);
      });
    });
  }

  getOtherAcc(): Promise<OtherAcc[]> {
    return new Promise((res) => {
      this._safeService
        .getOtherAcc()
        .subscribe((data: OtherAcc[]) => res(data));
    });
  }

  getCustomers() {
    return new Promise((res) => {
      this._customerService.getCustomer().subscribe((data: Customer[]) => {
        res(data);
      });
    });
  }

  isNameRecorded(addTruckForm: NgForm): boolean {
    const isRecorded = this.truckList.some(
      (truck: Truck) => this.truck.name == truck.name
    );
    if (isRecorded) {
      this.inputValid.name = {
        cond: false,
        msg: 'هذا الاسم مسجل بالفعل',
      };
      addTruckForm.form.controls['name'].setErrors({
        incorrect: true,
      });
      this._mainService.playshortFail();
      return true;
    } else {
      addTruckForm.form.controls['name'].setErrors(null);
      this.inputValid.name = {
        cond: true,
        msg: '',
      };
      return false;
    }
  }

  truckOwnerChanged() {
    if (this.truck.owner == 'سيارة الشركة') {
      this.truck.customerId = '1';
      this.truck.customerName = '';
    }
  }

  customerNameChanged(addTruckForm: NgForm) {
    const customerInfo = this.customerList.find(
      (customer) => customer.customerName == this.truck.customerName
    );

    if (customerInfo) {
      this.truck.customerId = customerInfo.customerId.toString();

      addTruckForm.form.controls['customerName'].setErrors(null);

      this.inputValid.customerName.cond = true;
    } else {
      this.truck.customerId = '1';
      addTruckForm.form.controls['customerName'].setErrors(null);

      this.inputValid.customerName = {
        cond: false,
        msg: 'العميل غير مسجل بقاعدة البيانات',
      };
    }
  }

  truckTypeChanged() {
    if (this.truck.truckType != 'سيارة') {
      this.truck.capacity = 1;
    }
  }

  isNumberRecorded(addTruckForm: NgForm): boolean {
    const isRecorded = this.truckList.some(
      (truck: Truck) => this.truck.number == truck.number
    );
    if (isRecorded) {
      this.inputValid.number = {
        cond: false,
        msg: 'هذه اللوحة مسجلة بالفعل',
      };

      addTruckForm.form.controls['number'].setErrors({
        incorrect: true,
      });
      this._mainService.playshortFail();
      return true;
    } else {
      addTruckForm.form.controls['number'].setErrors(null);
      this.inputValid.number = {
        cond: true,
        msg: '',
      };
      return false;
    }
  }

  checkIfRecorded(addTruckForm: NgForm): boolean {
    const checkArr: boolean[] = [];
    if (this.isNameRecorded(addTruckForm)) {
      checkArr.push(false);
    } else {
      addTruckForm.form.controls['name'].setErrors(null);
    }

    if (this.isNumberRecorded(addTruckForm)) {
      checkArr.push(false);
    } else {
      addTruckForm.form.controls['number'].setErrors(null);
    }

    return checkArr.some((check) => check === false);
  }

  openDialog = () => {
    /* const truckTypes = [
      { routTo: '/TrucksList/cars', ar: 'سيارة', goHome: 'سيارات' },
      { routTo: '/TrucksList/loaders', ar: 'لودر', goHome: 'لودرات' },
      { routTo: '/TrucksList/harras', ar: 'هراس', goHome: 'هراسات' },
      { routTo: '/TrucksList/diggers', ar: 'حفار', goHome: 'حفارات' },
      { routTo: '/TrucksList/mixers', ar: 'خلاطة', goHome: 'خلاطات' },
    ];

    const routeTo =
      truckTypes.find((d: any) => d.ar == this.truck.truckType)?.routTo ??
      '/Home'; */

    let dialogRef = this._dialog.open(DoneDialogComponent, {
      data: {
        header: 'تم تسجيل بيانات السيارة',
        info: this.truck.name,
        discription: [
          `لوحات | ${this.truck.number}`,
          `الحمولة | ${this.truck.capacity}`,
          `الماركة | ${this.truck.model}`,
        ],
        btns: {
          addNew: 'اضافة بيانات جديدة',
          goHome: 'السيارات',
        },
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result == 'addNew') {
        if (this.id) this._router.navigate(['/AddTruck']);
        else this.onStart();
      } else {
        this._router.navigate(['/TrucksList']);
      }
    });
  };

  recordTruck() {
    this._glopal.loading = true;
    if (this.id) {
      this._truckService.updateTruck(this.truck).subscribe(
        () => {
          this._glopal.loading = false;
          this.openDialog();
          this.recordOtherAcc(this.truck.id);
        },
        (error) => {
          if (error.status == '201') {
            this._glopal.loading = false;
            this.openDialog();
            this.recordOtherAcc(this.truck.id);
          }
        }
      );
    } else {
      this._truckService.postTruck(this.truck).subscribe(
        (data: any) => {
          this._glopal.loading = false;
          this.openDialog();
          this.recordOtherAcc(data[0]);
        },
        (error) => {
          if (error.status == '201') {
            this._glopal.loading = false;
            this.openDialog();
          }
        }
      );
    }
  }

  recordOtherAcc(truckId: string) {
    if (this.truck.owner == 'سيارة الشركة') {
      let otherAcc: OtherAcc = new OtherAcc();
      /* otherAcc.AccName = this.truck.name;
      otherAcc.truckId = truckId; */

      if (this.id) {
        otherAcc =
          this.otherAccList.find((acc: OtherAcc) => acc.truckId == this.id) ??
          new OtherAcc();

        otherAcc.AccName = this.truck.name;

        this._safeService.updateOtherAcc(otherAcc).subscribe();
      } else {
        otherAcc.truckId = truckId;
        otherAcc.AccName = this.truck.name;

        this._safeService.creatOtherAcc(otherAcc).subscribe();
      }
    }
  }

  onSubmit(addTruckForm: NgForm) {
    if (this.checkIfRecorded(addTruckForm)) {
      this.formValid = false;
      this._mainService.playshortFail()
      return;
    } else {
      if (!addTruckForm.valid) {
        this.formValid = false;
        this._mainService.playshortFail()
        return;
      } else {
        this.formValid = true;
        this.recordTruck();
      }
    }
  }
}
