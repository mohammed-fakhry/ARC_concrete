import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Customer } from 'src/app/classes/customer';
import { OtherAcc } from 'src/app/classes/other-acc';
import { SafeData } from 'src/app/classes/safe-data';
import { SafeReceipt } from 'src/app/classes/safe-receipt';
import { CustomerService } from 'src/app/services/customer.service';
import { GlobalVarsService } from 'src/app/services/global-vars.service';
import { MainService } from 'src/app/services/main.service';
import { SafeService } from 'src/app/services/safe.service';
import { Location } from '@angular/common';
import { NgForm } from '@angular/forms';
import { DoneDialogComponent } from 'src/app/dialogs/done-dialog/done-dialog.component';
import { DeleteDialogComponent } from 'src/app/dialogs/delete-dialog/delete-dialog.component';
import { ChangedReciepts } from 'src/app/classes/changed-reciepts';
import { AuthService } from 'src/app/services/auth.service';
import { ConcreteCustomer } from 'src/app/classes/concrete-customer';
import { ConcreteService } from 'src/app/services/concrete.service';
import { TruckService } from 'src/app/services/truck.service';
import { TruckCustomer } from 'src/app/classes/truck-customer';
import { Truck } from 'src/app/classes/truck';

@Component({
  selector: 'app-add-safe-receipt',
  templateUrl: './add-safe-receipt.component.html',
  styleUrls: ['./add-safe-receipt.component.scss'],
})
export class AddSafeReceiptComponent implements OnInit {
  id: string | null = null;
  safeList: SafeData[] = [];
  customerList: Customer[] = [];
  filteredCustomer: Customer[] = [];

  mainCustomerList: Customer[] = [];
  accList: OtherAcc[] = [];
  concreteCustomerList: ConcreteCustomer[] = [];
  truckCustomerList: TruckCustomer[] = [];
  truckList: Truck[] = [];

  safeReciept: SafeReceipt = new SafeReceipt();
  otherRecieptVals: { note: string; val: number }[] = [];
  submitBtn: string = '';
  recieptCondition: string = 'ايصال جديد';
  receiptKindDom = document.querySelector('#receiptKind') as HTMLElement;
  /* defultVals: { safeName: any; safeId: any; currentSafeVal: any; }; */

  inputValid = {
    customerName: { cond: true, msg: '', class: 'secondaryBadge' },
    concreteCustomerName: { cond: true, msg: '', class: 'secondaryBadge' },
    truckCustomerName: { cond: true, msg: '', class: 'secondaryBadge' },
    AccName: { cond: true, msg: '', class: 'secondaryBadge' },
    truckName: { cond: true, msg: '', class: 'secondaryBadge' },
    receiptVal: { cond: true, msg: '' },
  };
  date_timeDom!: HTMLElement;
  oldReciept: ChangedReciepts = new ChangedReciepts();

  valsRemain: {
    safeRemain: number;
    //otherValDetail: string;
    otherValRemain: number;
  } = {
    safeRemain: 0,
    //otherValDetail: '',
    otherValRemain: 0,
  };
  dateExpires: boolean = false;

  constructor(
    public activeRoute: ActivatedRoute,
    public _router: Router,
    public _glopal: GlobalVarsService,
    public _mainService: MainService,
    public _dialog: MatDialog,
    public _safeService: SafeService,
    public _customerService: CustomerService,
    public _location: Location,
    public _auth: AuthService,
    public _concrete: ConcreteService,
    public _snackBar: MatSnackBar,
    public _truckService: TruckService
  ) {
    this._glopal.loading = true;
  }

  ngOnInit(): void {
    //this.date_timeDom = document.querySelector('#date_time') as HTMLElement;
    this.receiptKindDom = document.querySelector('#receiptKind') as HTMLElement;
    this.date_timeDom = document.querySelector('#date_time') as HTMLElement;

    this.onStart();

    this._router.events.subscribe((val) => {
      if (
        val instanceof NavigationEnd &&
        this._router.url.includes('SafeReceipt')
      ) {
        this.onStart();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key == 'F8') {
        this.safeReciept.receiptKind =
          this.safeReciept.receiptKind == 'ايصال استلام نقدية'
            ? 'ايصال صرف نقدية'
            : 'ايصال استلام نقدية';
        this.date_timeDom.focus();
        //this.receiptKindChanged()
      }
    });
  }

