import { Component, OnInit, Inject } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConcreteReceipt } from 'src/app/classes/concrete-receipt';
import { Stock } from 'src/app/classes/stock';
import { UserData } from 'src/app/classes/user-data';
import { AuthService } from 'src/app/services/auth.service';
import { ConcreteService } from 'src/app/services/concrete.service';
import { GlobalVarsService } from 'src/app/services/global-vars.service';
import { MainService } from 'src/app/services/main.service';
import { SafeService } from 'src/app/services/safe.service';
import { StockService } from 'src/app/services/stock.service';

@Component({
  selector: 'app-search-invoice-dialog',
  templateUrl: './search-invoice-dialog.component.html',
  styleUrls: ['./search-invoice-dialog.component.scss'],
})
export class SearchInvoiceDialogComponent implements OnInit {
  searchList: any[] = [];
  searchVals = {
    id: null,
    searchVal: '',
    detail: '',
  };

  searchValid: boolean = false;
  btns: { edit: string; new: string; newBtnDisabled: boolean } = {
    edit: '',
    new: '',
    newBtnDisabled: true,
  };
  placeHolder: string = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public _safeService: SafeService,
    public _glopal: GlobalVarsService,
    public _stockService: StockService,
    public _concrete: ConcreteService,
    private _auth: AuthService
  ) {}

  ngOnInit(): void {
    const textsArr = [
      {
        searchFor: 'safeReceipt',
        placeHolder: 'بحث برقم ايصال',
        btns: {
          edit: 'تعديل بيانات ايصال',
          new: 'ايصال جديد',
          newBtnDisabled: false,
        },
        method: () => this.recieptMethod(),
      },
      {
        searchFor: 'stockInvoice',
        placeHolder: 'بحث برقم فاتورة',
        btns: {
          edit: 'تعديل بيانات فاتورة',
          new: 'فاتورة جديدة',
          newBtnDisabled: false,
        },
        method: () => this.recieptMethod(),
      },
      {
        searchFor: 'stockingDetails',
        placeHolder: 'بحث بتاريخ الجرد | مثال ( 25-02 ) الشهر ثم اليوم',
        btns: {
          edit: 'اختيار الاذن',
          new: 'اذن جرد جديد',
          newBtnDisabled: false,
        },
        method: () => this.recieptMethod(),
      },
      {
        searchFor:
          'outInvoices, inInvoices, invoiceAll, ProductsProfits, stockForStocking',
        placeHolder: 'بحث باسم المخزن',
        btns: {
          edit: 'عرض التقرير',
          new: 'الغاء',
          newBtnDisabled: true,
        },
        method: () => this.stocksMethod(),
      },
      {
        searchFor: 'users',
        placeHolder: 'بحث باسم المستخدم او اسم الدخول',
        btns: {
          edit: 'تعديل بيانات المستخدم',
          new: 'مستخدم جديد',
          newBtnDisabled: false,
        },
        method: () => this.usersMethod(),
      },
      {
        searchFor: 'concreteRecipts_Cash_Method',
        placeHolder: 'بحث برقم الفاتورة',
        btns: {
          edit: 'دفعة من فاتورة',
          new: 'ايصال خصم',
          newBtnDisabled: false,
        },
        method: () => this.concreteRecipts_Cash_Method(),
      },
    ];

    /* texts effect */
    const specialSearch = this.data?.specialSearch
      ? this.data?.specialSearch
      : this.data;

    let textVals = textsArr.find((text) =>
      text.searchFor.includes(specialSearch)
    );
    if (textVals) {
      this.placeHolder = textVals.placeHolder ? textVals.placeHolder : '';
      this.btns = {
        edit: textVals.btns.edit ? textVals.btns.edit : '',
        new: textVals.btns.new ? textVals.btns.new : '',
        newBtnDisabled: textVals.btns.newBtnDisabled
          ? textVals.btns.newBtnDisabled
          : false,
      };
      textVals.method();
    }
  }

  searchVal(searchForm: NgForm) {
    let recVal = this.searchList.find(
      (s) => s.searchVal === this.searchVals.searchVal
    );
    if (recVal) {
      this.searchValid = true;
      searchForm.form.controls['searchVal'].setErrors(null);
      this.searchVals.id = recVal.id;
      if (recVal?.manualNum) this.searchVals.detail = recVal.manualNum
    } else {
      this.searchValid = false;
      searchForm.form.controls['searchVal'].setErrors({ incorrect: true });
    }
  }

  getStockes() {
    return new Promise((res) => {
      this._stockService.getStockes().subscribe((data: Stock[]) => res(data));
    });
  }

  getConcreteReceipts(id: string, searchBy: string) {
    return new Promise((res) => {
      this._concrete
        .concreteReceiptList(id, searchBy)
        .subscribe((data: ConcreteReceipt[]) => res(data));
    });
  }

  concreteRecipts_Cash_Method() {
    if (this.data.customerId) {
      this.getConcreteReceipts(
        this.data.customerId,
        'concreteCustomerReceipts'
      ).then((data: any) => {
        this.searchList = data.map((d: any) => {
          return {
            searchVal: `فاتورة رقم(${d.manualNum}) | ${d.concreteReceipt_id}`,
            manualNum: d.manualNum,
            detail: `${d.date_time} | (${d.receiptRemainCash})`,
            id: d.concreteReceipt_id,
          };
        });

        if (this.data?.concreteCashId) {
          this.getReceiptCashes(this.data.concreteCashId).then(
            (result: any) => {
              if (result.length > 0) {
                this.searchVals = {
                  id: result[0]?.concreteReceipt_id,
                  searchVal: `فاتورة رقم(${result[0]?.manualNum}) | ${result[0]?.concreteReceipt_id}`,
                  detail: result[0]?.manualNum,
                };

                if (result[0]?.concreteReceipt_id) this.searchValid = true;
                else this.searchValid = false;
              }

              this._glopal.loading = false;
            }
          );
        } else this._glopal.loading = false;
      });
    }
  }

  getReceiptCashes(id: string) {
    return new Promise((res) => {
      this._concrete
        .concreteReceipt_cashList(id, 'concretereceiptcash_Id')
        .subscribe((data: any) => res(data));
    });
  }

  stocksMethod() {
    this.getStockes().then((data: any) => {
      this.searchValid = true;

      this.searchList = data.map((stock: Stock) => {
        return { searchVal: stock.stockName, id: stock.stockId };
      });
      this._glopal.loading = false;
    });
  }

  getRecieptSearchVal(cond: string) {
    return new Promise((res) => {
      this._safeService
        .getReceiptSearchVal(cond)
        .subscribe((data: any[]) => res(data));
    });
  }

  recieptMethod() {
    this.getRecieptSearchVal(this.data).then((data: any) => {
      this.searchList = data;
      this._glopal.loading = false;
    });
  }

  getUsers() {
    return new Promise((res) => {
      this._auth.getUsers().subscribe((data: UserData[]) => res(data));
    });
  }

  usersMethod() {
    this.getUsers().then((data: any) => {
      this.searchList = data.map((user: any) => {
        return {
          searchVal: `${user.name} | '${user.realName}'`,
          id: user.id,
        };
      });
      this._glopal.loading = false;
    });
  }

  returnId() {
    if (this.data?.specialSearch) {
      return {
        concreteReceipt_id: this.searchVals.id,
        manualNum: this.searchVals.detail
      };
    }
    return this.searchVals.id
  }

  onSubmit_new() {
    if (this.data?.specialSearch) {
      return {
        header: 'discound',
        concreteReceipt_id: this.searchVals.id,
        manualNum: this.searchVals.detail
      };
    }
    return 'newReciept';
  }
}
