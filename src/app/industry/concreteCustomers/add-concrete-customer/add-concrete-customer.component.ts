import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { ConcreteCustomer } from 'src/app/classes/concrete-customer';
import { Customer } from 'src/app/classes/customer';
import { DoneDialogComponent } from 'src/app/dialogs/done-dialog/done-dialog.component';
import { AuthService } from 'src/app/services/auth.service';
import { ConcreteService } from 'src/app/services/concrete.service';
import { CustomerService } from 'src/app/services/customer.service';
import { GlobalVarsService } from 'src/app/services/global-vars.service';
import { MainService } from 'src/app/services/main.service';

@Component({
  selector: 'app-add-concrete-customer',
  templateUrl: './add-concrete-customer.component.html',
  styleUrls: ['./add-concrete-customer.component.scss'],
})
export class AddConcreteCustomerComponent implements OnInit {
  id: string | null = null;
  customerList: ConcreteCustomer[] = [];
  customer: ConcreteCustomer = new ConcreteCustomer();

  cementCustomers: Customer[] = [];

  oldCustomerName: string = '';

  inputValid = {
    customerName: { cond: true, msg: '' },
  };

  formValid: boolean = true;

  constructor(
    public activeRoute: ActivatedRoute,
    public _router: Router,
    public _glopal: GlobalVarsService,
    public _mainService: MainService,
    public _dialog: MatDialog,
    public _concrete: ConcreteService,
    public _snackBar: MatSnackBar,
    public _customerService: CustomerService,
    public _auth: AuthService
  ) {
    this._glopal.currentHeader = 'اضافة عميل خرسانة';
    this._glopal.loading = true;
  }

  ngOnInit(): void {
    this.onStart();
  }

  onStart() {
    this.id = this.activeRoute.snapshot.paramMap.get('id');
    Promise.all([this.getCustomers(), this.getCementCustomers()]).then(
      (data: any) => {
        const result = {
          customerList: data[0],
          cementCustomers: data[1],
        };
        this.customerList = result.customerList;
        this.cementCustomers = result.cementCustomers;

        /* this.customer = this.id
        ? this.customerForUpdate(data)
        : new ConcreteCustomer(); */

        if (this.id) {
          this.getCustomers(this.id).then((data: ConcreteCustomer[]) => {
            this.customer = data[0];
            this.oldCustomerName = this.customer.fullName;
          });
        } else {
          this.customer = new ConcreteCustomer();
          this.oldCustomerName = '';
        }

        this._glopal.loading = false;
      }
    );
  }

  /* customerForUpdate(data: ConcreteCustomer[]): ConcreteCustomer {
    return (
      data.find((customer) => customer.id == this.id) ?? new ConcreteCustomer()
    );
  } */

  getCustomers(id?: string): Promise<ConcreteCustomer[]> {
    return new Promise((res) => {
      this._concrete
        .concreteCustomerList(id)
        .subscribe((data: ConcreteCustomer[]) => res(data));
    });
  }

  getCementCustomers() {
    return new Promise((res) => {
      this._customerService.getCustomer().subscribe((data: Customer[]) => {
        res(data);
      });
    });
  }

  isCustomerRecorded(addCustomerForm: NgForm): boolean {
    //let isRecorded;

    if (this.id) {
      if (this.customer.fullName == this.oldCustomerName) return false;
    }

    let isRecorded = this.customerList.some(
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
      this._mainService.playshortFail()
    } else {
      addCustomerForm.form.controls['fullName'].setErrors(null);
    }

    return isRecorded;
  }

  cementCustomerChanged(addCustomerForm: NgForm) {
    if (this.customer.cementCustomerName == '') {
      addCustomerForm.form.controls['cementCustomerName'].setErrors(null);
      this.customer.cementCustomerId = '';
    } else {
      let isRecorded = this.cementCustomers.find(
        (customer) => customer.customerName == this.customer.cementCustomerName
      );

      if (isRecorded) {
        addCustomerForm.form.controls['cementCustomerName'].setErrors(null);
        this.customer.cementCustomerId = isRecorded.customerId.toString();
      } else {
        if (this.customer.cementCustomerName == '') {
          addCustomerForm.form.controls['cementCustomerName'].setErrors(null);
          this.customer.cementCustomerId = '1';
        } else {
          addCustomerForm.form.controls['cementCustomerName'].setErrors({
            incorrect: true,
          });
          this._mainService.playshortFail()
          this.customer.cementCustomerId = '';
        }
      }
    }
  }

  openDialog = () => {
    let dialogRef = this._dialog.open(DoneDialogComponent, {
      data: {
        header: `تم ${this.id ? 'تعديل' : 'اضافة'} بيانات العميل`,
        info: this.customer.fullName,
        discription: [],
        btns: {
          addNew: 'اضافة بيانات جديدة',
          goHome: 'عملاء خرسانة',
        },
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result == 'addNew') {
        if (this.id) this._router.navigate(['/AddConcreteCustomer']);
        else this.onStart();
      } else {
        this._router.navigate(['/ConcreteCustomerList']);
      }
    });
  };

  recordCustomer() {
    if (this.id) {
      this._concrete.updateConcreteCustomer(this.customer).subscribe();
    } else {
      this._concrete.postConcreteCustomer(this.customer).subscribe();
    }

    this.openDialog();
  }

  onSubmit(addCustomerForm: NgForm) {
    if (!this.isCustomerRecorded(addCustomerForm)) {
      this.recordCustomer();
    }
  }
}