  onStart() {
    // defult recieptVals
    //this.date_timeDom = document.querySelector('#date_time') as HTMLElement;
    this.oldReciept = new ChangedReciepts();
    this.safeReciept = new SafeReceipt();
    this.safeReciept.date_time = this._mainService.makeTime_date(
      new Date(Date.now())
    );
    this.safeReciept.receiptKind = 'ايصال استلام نقدية';
    this.safeReciept.transactionAccKind = 'عميل';
    this.submitBtn = 'تسجيل';
    this.otherRecieptVals = [];
    this.concreteCustomerList = [];
    this.truckList = [];

    this.makeOtherVal_null('عميل');

    this._glopal.loading = true;
    // get data from DB
    Promise.all([
      this.getSafes(),
      this.getCustomers(),
      this.getAccList(),
      this.getConcreteCustomers(),
      this.getTruckCustomers(),
      this.getTruckList(),
    ]).then((data: any[]) => {
      const result = {
        safes: data[0],
        customers: data[1],
        acc: data[2],
        concreteCustomers: data[3],
        truckCustomers: data[4],
        trucks: data[5],
      };

      this.mainCustomerList = result.customers;
      this.concreteCustomerList = result.concreteCustomers;
      this.truckCustomerList = result.truckCustomers.filter(
        (cust: any) => cust.fullName != 'نقلات من المخزن'
      );

      this.accList = result.acc;
      this.safeList = result.safes;
      this.truckList = result.trucks.filter((truck: Truck) => truck.owner == 'سيارة الشركة');

      this.safeReciept.safeName = this.safeList[0].safeName;
      this.safeReciept.safeId = this.safeList[0].safeId;
      this.safeReciept.currentSafeVal = this.safeList[0].currentSafeVal;
      this.setSafeRemain();

      this.id = this.activeRoute.snapshot.paramMap.get('id');

      this.recieptCondition = this.id ? `ايصال رقم (${this.id})` : 'ايصال جديد';

      this._glopal.currentHeader = this.id
        ? 'تعديل ايصال (استلام | صرف) نقدية'
        : 'ايصال (استلام | صرف) نقدية';

      if (this.id) {
        this._safeService
          .getSafesReceipt(this.id)
          .subscribe((data: SafeReceipt[]) => {
            if (data.length > 0) {
              this.safeReciept = data[0];
              this.safeReciept.safeName = data[0].safeName;
              this.safeChanged('first');
              this.inputValid.customerName.class =
                this.safeReciept.currentCustomerVal < 0
                  ? 'dangerBadge'
                  : 'secondaryBadge';
              this.inputValid.AccName.class =
                this.safeReciept.currentAccVal < 0
                  ? 'dangerBadge'
                  : 'secondaryBadge';

              this.dateExpires = this._mainService.dateExpired(
                this.safeReciept.date_time
              );
              // fill to check changes after Safe
              this.oldReciept = this.fillOldData(data[0]);
              //console.log({ oldData: this.oldReciept, data: data[0] });
            }
          });
        this.submitBtn = 'تعديل';
      }

      if (!this.id) {
        this.setDefultvals('new');
      }
      this.receiptKindDom.focus();
      this._glopal.loading = false;
    });
  }

  fillOldData = (
    oldSafeReciept: SafeReceipt,
    cond?: string
  ): ChangedReciepts => {
    const oldSafe = this.safeList.find(
      (safe) => safe.safeId === oldSafeReciept.safeId
    );

    const userInfo = this._auth.uName;

    let accOrCustomer: string = '';

    if (this.safeReciept.AccName) accOrCustomer = this.safeReciept.AccName;
    if (this.safeReciept.customerName)
      accOrCustomer = this.safeReciept.customerName;
    if (this.safeReciept.concreteCustomerName)
      accOrCustomer = this.safeReciept.concreteCustomerName;

    return {
      changedRecieptId: null,
      safeReceiptId: oldSafeReciept.safeReceiptId,
      receiptKind: '',
      oldReceiptKind: oldSafeReciept.receiptKind,
      safeName: cond ? this.safeReciept.safeName : '',
      oldSafeName: oldSafe?.safeName ?? '',
      transactionAccKind: cond ? this.safeReciept.transactionAccKind : '',
      oldTransactionAccKind: oldSafeReciept.transactionAccKind,
      oldAccOrCustomer: oldSafeReciept.AccName
        ? oldSafeReciept.AccName
        : oldSafeReciept.customerName,
      accOrCustomer: accOrCustomer,
      receiptVal: cond ? this.safeReciept.receiptVal : 0,
      oldReceiptVal: oldSafeReciept.receiptVal,
      recieptNote: cond
        ? oldSafeReciept.recieptNote
        : this.safeReciept.recieptNote,
      date_time: this._mainService
        .makeTime_date(new Date(Date.now()))
        .replace('T', ' '),
      userRealName: userInfo.realName,
      changedType: '',
      userPic: userInfo.userPic ?? 'defultpersonImg.jpg',
    };
  };

