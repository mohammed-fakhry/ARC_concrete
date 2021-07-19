import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { SearchInvoiceDialogComponent } from '../dialogs/search-invoice-dialog/search-invoice-dialog.component';
import { AuthService } from './auth.service';
import { CheckService } from './check.service';
import { GlobalVarsService } from './global-vars.service';

@Injectable({
  providedIn: 'root',
})
export class MainService {
  example_container!: HTMLElement;
  standTable!: HTMLElement;
  tableWithHeader!: HTMLElement;
  tableWithSearch!: HTMLElement;
  inpTableBody!: HTMLElement;
  inTab!: HTMLElement;

  constructor(
    public _router: Router,
    public _dialog: MatDialog,
    private http: HttpClient,
    public _auth: AuthService,
    public _glopal: GlobalVarsService,
    public _snackBar: MatSnackBar,
    public _checkService: CheckService
  ) {}

  url: string | null = localStorage.getItem('tmpDB');

  handleTableHeight() {
    let windowHeight = window.innerHeight;
    if (windowHeight > 700) {
      // 64 is navbar's hight
      let height = window.innerHeight - 64 - 210;

      this.example_container = document.querySelector(
        '.example-container'
      ) as HTMLElement;
      if (this.example_container)
        this.example_container.style.maxHeight = `${height}px`;

      this.tableWithHeader = document.querySelector(
        '.tableWithHeader'
      ) as HTMLElement;
      if (this.tableWithHeader)
        this.tableWithHeader.style.maxHeight = `${height - 65}px`;

      this.tableWithSearch = document.querySelector(
        '.tableWithSearch'
      ) as HTMLElement;
      if (this.tableWithSearch)
        this.tableWithSearch.style.maxHeight = `${height - 30}px`;

      this.inpTableBody = document.querySelector(
        '.inpTableBody'
      ) as HTMLElement;
      if (this.inpTableBody)
        this.inpTableBody.style.maxHeight = `${height - 320}px`;

      this.inTab = document.querySelector('.inTab') as HTMLElement;
      if (this.inTab) this.inTab.style.maxHeight = `${height - 95}px`;
      this.standTable = document.querySelector('.standTable') as HTMLElement;
      if (this.standTable) this.standTable.style.maxHeight = `${height}px`;
    }
  }

  makeDate(currentDate: any) {
    let dateNow = currentDate; // new Date();
    let day = dateNow.getDate();
    let month = dateNow.getMonth() + 1;
    let year = dateNow.getFullYear();

    let dateArry = [day, month, year];

    for (let i = 0; i < dateArry.length; i++) {
      if (dateArry[i] < 10) {
        dateArry[i] = '0' + dateArry[i];
      }
    }

    // this._mainService.makeDate(new Date(Date.now()))
    let fullDate = dateArry[2] + '-' + dateArry[1] + '-' + dateArry[0];
    return fullDate.toString();
  }

  makeTime(currentDate: any) {
    let dateNow = currentDate;
    let hour = dateNow.getHours();
    let minutes = dateNow.getMinutes();

    let timeArry = [hour, minutes];

    for (let i = 0; i < timeArry.length; i++) {
      if (timeArry[i] < 10) {
        timeArry[i] = '0' + timeArry[i];
      }
    }

    let fullTime = timeArry[0] + ':' + timeArry[1]; // this.hour + ':' + this.minutes
    return fullTime.toString();
  }

  makeTime_date(currentDate: any) {
    return this.makeDate(currentDate) + 'T' + this.makeTime(currentDate);
  }

  selectText(inputId: string, i: number) {
    const input = document.getElementById(`${inputId}${i}`) as HTMLInputElement;
    if (input) {
      input.select();
    }
  }

