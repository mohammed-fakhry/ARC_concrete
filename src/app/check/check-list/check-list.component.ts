import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { CheckService } from 'src/app/services/check.service';
import { MainService } from 'src/app/services/main.service';
import { GlobalVarsService } from 'src/app/services/global-vars.service';
import { BankCheck } from 'src/app/classes/bankCheck';
import { CheckBankList } from 'src/app/classes/check-bank-list';
import { DoneDialogComponent } from 'src/app/dialogs/done-dialog/done-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-check-list',
  templateUrl: './check-list.component.html',
  styleUrls: ['./check-list.component.scss'],
})
export class CheckListComponent implements OnInit {
  listData: MatTableDataSource<any> | any;
  // dataLists: MatTableDataSource<any>[] = [];

  displayedColumns: string[] = [
    'checkNumber',
    'bankName',
    'payFor',
    'checkValue',
    'date',
    'isPaid',
  ];

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // searchTxt: string = '';

  mainList: CheckBankList[] = [];

  isPaidList: boolean = false;
  listToggleBtn: string = 'شيكات تم تحصيلها';

  isEmptyData: boolean = false;

  constructor(
    public _checkService: CheckService,
    public _mainService: MainService,
    public _glopal: GlobalVarsService,
    public _dialog: MatDialog,
    public _router: Router
  ) {
    this.onStart();
    this._glopal.currentHeader = 'تفاصيل الشيكات';
    this._glopal.loading = true;
  }

  ngOnInit(): void {}

  onStart(paid?: string) {
    this._glopal.loading = true;
    this.mainList = [];

    this.isPaidList = paid ? true : false;
    this.listToggleBtn = paid ? 'شيكات بانتظار التحصيل' : 'شيكات تم تحصيلها';

    this.getCheckList(paid)
      .then((data: BankCheck[]) => {
        let timingArr = this.timingArry(paid);
        for (let i = 0; i < timingArr.length; i++) {
          const checkList = this.setCheckList(data, timingArr[i]);
          this.mainList = [...this.mainList, checkList];
        }

        // if there are no check recorded
        this.isEmptyData = this.mainList.every(
          (check: CheckBankList) => !check.hasData
        );

        if (this.isEmptyData) this._mainService.scrollTo('addBankCheckBtn');
      })
      .then(() => {
        this._mainService.handleTableHeight();
        this._glopal.loading = false;
      });
  }

  paidListToggle() {
    if (this.isPaidList) {
      this.onStart();
      this.listToggleBtn = 'شيكات تم تحصيلها';
    } else {
      this.onStart('paid');
      this.listToggleBtn = 'شيكات بانتظار التحصيل';
    }
  }

  timingArry(paid?: string) {
    if (!paid)
      return [
        {
          title: 'شيكات متأخرة',
          elementId: 'lateChecks',
          classes: { bg: 'headerPinkBg', text: 'headerPink' },
        },
        {
          title: 'شيكات اليوم',
          elementId: 'todayChecks',
          classes: { bg: 'textSecondaryBg', text: 'textSecondary' },
        },
        {
          title: 'شيكات غداً',
          elementId: 'tomorrowChecks',
          classes: { bg: 'textSecondaryBg', text: 'textSecondary' },
        },
        {
          title: 'شيكات مجدولة',
          elementId: 'futureChecks',
          classes: { bg: 'successBg', text: 'textGreen' },
        },
      ];

    return [
      {
        title: 'شيكات تم تحصيلها',
        elementId: 'all',
        classes: { bg: 'textSecondaryBg', text: 'textSecondary' },
      },
    ];
  }

  setCheckList(
    data: BankCheck[],
    timing?: {
      title: string;
      elementId: string;
      classes: { bg: string; text: string };
    }
  ): CheckBankList {
    const checkList = new CheckBankList(data, timing);

    // checkList.checkDetail.listData.onUs = this.newTable(checkList.checkDetail.mainData.onUs)
    /* checkList.checkDetail.listData.onUs.sort = this.sort;
    checkList.checkDetail.listData.onUs.paginator = this.paginator; */

    // checkList.checkDetail.listData.toUs = this.newTable(checkList.checkDetail.mainData.toUs)
    /*  checkList.checkDetail.listData.toUs.sort = this.sort;
    checkList.checkDetail.listData.toUs.paginator = this.paginator; */

    return checkList;
  }