  isChanged = (
    safeReciept: SafeReceipt,
    oldReciept: ChangedReciepts
  ): boolean => {
    oldReciept.accOrCustomer = safeReciept.customerName
      ? safeReciept.customerName
      : safeReciept.AccName ?? '';
    if (
      safeReciept.receiptVal != oldReciept.oldReceiptVal ||
      safeReciept.receiptKind != oldReciept.oldReceiptKind ||
      safeReciept.transactionAccKind != oldReciept.oldTransactionAccKind ||
      oldReciept.oldAccOrCustomer != oldReciept.accOrCustomer
    ) {
      return true;
    } else {
      return false;
    }
  };

  setDefultvals(cond?: string) {
    this.safeReciept = new SafeReceipt();
    this.safeReciept.date_time = this._mainService.makeTime_date(
      new Date(Date.now())
    );
    this.safeReciept.receiptKind = 'ايصال استلام نقدية';
    this.safeReciept.transactionAccKind = 'عميل';
    this.submitBtn = 'تسجيل';

    this.safeReciept.safeName = this.safeList[0].safeName;
    this.safeReciept.safeId = this.safeList[0].safeId;
    this.safeReciept.currentSafeVal = this.safeList[0].currentSafeVal;
    this.safeReciept.madeBy = this._auth.uName.realName;
    this.otherRecieptVals = [];

    if (cond != 'new') {
      this._glopal.loading = true;

      Promise.all([this.getSafes(), this.getCustomers()]).then(
        (data: any[]) => {
          const result = {
            safes: data[0],
            customers: data[1],
            concreteCustomers: data[2],
          };

          this.safeList = result.safes;

          this.safeReciept.currentSafeVal = this.safeList[0].currentSafeVal;
          this.mainCustomerList = result.customers;
          // this.concreteCustomerList = result.concreteCustomers;

          this.safeChanged('first');
          this._glopal.loading = false;

          this.dateExpires = false;
        }
      );
    } else {
      /* to filter customers up to the safe name */
      this.safeChanged('first');
    }

    this.safeReciept.secSafeId = 1;
    this.safeReciept.customerId = 1;
  }

  getAccList() {
    return new Promise((res) => {
      this._safeService
        .getOtherAcc()
        .subscribe((data: OtherAcc[]) => res(data));
    });
  }

  getSafes() {
    return new Promise((res) => {
      this._safeService.getSafes().subscribe((data: SafeData[]) => res(data));
    });
  }

  getCustomers() {
    return new Promise((res) => {
      this._customerService
        .getCustomer()
        .subscribe((data: Customer[]) => res(data));
    });
  }

  getConcreteCustomers(): Promise<ConcreteCustomer[]> {
    return new Promise((res) => {
      this._concrete
        .concreteCustomerList()
        .subscribe((data: ConcreteCustomer[]) => res(data));
    });
  }

  getTruckCustomers(): Promise<TruckCustomer[]> {
    return new Promise((res) => {
      this._truckService
        .truckCustomersList()
        .subscribe((data: TruckCustomer[]) => {
          res(data);
        });
    });
  }

  getTruckList(): Promise<Truck[]> {
    return new Promise((res) => {
      this._truckService.trucksList().subscribe((data: Truck[]) => res(data));
    });
  }

