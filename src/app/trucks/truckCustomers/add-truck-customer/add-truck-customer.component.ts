import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { MainCustomer } from 'src/app/classes/main-customer';
import { TruckCustomer } from 'src/app/classes/truck-customer';
import { DoneDialogComponent } from 'src/app/dialogs/done-dialog/done-dialog.component';
import { AuthService } from 'src/app/services/auth.service';
import { GlobalVarsService } from 'src/app/services/global-vars.service';
import { MainService } from 'src/app/services/main.service';
import { TruckService } from 'src/app/services/truck.service';

@Component({
  selector: 'app-add-truck-customer',
  templateUrl: './add-truck-customer.component.html',
  styleUrls: ['./add-truck-customer.component.scss'],
})
export class AddTruckCustomerComponent implements OnInit {
  id: string | null = null;
  customerList: TruckCustomer[] = [];
  customer: TruckCustomer = new TruckCustomer();
  oldCustomerName: string = '';
  mainCustomers: MainCustomer[] = [];

  inputValid = {
    customerName: { cond: true, msg: '' },
  };

  formValid: boolean = true;

  constructor(
    public activeRoute: ActivatedRoute,
    public _router: Router,
    public _truckService: TruckService,
    public _glopal: GlobalVarsService,
    public _mainService: MainService,
    public _dialog: MatDialog,
    public _snackBar: MatSnackBar,
    public _auth: AuthService
  ) {
    this._glopal.currentHeader = 'بيانات عميل مُعدات';
  }

  ngOnInit(): void {
    this.onStart();
  }

  onStart() {
    this.id = this.activeRoute.snapshot.paramMap.get('id');
    Promise.all([this.getCustomers(), this.getMainCustomers()]).then(
      (data: any) => {
        const result = {
          customers: data[0],
          mainCustomers: data[1],
        };
        this.customerList = result.customers;
        this.mainCustomers = result.mainCustomers;
        /* this.customer = this.id
        ? this.customerForUpdate(data)
        : new ConcreteCustomer(); */

        if (this.id) {
          this.getCustomers(this.id).then((cust_data: TruckCustomer[]) => {
            this.customer = cust_data[0];
            this.oldCustomerName = this.customer.fullName;
          });
        } else {
          this.customer = new TruckCustomer();
          this.oldCustomerName = '';
        }

        this._glopal.loading = false;
      }
    );
  }

  getCustomers(id?: string): Promise<TruckCustomer[]> {
    return new Promise((res) => {
      this._truckService
        .truckCustomersList(id)
        .subscribe((data: TruckCustomer[]) => res(data));
    });
  }

  getMainCustomers() {
    return new Promise((res) => {
      this._mainService
        .mainCustomersList()
        .subscribe((data: any[]) => res(data));
    });
  }

  mainCustomerChanged(addCustomerForm: NgForm) {
    if (this.customer.mainCustomerName) {
      const mainCustomer = this.mainCustomers.find(
        (customer: MainCustomer) =>
          customer.fullName == this.customer.mainCustomerName
      );

      if (mainCustomer) {
        this.customer.mainCustomerId = mainCustomer.id;
        addCustomerForm.form.controls['mainCustomerName'].setErrors(null);
        /* addCustomerForm.form.controls['truckCustomerName'].setErrors({
          incorrect: true,
        }); */
      } else {
        this.customer.mainCustomerId = null;
        addCustomerForm.form.controls['mainCustomerName'].setErrors({
          incorrect: true,
        });

        this._mainService.playshortFail();
      }
    } else {
      this.customer.mainCustomerId = null;
      addCustomerForm.form.controls['mainCustomerName'].setErrors(null);
    }
  }

  isCustomerRecorded(addCustomerForm: NgForm): boolean {
    let isRecorded;

    if (this.id) {
      if (this.customer.fullName == this.oldCustomerName) return false;
    }

    isRecorded = this.customerList.some(
      (customer) => customer.fullName == this.customer.fullName
    );

    this.formValid = !isRecorded;
    this.inputValid.customerName = {
      cond: !isRecorded,
      msg: 'العميل مسجل بالفعل',
    };

    if (isRecorded) {
      addCustomerForm.form.controls['fullName'].setErrors({
        incorrect: true,
      });
      this._mainService.playshortFail();
    } else {
      addCustomerForm.form.controls['fullName'].setErrors(null);
    }

    return isRecorded;
  }

  openDialog = () => {
    let dialogRef = this._dialog.open(DoneDialogComponent, {
      data: {
        header: `تم ${this.id ? 'تعديل' : 'اضافة'} بيانات العميل`,
        info: this.customer.fullName,
        discription: [],
        btns: {
          addNew: 'اضافة بيانات جديدة',
          goHome: 'عملاء معدات',
        },
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result == 'addNew') {
        if (this.id) this._router.navigate(['/AddTruckCustomer']);
        else this.onStart();
      } else {
        this._router.navigate(['/TruckCustomerList']);
      }
    });
  };

  recordCustomer() {
    if (this.id) {
      this._truckService.updateTruckCustomer(this.customer).subscribe();
    } else {
      this._truckService.postTruckCustomer(this.customer).subscribe();
    }

    this.openDialog();
  }

  onSubmit(addCustomerForm: NgForm) {
    if (!this.isCustomerRecorded(addCustomerForm)) {
      this.recordCustomer();
    }
  }
}