  /* fillListData = (data: any) => {
    this.listData = new MatTableDataSource(data);
    this.listData.sort = this.sort;
    this.listData.paginator = this.paginator;
  }; */

  getCheckList(Paid?: string) {
    return new Promise<BankCheck[]>((res) => {
      this._checkService.checkList(Paid).subscribe((data: BankCheck[]) => {
        res(data);
      });
    });
  }

  newTable = (data: any): MatTableDataSource<any> => {
    return new MatTableDataSource(data);
  };

  search(i: number, checkType: string) {
    if (checkType === 'onUs') {
      this.mainList[i].checkDetail.listData.onUs.filter =
        this.mainList[i].searchTxt.onUs;

      this.mainList[i].checkDetail.searchResult.onUs = {
        length: this.mainList[i].checkDetail.listData.onUs.data.filter(
          (d: BankCheck) => d.payFor.includes(this.mainList[i].searchTxt.onUs)
        ).length,
        total: this.mainList[i].checkDetail.listData.onUs.data
          .filter((d: BankCheck) =>
            d.payFor.includes(this.mainList[i].searchTxt.onUs)
          )
          .map((d: BankCheck) => d.checkValue)
          .reduce((a: number, b: number) => a + b, 0),
      };
    }

    if (checkType === 'toUs') {
      this.mainList[i].checkDetail.listData.toUs.filter =
        this.mainList[i].searchTxt.toUs;

      this.mainList[i].checkDetail.searchResult.toUs = {
        length: this.mainList[i].checkDetail.listData.toUs.data.filter(
          (d: BankCheck) => d.payFor.includes(this.mainList[i].searchTxt.toUs)
        ).length,
        total: this.mainList[i].checkDetail.listData.toUs.data
          .filter((d: BankCheck) =>
            d.payFor.includes(this.mainList[i].searchTxt.toUs)
          )
          .map((d: BankCheck) => d.checkValue)
          .reduce((a: number, b: number) => a + b, 0),
      };
    }
  }

  togglePaid(bankCheck: BankCheck) {
    if (this._mainService.canUpdate()) {
      if (bankCheck.isPaid) {
        const today = this._mainService.makeDate(new Date());
        bankCheck.isPaid = 1;
        bankCheck.paid_off_date = today;
      } else {
        bankCheck.isPaid = 0;
        bankCheck.paid_off_date = '0';
      }

      this._checkService.updateBankCheck(bankCheck).subscribe(() => {
        this.openDialog(bankCheck);
      });
    }
  }

  openDialog = (bankCheck: BankCheck) => {
    let dialogRef = this._dialog.open(DoneDialogComponent, {
      data: {
        header: 'تم تأكيد سداد الشيك',
        info: `رقم الشيك | ${bankCheck.checkNumber}`,
        discription: [
          `بتاريخ | ${bankCheck.date}`,
          `صرف من بنك | ${bankCheck.bankName}`,
          `تم الصرف الى | ${bankCheck.payFor}`,
          `تاريخ الصرف | ${bankCheck.paid_off_date}`,
        ],
        btns: {
          addNew: 'اضافة بيانات جديدة',
          goHome: 'الرئيسية',
        },
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result == 'addNew') {
        this.onStart();
        this._mainService.setNotification();
      } else {
        this._router.navigate(['/Home']);
      }
    });
  };

  /* scrollTo(elementId: string) {
    const elmnt = document.getElementById(elementId);
    if (elmnt)
      elmnt.scrollIntoView({
        behavior: 'smooth',
      });

    elmnt?.classList.add('darkGrayBg','px-2');
    elmnt?.children[0].children[0].classList.add('bigShadow');

    setTimeout(() => {
      elmnt?.classList.remove('darkGrayBg','px-2');
      elmnt?.children[0].children[0].classList.remove('bigShadow');
    }, 700);
  } */
}