  makeOtherVal_null(cond: string) {
    if (cond == 'عميل') {
      this.safeReciept.AccName = null;
      this.safeReciept.currentAccVal = 0;
      this.safeReciept.accId = null;

      this.safeReciept.concreteCustomerName = '';
      this.safeReciept.concreteCustomerVal = 0;
      this.safeReciept.concreteCustomer_id = '0';

      this.safeReciept.truckCustomerName = '';
      this.safeReciept.truckCustomerId = '0';
      this.safeReciept.truckCustomerVal = 0;

      this.safeReciept.truckName = '';
      this.safeReciept.truckCurrentVal = 0;
      this.safeReciept.truckId = '0';
    }

    if (cond == 'حساب') {
      this.safeReciept.customerId = 1;
      this.safeReciept.currentCustomerVal = 0;
      this.safeReciept.customerName = '';

      this.safeReciept.concreteCustomerName = '';
      this.safeReciept.concreteCustomerVal = 0;
      this.safeReciept.concreteCustomer_id = '0';

      this.safeReciept.truckCustomerName = '';
      this.safeReciept.truckCustomerId = '0';
      this.safeReciept.truckCustomerVal = 0;

      this.safeReciept.truckName = '';
      this.safeReciept.truckCurrentVal = 0;
      this.safeReciept.truckId = '0';
    }

    if (cond == 'عميل خرسانة') {
      this.safeReciept.customerId = 1;
      this.safeReciept.currentCustomerVal = 0;
      this.safeReciept.customerName = '';

      this.safeReciept.AccName = null;
      this.safeReciept.currentAccVal = 0;
      this.safeReciept.accId = null;

      this.safeReciept.truckCustomerName = '';
      this.safeReciept.truckCustomerId = '0';
      this.safeReciept.truckCustomerVal = 0;

      this.safeReciept.truckName = '';
      this.safeReciept.truckCurrentVal = 0;
      this.safeReciept.truckId = '0';
    }

    if (cond == 'عميل معدات') {
      this.safeReciept.customerId = 1;
      this.safeReciept.currentCustomerVal = 0;
      this.safeReciept.customerName = '';

      this.safeReciept.AccName = null;
      this.safeReciept.currentAccVal = 0;
      this.safeReciept.accId = null;

      this.safeReciept.concreteCustomerName = '';
      this.safeReciept.concreteCustomerVal = 0;
      this.safeReciept.concreteCustomer_id = '0';

      this.safeReciept.truckName = '';
      this.safeReciept.truckCurrentVal = 0;
      this.safeReciept.truckId = '0';
    }

    // دفعات للمعدة

    if (cond == 'دفعات للمعدة') {
      this.safeReciept.customerId = 1;
      this.safeReciept.currentCustomerVal = 0;
      this.safeReciept.customerName = '';

      this.safeReciept.AccName = null;
      this.safeReciept.currentAccVal = 0;
      this.safeReciept.accId = null;

      this.safeReciept.concreteCustomerName = '';
      this.safeReciept.concreteCustomerVal = 0;
      this.safeReciept.concreteCustomer_id = '0';

      this.safeReciept.truckCustomerName = '';
      this.safeReciept.truckCustomerId = '0';
      this.safeReciept.truckCustomerVal = 0;
    }
  }

  receiptKindChanged(addSafeReciept: NgForm) {
    this.setSafeRemain();
    this.receiptValChanged(addSafeReciept);
  }

  tranceAccChanged() {
    this.makeOtherVal_null(this.safeReciept.transactionAccKind);
  }

  toAcc(acc: OtherAcc) {
    this.safeReciept.transactionAccKind = 'حساب';
    this.safeReciept.AccName = acc.AccName;
    this.safeReciept.accId = acc.accId;
    this.safeReciept.currentAccVal = acc.currentAccVal;
    this.tranceAccChanged();
  }

  getSafeInfo = (safeName: string) =>
    this.safeList.find((safe) => safe.safeName == safeName);

  safeChanged(cond: string) {
    let safeInfo = this.getSafeInfo(this.safeReciept.safeName);
    this.customerList = this.mainCustomerList;
    if (safeInfo) {
      if (safeInfo.safeName.includes('حسام'))
        this.customerList = this.mainCustomerList.filter((customer) =>
          customer.customerName.includes('- حسام')
        );
      if (safeInfo.safeName.includes('سيف'))
        this.customerList = this.mainCustomerList.filter((customer) =>
          customer.customerName.includes('- سيف')
        );
      if (safeInfo.safeName.includes('نور فارس'))
        this.customerList = this.mainCustomerList.filter((customer) =>
          customer.customerName.includes('- نور فارس')
        );

      if (cond == 'first') {
        this.safeReciept.currentSafeVal = safeInfo.currentSafeVal;
        this.safeReciept.safeId = safeInfo.safeId;
      }
      this.setSafeRemain();
    }
  }