  openSearchProductDialog = (cond: string, productId: string) => {
    let oldUrl = this._router.url;
    this._glopal.loading = true;

    let dialogRef = this._dialog.open(SearchInvoiceDialogComponent, {
      data: `${cond}`,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result != undefined && result != 'newReciept') {
        /* 'invoiceReport/:searchFor/:invDirection/:id' */
        this._router
          .navigate([
            `/invoiceReport/productTransaction/${productId}/${result}`,
          ])
          .then(() => {
            if (oldUrl.includes('invoiceReport/')) {
              location.reload();
            }
          });
      }
    });
  };

  // sqlQuery
  postSqlQuery(query: string) {
    return this.http.get(`${this.url}sqlQuery.php?query=${query}`);
  }

  canUpdate = (): boolean => {
    const checkSession: any = sessionStorage.getItem('y');
    const check = JSON.parse(checkSession);
    if (check.edi) return true;

    // can't edit
    this._snackBar.open('لا توجد صلاحية للتعديل', 'اخفاء', {
      duration: 2500,
    });
    this.playDrumFail()
    return false;
  };

  unpaidChecks(today: string) {
    return new Promise((res, rej) => {
      this._checkService.countNotPaidChecks(today).subscribe((data: any[]) => {
        if (data) res(data[0]);
        else rej('no notifications');
      });
    });
  }

  setNotification() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const notifyDate = this.makeDate(tomorrow);
    this.getNotification(notifyDate);
  }

  getNotification(today: string) {
    this.unpaidChecks(today)
      .then((data: any) => {
        this._glopal.notification.value = data.notPaid;
      })
      .catch((err) => console.log(err));
  }

  scrollTo(elementId: string, noBg?: boolean) {
    const elmnt = document.getElementById(elementId);
    if (elmnt) {
      elmnt.scrollIntoView({
        behavior: 'smooth',
      });

      elmnt.style.transition = '350ms';
      if (!noBg) elmnt?.classList.add('darkGrayBg');

      setTimeout(() => {
        elmnt.style.transition = '700ms';
        if (!noBg) elmnt?.classList.remove('darkGrayBg');
      }, 800);
    }
  }

  uploadImg(uploaData: FormData, path: string) {
    return this.http.post(`${this.url}${path}.php`, uploaData, {
      reportProgress: true,
      observe: 'events',
    });
  }

  inArabicWords = (number: any) => {
    number = number.toString();
    let dot = number.indexOf('.');
    let newNum: any = dot > 0 ? parseInt(number.slice(0, dot)) : number;

    let aNum: any;
    //this.theANum = "320862"

    var one = [
      '',
      'واحد ',
      'اثنان ',
      'ثلاثة ',
      'اربعة ',
      'خمسة ',
      'ستة ',
      'سبعة ',
      'ثمانية ',
      'تسعة ',
      'عشرة ',
      'احدى عشر ',
      'اثنى عشر ',
      'ثلاثة عشر ',
      'اربعة عشر ',
      'خمسة عشر ',
      'ستة عشر ',
      'سبعة عشر ',
      'ثمانية عشر ',
      'تسعة عشر ',
    ];
    var two = [
      '',
      '',
      ' عشرون ',
      'ثلاثون ',
      'اربعون ',
      'خمسون ',
      'ستون ',
      'سبعون ',
      'ثمانون ',
      'تسعون',
    ];
    var hund = [
      '',
      'مائة',
      'مئتان',
      'ثلاثمائة ',
      'اربعمائة ',
      'خمسمائة',
      'ستمائة ',
      'سبعمائة',
      'ثمانمائة',
      'تسعمائة ',
    ];

    if ((newNum = newNum.toString()).length > 9) return 'overflow';
    aNum = ('000000000' + newNum)
      .substr(-9)
      .match(/^(\d{2})(\d{1})(\d{1})(\d{2})(\d{1})(\d{2})$/);
    if (!aNum) return;
    let strA = '';
    strA +=
      aNum[1] != 0
        ? (one[Number(aNum[1])] || two[aNum[1][0]] + ' ' + one[aNum[1][1]]) +
          'بليون '
        : '';
    strA +=
      aNum[2] != 0
        ? (one[Number(aNum[2])] || two[aNum[2][0]] + ' ' + one[aNum[2][1]]) +
          'مليون '
        : '';

    strA +=
      aNum[3] != 0
        ? (aNum[2] != 0 ? `${aNum[2] != 0 || aNum[1] != 0 ? 'و ' : ''}` : '') +
          `${hund[Number(aNum[3])]} ` +
          (aNum[4] == 0 ? 'الف ' : '')
        : '';

    strA +=
      aNum[4] != 0
        ? (aNum[3] != 0 && one[aNum[4][1]] != ''
            ? `${aNum[3] != 0 || aNum[2] != 0 || aNum[1] != 0 ? 'و ' : ''}`
            : '') +
          (one[Number(aNum[4])] != undefined
            ? ` ${one[Number(aNum[4])]} الف `
            : `${one[aNum[4][1]]}و ${two[aNum[4][0]]} الف `)
        : '';

    strA +=
      aNum[5] != 0
        ? `و ${hund[Number(aNum[5])]} ${aNum[6] == 10 ? 'و ' : ''}`
        : '';

    strA +=
      aNum[6] != 0
        ? (one[aNum[6][1]] != ''
            ? `${
                aNum[5] != 0 ||
                aNum[4] != 0 ||
                aNum[3] != 0 ||
                aNum[2] != 0 ||
                aNum[1] != 0
                  ? 'و '
                  : ''
              }`
            : '') +
          (one[Number(aNum[6])] || `${one[aNum[6][1]]}و ${two[aNum[6][0]]}`)
        : '';

    if (strA) strA += ' جنيه مصرى لا غير';

    return strA ?? '';
  };

  dateExpired(oldDate: string): boolean {
    if (this._auth?.check.expEdi) {
      return false;
    }

    const currentTime = new Date(Date.now()).getTime();
    const secound = new Date(oldDate).getTime();
    const hours = Math.abs(currentTime - secound) / 36e5;

    return hours > 5;
  }

  playAlert() {
    const sound = document.getElementById('alertAudio') as HTMLAudioElement;
    if (sound) {
      // sound.src = "assets/audio/alert.wav"
      sound.play()
    };
  }

  playLongPop() {
    const longPop = document.getElementById('longPop') as HTMLAudioElement;
    if (longPop) {
      longPop.src = "assets/audio/longPop.wav"
      longPop.play();
    }
  }

  playPopAlert() {
    const popAlert = document.getElementById('popAlert') as HTMLAudioElement;
    if (popAlert) popAlert.play();
  }

  playMouseClickClose() {
    const mouseClickClose = document.getElementById(
      'mouseClickClose'
    ) as HTMLAudioElement;
    if (mouseClickClose) mouseClickClose.play();
  }

  // secondaryDone
  play_secondaryDone() {
    const secondaryDone = document.getElementById('secondaryDone') as HTMLAudioElement;
    if (secondaryDone) secondaryDone.play();
  }

  playshortFail() {
    const shortFail = document.getElementById('shortFail') as HTMLAudioElement;
    if (shortFail) shortFail.play();
  }

  playIntro() {
    const intro = document.getElementById('intro') as HTMLAudioElement;
    if (intro) intro.play();
  }

  playDrumFail() {
    const drumFail = document.getElementById('drumFail') as HTMLAudioElement;
    if (drumFail) drumFail.play();
  }

  // sci_click
  play_sweepTransition() {
    const sweepTransition = document.getElementById('sweepTransition') as HTMLAudioElement;
    if (sweepTransition) sweepTransition.play();
  }

}
