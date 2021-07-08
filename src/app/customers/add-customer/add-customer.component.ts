import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Customer } from 'src/app/classes/customer';
import { DoneDialogComponent } from 'src/app/dialogs/done-dialog/done-dialog.component';
import { AuthService } from 'src/app/services/auth.service';
import { CustomerService } from 'src/app/services/customer.service';
import { GlobalVarsService } from 'src/app/services/global-vars.service';
import { MainService } from 'src/app/services/main.service';

@Component({
  selector: 'app-add-customer',
  templateUrl: './add-customer.component.html',
  styleUrls: ['./add-customer.component.scss'],
})
export class AddCustomerComponent implements OnInit {
  id: string | null = null;
  customer: Customer = new Customer();
  customersList: Customer[] = [];

  inputValid = {
    customerName: { cond: true, msg: '' },
  };

  submitBtn = {
    val: 'تسجيل',
  };

  formValid: boolean = true;

  constructor(
    public activeRoute: ActivatedRoute,
    public _router: Router,
    public _glopal: GlobalVarsService,
    public _mainService: MainService,
    public _dialog: MatDialog,
    public _customerService: CustomerService,
    public _snackBar: MatSnackBar,
    public _auth: AuthService,
  ) {
    this._glopal.currentHeader = 'اضافة بيانات مورد | مستهلك';
    this._glopal.loading = true;
  }

  ngOnInit(): void {
    this.id = this.activeRoute.snapshot.paramMap.get('id');
    this.customer = new Customer();

    this.getCustomers().then((data: any) => {
      this.customersList = data;
      if (this.id) {
        this.getCustomer().then((data: any) => {
          this.customer = data[0];
        });
        this.submitBtn.val = 'تعديل';
      }
      this._glopal.loading = false;
    });
  }

  getCustomers() {
    return new Promise((res) => {
      this._customerService.getCustomer().subscribe((data: Customer[]) => {
        res(data);
      });
    });
  }

  getCustomer() {
    return new Promise((res) => {
      if (this.id)
        this._customerService
          .getCustomer(this.id)
          .subscribe((data: Customer[]) => {
            res(data);
          });
    });
  }

  isCustomerRecorded(input: string) {
    return this.customersList.find(
      (customer) => customer.customerName === input
    );
  }

  clearInputs() {
    this.customer = new Customer();
    this.formValid = true;
    this.inputValid.customerName.msg = '';
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
          addNew: "اضافة بيانات جديدة",
          goHome: "موردين | مستهلكين"
        }
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result == 'addNew') {
        if (this.id) this._router.navigate(['/addCustomer']);
        else this.clearInputs();
      } else {
        this._router.navigate(['/CustomerList']);
      }
    });
  };

  recordCustomer() {
    if (this.id) {
      if (this._glopal.check.edi) {
        this._customerService.updateCustomer(this.customer).subscribe();
      } else {
        this._snackBar.open('لا توجد صلاحية للتعديل', 'اخفاء', {
          duration: 2500,
        });
      }
    } else {
      this._customerService.creatCustomer(this.customer).subscribe();
      this.customersList.push(this.customer);
    }

    if (this._glopal.check.edi) {
      this.openDialog({
        header: 'تم اضافة بيانات العميل',
        info: `باسم | ${this.customer.customerName}`,
        discription: [''],
      });
    }
  }

  onSubmit(addCustomerForm: NgForm) {
    // check duplicated if new client
    if (!this.id) {
      if (this.isCustomerRecorded(addCustomerForm.form.value.customerName)) {
        this.inputValid.customerName = {
          cond: false,
          msg: 'هذا العميل مسجل بالفعل',
        };
        addCustomerForm.form.controls['customerName'].setErrors({
          incorrect: true,
        });
        this._mainService.playshortFail()
        this.formValid = false;
        return;
      }
    }

    // check if form Valid
    if (!addCustomerForm.valid) {
      this.formValid = false;
      return;
    }

    // record the client data when form is valid
    this.recordCustomer();
  }
}