  setSafeRemain() {
    this.valsRemain.safeRemain =
      this.safeReciept.receiptKind === 'ايصال استلام نقدية'
        ? this.safeReciept.currentSafeVal + (this.safeReciept.receiptVal ?? 0)
        : this.safeReciept.currentSafeVal - (this.safeReciept.receiptVal ?? 0);

    if (this.safeReciept.transactionAccKind === 'حساب') {
      this.valsRemain.otherValRemain =
        this.safeReciept.receiptKind === 'ايصال استلام نقدية'
          ? (this.safeReciept.currentAccVal ?? 0) -
            (this.safeReciept.receiptVal ?? 0)
          : (this.safeReciept.currentAccVal ?? 0) +
            (this.safeReciept.receiptVal ?? 0);
    }

    if (this.safeReciept.transactionAccKind === 'عميل') {
      this.valsRemain.otherValRemain =
        this.safeReciept.receiptKind === 'ايصال استلام نقدية'
          ? (this.safeReciept.currentCustomerVal ?? 0) -
            (this.safeReciept.receiptVal ?? 0)
          : (this.safeReciept.currentCustomerVal ?? 0) +
            (this.safeReciept.receiptVal ?? 0);
    }

    if (this.safeReciept.transactionAccKind === 'عميل خرسانة') {
      this.valsRemain.otherValRemain =
        this.safeReciept.receiptKind === 'ايصال استلام نقدية'
          ? (this.safeReciept.concreteCustomerVal ?? 0) -
            (this.safeReciept.receiptVal ?? 0)
          : (this.safeReciept.concreteCustomerVal ?? 0) +
            (this.safeReciept.receiptVal ?? 0);
    }

    if (this.safeReciept.transactionAccKind === 'عميل معدات') {
      this.valsRemain.otherValRemain =
        this.safeReciept.receiptKind === 'ايصال استلام نقدية'
          ? (this.safeReciept.truckCustomerVal ?? 0) -
            (this.safeReciept.receiptVal ?? 0)
          : (this.safeReciept.truckCustomerVal ?? 0) +
            (this.safeReciept.receiptVal ?? 0);
    }

    if (this.safeReciept.transactionAccKind === 'دفعات للمعدة') {
      this.valsRemain.otherValRemain =
        this.safeReciept.receiptKind === 'ايصال استلام نقدية'
          ? (this.safeReciept.truckCurrentVal ?? 0) -
            (this.safeReciept.receiptVal ?? 0)
          : (this.safeReciept.truckCurrentVal ?? 0) +
            (this.safeReciept.receiptVal ?? 0);
    }
  }

  accNameChanged = (addSafeReciept: NgForm) => {
    let accName = this.safeReciept.AccName;
    let accInfo;
    if (accName) accInfo = this.findAcc_byName(accName);
    if (!accInfo) {
      this.inputValid.AccName = {
        cond: false,
        msg: 'الحساب غير مسجل بقاعدة البيانات',
        class: 'secondaryBadge',
      };
      addSafeReciept.form.controls['AccName'].setErrors({ incorrect: true });
      this.safeReciept.currentAccVal = 0;
      this.safeReciept.accId = null;
      this.valsRemain.otherValRemain = 0;
    } else {
      this.safeReciept.accId = accInfo.accId;
      this.inputValid.AccName.cond = true;
      this.inputValid.AccName.class =
        accInfo.currentAccVal >= 0 ? 'secondaryBadge' : 'dangerBadge';
      addSafeReciept.form.controls['AccName'].setErrors(null);
      this.safeReciept.currentAccVal = accInfo.currentAccVal;
      this.valsRemain.otherValRemain = accInfo.currentAccVal;
    }
  };

  truckNameChanged = (addSafeReciept: NgForm) => {
    let truckName = this.safeReciept.truckName;
    let truckInfo;
    if (truckName) truckInfo = this.findTruck_byName(truckName);
    if (!truckInfo) {
      this.inputValid.truckName = {
        cond: false,
        msg: 'المُعدة غير مسجلة بقاعدة البيانات',
        class: 'secondaryBadge',
      };
      addSafeReciept.form.controls['truckName'].setErrors({ incorrect: true });
      this.safeReciept.currentAccVal = 0;
      this.safeReciept.truckId = null;
      this.valsRemain.otherValRemain = 0;
    } else {
      this.safeReciept.truckId = truckInfo.id;
      this.inputValid.AccName.cond = true;
      /*
        this.inputValid.AccName.class =
        truckInfo. >= 0 ? 'secondaryBadge' : 'dangerBadge';
      */
      addSafeReciept.form.controls['truckName'].setErrors(null);
      // this.safeReciept.currentAccVal = accInfo.currentAccVal;
      // this.valsRemain.otherValRemain = accInfo.currentAccVal;
    }
  };

  receiptValChanged = (addSafeReciept: NgForm) => {
    this.setSafeRemain();
    if (this.safeReciept.receiptVal == 0) {
      this.inputValid.receiptVal = {
        cond: false,
        msg: 'يجب ادخال قيمة الايصال',
      };
      addSafeReciept.form.controls['receiptVal'].setErrors({
        incorrect: true,
      });
    } else if (
      this.safeReciept.currentSafeVal < this.safeReciept.receiptVal ||
      !this.safeReciept.currentSafeVal
    ) {
      if (!this.id && this.safeReciept.receiptKind === 'ايصال صرف نقدية') {
        this.inputValid.receiptVal = {
          cond: false,
          msg: 'رصيد الخزنة لا يسمح',
        };
        addSafeReciept.form.controls['receiptVal'].setErrors({
          incorrect: true,
        });
      }
    } else {
      this.inputValid.receiptVal.cond = true;
      addSafeReciept.form.controls['receiptVal'].setErrors(null);
    }
  };

