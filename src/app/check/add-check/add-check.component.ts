import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Bank } from 'src/app/classes/bank';
import { BankCheck } from 'src/app/classes/bankCheck';
import { DoneDialogComponent } from 'src/app/dialogs/done-dialog/done-dialog.component';
import { CheckService } from 'src/app/services/check.service';
import { GlobalVarsService } from 'src/app/services/global-vars.service';
import { MainService } from 'src/app/services/main.service';

@Component({
  selector: 'app-add-check',
  templateUrl: './add-check.component.html',
  styleUrls: ['./add-check.component.scss'],
})
export class AddCheckComponent implements OnInit {
  bankCheck: BankCheck = new BankCheck();
  id!: string | null;
  bankList: Bank[] = [];

  checkCounts: number = 1;

  constructor(
    public _checkService: CheckService,
    public activeRoute: ActivatedRoute,
    public _router: Router,
    public _mainService: MainService,
    public _dialog: MatDialog,
    public _glopal: GlobalVarsService
  ) {
    this._glopal.currentHeader = 'اضافة بيانات شيك';
    this.bankCheck.date = this._mainService.makeDate(new Date(Date.now()));
    this._glopal.loading = true;
  }

  ngOnInit(): void {
    this.id = this.activeRoute.snapshot.paramMap.get('id');

    this.onStart();
  }

  onStart() {
    this._glopal.loading = true;

    this.getBankList().then((data: Bank[]) => {
      this.bankList = data;

      if (this.id) {
        this.getCheckById(this.id).then((data: BankCheck[]) => {
          this.bankCheck = data[0];
          this._glopal.loading = false;
        });
      } else {
        this._glopal.loading = false;
      }
    });
  }

  clearInputs() {
    this.bankCheck = new BankCheck(
      this._mainService.makeDate(new Date(Date.now()))
    );
  }

  getCheckById(id: string): Promise<BankCheck[]> {
    return new Promise((res) => {
      this._checkService
        .getCheckById(id)
        .subscribe((data: BankCheck[]) => res(data));
    });
  }

  getBankList(): Promise<Bank[]> {
    return new Promise((res) => {
      this._checkService.banksList().subscribe((data: Bank[]) => res(data));
    });
  }

  postBankCheck(bankCheck: BankCheck) {
    this._checkService.postBankCheck(bankCheck).subscribe();
  }

  /* input changes */

  bankChanged(bank: Bank) {
    this.bankCheck.bankName = bank.bankName;
    this.bankCheck.bankId = bank.bankId;
  }

  openDoneDialog(dataVals: {
    header: string;
    info: string;
    discription: string[];
  }) {
    let dialogRef = this._dialog.open(DoneDialogComponent, {
      data: {
        header: dataVals.header,
        info: dataVals.info,
        discription: dataVals.discription,
        btns: {
          addNew: 'اضافة بيانات جديدة',
          goHome: 'تتبع الشيكات',
        },
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result == 'addNew') {
        if (this.id) this._router.navigate(['/addCustomer']);
        else this.clearInputs();
      } else {
        this._router.navigate(['/checkList']);
      }
    });
  }

  addMonth(date: string): string {
    let dateToDate = new Date(date);
    let newDate = new Date(dateToDate.setMonth(dateToDate.getMonth() + 1));
    return this._mainService.makeDate(newDate);
  }

  postNewCheck() {
    this._glopal.loading = true;
    for (let i = 0; i < this.checkCounts; i++) {
      const newDate = this.addMonth(this.bankCheck.date);
      if (i > 0) {
        this.bankCheck.date = newDate;
        this.bankCheck.checkNumber = `${parseInt(this.bankCheck.checkNumber) + 1}`
      }
      //console.log(this.bankCheck.date);
      this._checkService.postBankCheck(this.bankCheck).subscribe(
        () => {
          if (i === this.checkCounts - 1) this.passDialog();
        },
        (error) => {
          if (error.status == '201') {
            if (i === this.checkCounts - 1) this.passDialog();
          }
        }
      );
    }
  }

  updateCheck() {
    this._checkService.updateBankCheck(this.bankCheck).subscribe(
      () => {
        this.passDialog();
      },
      (error) => {
        if (error.status == '201') {
          this.passDialog();
        }
      }
    );
  }

  passDialog() {
    this._glopal.loading = false;
    const statu = this.id ? 'تعديل' : 'اضافة';
    this.openDoneDialog({
      header: `تم ${statu} بيانات الشيك`,
      info: `باسم | ${this.bankCheck.payFor}`,
      discription: [
        `بتاريخ | ${this.bankCheck.date}`,
        `البنك  | ${this.bankCheck.bankId}`,
        `بقيمة  | ${this.bankCheck.checkValue}`,
      ],
    });

    this._mainService.setNotification();
  }

  onSubmit(bankCheckForm: NgForm) {
    if (bankCheckForm.valid) {
      if (this.id) {
        this.updateCheck();
      } else {
        this.postNewCheck();
      }
    } else {
      this._mainService.playshortFail()
    }
  }
}
