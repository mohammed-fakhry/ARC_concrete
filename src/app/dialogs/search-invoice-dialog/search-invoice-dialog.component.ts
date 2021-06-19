import { Component, OnInit, Inject } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Stock } from 'src/app/classes/stock';
import { UserData } from 'src/app/classes/user-data';
import { AuthService } from 'src/app/services/auth.service';
import { GlobalVarsService } from 'src/app/services/global-vars.service';
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
    searchVal: null,
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
    ];

    /* texts effect */
    let textVals = textsArr.find((text) => text.searchFor.includes(this.data));
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

  stocksMethod() {
    this.getStockes().then((data: any) => {
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
}