  otherReceiptValChanged(val: number) {
    const allReceiptVals =
      this.safeReciept.receiptVal +
      this.otherRecieptVals
        .map((r) => r.val)
        .reduce((a: number, b: number) => a + b);
    if (
      this.safeReciept.currentSafeVal < allReceiptVals ||
      !this.safeReciept.currentSafeVal
    ) {
      this.inputValid.receiptVal = {
        cond: false,
        msg: 'رصيد الخزنة لا يسمح',
      };
    } else {
      this.inputValid.receiptVal.cond = true;
    }
  }

  addOtherReceiptVal() {
    if (this.otherRecieptVals.length < 10) {
      this.otherRecieptVals.push({ val: 0, note: '' });
    }
  }

  findCustomer_byName = (customerName: string): Customer | undefined =>
    this.customerList.find((c) => c.customerName === customerName);

  findAcc_byName = (accName: string): OtherAcc | undefined =>
    this.accList.find((acc) => acc.AccName === accName);

  findTruck_byName = (truckName: string): Truck | undefined =>
    this.truckList.find((truck) => truck.name === truckName);

  findConcreteCustomer_byName = (
    fullName: string
  ): ConcreteCustomer | undefined =>
    this.concreteCustomerList.find(
      (customer) => customer.fullName === fullName
    );

  findTruckCustomerByName = (fullName: string): TruckCustomer | undefined =>
    this.truckCustomerList.find((customer) => customer.fullName == fullName);

  customerNameChanged = (addSafeReciept: NgForm) => {
    let custInfo = this.findCustomer_byName(this.safeReciept.customerName);
    if (!custInfo) {
      this.inputValid.customerName = {
        cond: false,
        msg: 'العميل غير مسجل بقاعدة البيانات',
        class: 'secondaryBadge',
      };
      addSafeReciept.form.controls['customerName'].setErrors({
        incorrect: true,
      });
      this.safeReciept.currentCustomerVal = 0;
      this.valsRemain.otherValRemain = 0;
      this.safeReciept.customerId = null;
    } else {
      this.inputValid.customerName.cond = true;
      this.inputValid.customerName.class =
        custInfo.customerRemain >= 0 ? 'secondaryBadge' : 'dangerBadge';
      addSafeReciept.form.controls['customerName'].setErrors(null);
      this.safeReciept.currentCustomerVal = custInfo.customerRemain;
      this.safeReciept.customerId = custInfo.customerId;
      this.valsRemain.otherValRemain = custInfo.customerRemain;
      //addSafeReciept.form.controls['customerName'].s({ 'incorrect': true });
    }
  };

  concreteCustomerNameChanged(addSafeReciept: NgForm) {
    const customerInfo = this.findConcreteCustomer_byName(
      this.safeReciept.concreteCustomerName
    );

    if (!customerInfo) {
      this.inputValid.concreteCustomerName = {
        cond: false,
        msg: 'العميل غير مسجل بقاعدة البيانات',
        class: 'secondaryBadge',
      };

      addSafeReciept.form.controls['concreteCustomerName'].setErrors({
        incorrect: true,
      });

      this.safeReciept.concreteCustomerVal = 0;
      this.valsRemain.otherValRemain = 0;
      this.safeReciept.concreteCustomer_id = '0';
    } else {
      this.inputValid.concreteCustomerName.cond = true;
      this.inputValid.customerName.class =
        customerInfo.currentVal >= 0 ? 'secondaryBadge' : 'dangerBadge';
      addSafeReciept.form.controls['concreteCustomerName'].setErrors(null);
      this.safeReciept.concreteCustomerVal = customerInfo.currentVal;
      this.safeReciept.concreteCustomer_id = customerInfo.id;
      this.valsRemain.otherValRemain = customerInfo.currentVal;
    }
  }

  truckCustomerNameChanged(addSafeReciept: NgForm) {
    const customerInfo = this.findTruckCustomerByName(
      this.safeReciept.truckCustomerName
    );

    if (!customerInfo) {
      this.inputValid.truckCustomerName = {
        cond: false,
        msg: 'العميل غير مسجل بقاعدة البيانات',
        class: 'secondaryBadge',
      };

      addSafeReciept.form.controls['truckCustomerName'].setErrors({
        incorrect: true,
      });

      this.safeReciept.truckCustomerVal = 0;
      this.valsRemain.otherValRemain = 0;
      this.safeReciept.truckCustomerId = '0';
    } else {
      this.inputValid.truckCustomerName.cond = true;
      this.inputValid.truckCustomerName.class =
        customerInfo.currentVal >= 0 ? 'secondaryBadge' : 'dangerBadge';
      addSafeReciept.form.controls['truckCustomerName'].setErrors(null);
      this.safeReciept.truckCustomerVal = customerInfo.currentVal;
      this.safeReciept.truckCustomerId = customerInfo.id;
      this.valsRemain.otherValRemain = customerInfo.currentVal;
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
          goHome: 'الخزنة',
        },
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result == 'addNew' && this.id) {
        this._router.navigate(['/SafeReceipt']);
      } else if (result == 'addNew') {
        this.setDefultvals();
      } else if (result == 'back') {
        this._location.back();
      } else {
        this._router.navigate(['/Safe']);
      }
    });
  };

  openDelDialog = () => {
    let accInfo = this.safeReciept.AccName
      ? this.safeReciept.AccName
      : this.safeReciept.customerName;

    let dialogRef = this._dialog.open(DeleteDialogComponent, {
      data: {
        header: 'برجاء التأكد من بيانات الايصال قبل الحذف !',
        info: `لحساب : ${accInfo}`,
        discription: [`بقيمة | ${this.safeReciept.receiptVal}`],
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result == 'true') {
        this.oldReciept.changedType = 'حذف الايصال';
        this._safeService.postChangedReciept(this.oldReciept).subscribe(
          () => {
            this.deleteRecipt();
          },
          (error) => {
            /* if data saved but some vars are undifined */
            if (error.status == '201') {
              this.deleteRecipt();
            }
          }
        );
      }
    });
  };

  deleteRecipt() {
    if (this.id)
      this._safeService
        .deleteSafeReciept(parseInt(this.id))
        .subscribe(() => this._router.navigate(['/Safe']));
  }

  recordSafeReceipt(safeReciept: SafeReceipt) {
    return new Promise((res) => {
      this._safeService.creatSafeReceipt(safeReciept).subscribe((data: any) => {
        res(data);
      });
    });
  }

  onSubmit(addSafeReciept: NgForm) {
    if (this.safeReciept.receiptVal == 0) {
      this.inputValid.receiptVal = {
        cond: false,
        msg: 'يجب ادخال قيمة الايصال',
      };
      addSafeReciept.form.controls['receiptVal'].setErrors({
        incorrect: true,
      });
    } else {
      let dialogInfo = this.safeReciept.customerName
        ? this.safeReciept.customerName
        : this.safeReciept.AccName;

      let headerCond = this.id ? 'تعديل' : 'اضافة';

      // discription array
      let discription = [
        `من خزنة | ${this.safeReciept.safeName}`,
        `القيمة | ${this.safeReciept.receiptVal}`,
      ];
      if (this.safeReciept.recieptNote)
        discription.push(`ملاحظات | ${this.safeReciept.recieptNote}`);

      // thedialog vals
      let thedialog = {
        header: `تم ${headerCond} ايصال النقدية`,
        info: `لحساب | ${dialogInfo}`,
        discription: discription,
      };

      if (addSafeReciept.valid) {
        this._glopal.loading = true;
        if (this.id) {
          thedialog.discription = [
            `ايصال رقم | (${this.id})`,
            ...thedialog.discription,
          ];
          // edit safereceipt
          if (this._glopal.check.edi) {
            if (this.isChanged(this.safeReciept, this.oldReciept)) {
              this.safeReciept.isUpdated = true;
            }
            this._safeService.updateSafeReceipt(this.safeReciept).subscribe(
              () => {
                /* this.openDialog(thedialog);
                this._glopal.loading = false; */
                this.processUpdate(thedialog);
              },
              (error) => {
                /* if data saved but some vars are undifined */
                if (error.status == '201') {
                  /* this._glopal.loading = false;
                  this.openDialog(thedialog); */
                  this.processUpdate(thedialog);
                }
              }
            );
          } else {
            this._snackBar.open('لا توجد صلاحية للتعديل', 'اخفاء', {
              duration: 2500,
            });
            this._glopal.loading = false;
          }
        } else {
          // new safereceipt
          this.recordSafeReceipt(this.recieptData_forDb(this.safeReciept)).then(
            (data: any) => {
              if (this.otherRecieptVals.length == 0) {
                thedialog.discription = [
                  `ايصال رقم | (${data[0]})`,
                  ...thedialog.discription,
                ];
                this._glopal.loading = false;
                this.openDialog(thedialog);
              } else {
                this.recordOtherReceiptVals(this.safeReciept);
              }
            }
          );
        }
      }
    }
  }

  recordOtherReceiptVals(safeReciept: SafeReceipt) {
    let discription: string[] = [
      `${safeReciept.AccName ?? safeReciept.customerName}`,
      `ايصال 1 بقيمة ${safeReciept.receiptVal} | ${safeReciept.recieptNote}`,
    ];
    const filteredVal = this.otherRecieptVals.filter((v) => v.val);
    for (let i = 0; i < filteredVal.length; i++) {
      safeReciept.receiptVal = filteredVal[i].val;
      safeReciept.recieptNote = filteredVal[i].note;
      this.recordSafeReceipt(this.recieptData_forDb(safeReciept)).then(
        (data: any) => {
          discription.push(
            `ايصال ${i + 2} بقيمة ${filteredVal[i].val} | ${
              filteredVal[i].note
            }`
          );
          if (i == filteredVal.length - 1) {
            let thedialog = {
              header: `تم اضافة ايصالات نقدية`,
              info: `خزنة ${safeReciept.safeName}`,
              discription: discription,
            };
            this._glopal.loading = false;
            this.openDialog(thedialog);
          }
        }
      );
    }
  }

  processUpdate(theDialog: any) {
    if (this.isChanged(this.safeReciept, this.oldReciept)) {
      this.oldReciept.receiptKind = this.safeReciept.receiptKind;
      this.oldReciept.receiptVal = this.safeReciept.receiptVal;
      this.oldReciept.accOrCustomer = this.safeReciept.AccName
        ? this.safeReciept.AccName
        : this.safeReciept.customerName;
      this.oldReciept.safeName = this.safeReciept.safeName;
      this.oldReciept.recieptNote = this.safeReciept.recieptNote;
      this.oldReciept.transactionAccKind = this.safeReciept.transactionAccKind;
      this.oldReciept.date_time = this._mainService
        .makeTime_date(new Date(Date.now()))
        .replace('T', ' ');
      this.oldReciept.changedType = 'تعديل';

      this._safeService.postChangedReciept(this.oldReciept).subscribe(
        () => {
          this.openDialog(theDialog);
          this._glopal.loading = false;
        },
        (error) => {
          /* if data saved but some vars are undifined */
          if (error.status == '201') {
            this._glopal.loading = false;
            this.openDialog(theDialog);
          }
        }
      );
    } else {
      this._glopal.loading = false;
      this.openDialog(theDialog);
    }
  }

  recieptData_forDb(receipt: SafeReceipt): SafeReceipt {
    return {
      safeReceiptId: receipt.safeReceiptId ? receipt.safeReceiptId : null,
      receiptKind: receipt.receiptKind,
      date_time: receipt.date_time,
      //fst safe inpts
      safeName: receipt.safeName,
      currentSafeVal: receipt.currentSafeVal,
      safeId: receipt.safeId,
      // sec section
      transactionAccKind: receipt.transactionAccKind
        ? receipt.transactionAccKind
        : '',
      // acc inpts
      accId: receipt.accId ? receipt.accId : null,
      AccName: receipt.AccName ? receipt.AccName : '',
      currentAccVal: receipt.currentSafeVal ? receipt.currentSafeVal : 0,
      //safe inpts
      secSafeName: receipt.secSafeName ? receipt.secSafeName : '',
      secSafeId: receipt.secSafeId ? receipt.secSafeId : null,
      current_SecSafeVal: receipt.current_SecSafeVal
        ? receipt.current_SecSafeVal
        : null,
      // customer inpts
      customerId: receipt.customerId ? receipt.customerId : null,
      customerName: receipt.customerName ? receipt.customerName : '',
      currentCustomerVal: receipt.currentCustomerVal
        ? receipt.currentCustomerVal
        : 0,
      // concreteCustomer inpts
      concreteCustomer_id: receipt.concreteCustomer_id
        ? receipt.concreteCustomer_id
        : null,
      concreteCustomerName: receipt.concreteCustomerName
        ? receipt.concreteCustomerName
        : '',
      concreteCustomerVal: receipt.concreteCustomerVal
        ? receipt.concreteCustomerVal
        : 0,
      // truck
      truckId: receipt.truckId ? receipt.truckId : null,
      truckName: receipt.truckName ? receipt.truckName : '',
      truckCurrentVal: receipt.truckCurrentVal ? receipt.truckCurrentVal : 0,
      // truckCustomer inpts
      truckCustomerId: receipt.truckCustomerId ? receipt.truckCustomerId : null,
      truckCustomerName: receipt.truckCustomerName
        ? receipt.truckCustomerName
        : '',
      truckCustomerVal: receipt.truckCustomerVal ? receipt.truckCustomerVal : 0,
      // user inpts
      receiptVal: receipt.receiptVal,
      recieptNote: receipt.recieptNote ? receipt.recieptNote : '',
      madeBy: this._auth.uName.realName,
      isUpdated: false,
    };
  }

  toEditReport() {
    if (this._auth?.check.prem && this.safeReciept.isUpdated)
      this._router.navigate([`/ReceiptsChangesReport/${this.id}`]);
  }
}
