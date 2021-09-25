import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserData } from '../classes/user-data';
import { AuthService } from '../services/auth.service';
import { CheckService } from '../services/check.service';
import { GlobalVarsService } from '../services/global-vars.service';
import { MainService } from '../services/main.service';

@Component({
  selector: 'app-log-in',
  templateUrl: './log-in.component.html',
  styleUrls: ['./log-in.component.scss'],
})
export class LogInComponent implements OnInit {
  formData = {
    val: {
      uName: '',
      uAuth: '',
    },
    valid: { cond: true, msg: '' },
  };
  userNameDom: HTMLElement = document.querySelector('#userName') as HTMLElement;

  dateExpired: boolean = true;

  constructor(
    private _auth: AuthService,
    public _router: Router,
    public _glopal: GlobalVarsService,
    public _checkService: CheckService,
    public _mainService: MainService
  ) {
    this._glopal.currentHeader = '';
    this.resetAuth();
  }

  ngOnInit() {
    // window.onload = () => this.userNameDom.focus();
  }

  getAppVersion() {
    return new Promise((res, rej) => {
      this._auth.read_write_Version().subscribe(
        (data: any[]) => {
          res(data);
        },
        (error) => rej('no data')
      );
    });
  }

  appVersion: string = '';

  resetAuth() {
    sessionStorage.removeItem('y');
    sessionStorage.removeItem('n');
    this._auth.isAuth = false;
    this._auth.check = null;

    this._glopal.loading = true;
    this.getAppVersion()
      .then((data: any) => {
        const currentVersion = localStorage.getItem('versionDate');
        this.appVersion = data;
        if (currentVersion) {
          if (currentVersion != this.appVersion) {
            this.dateExpired = true;
          } else {
            this.dateExpired = false;
            this.userNameDom = document.querySelector(
              '#userName'
            ) as HTMLElement;
            if (this.userNameDom) this.userNameDom.focus();
          }
        }
        this._glopal.loading = false;
      })
      .catch(() => {
        this.dateExpired = true;
        this._glopal.loading = false;
      });
  }

  updateVersion() {
    localStorage.setItem('versionDate', `${this.appVersion}`);
    location.reload();
  }

  linksArry(url: string, users: UserData[]) {
    return users.map((user) => {
      return {
        name: user.name,
        url: (): string => {
          if (user.name.includes('_mo')) {
            return `${url}/accounting/`;
          } else if (user.name.includes('_ali')) {
            return `${url}/accountings_ali/`;
          } else {
            return `${url}/accounting/`;
          }
        },
      };
    });
  }

  makeUrl() {
    let currentUrl = window.location.href;
    let i = currentUrl.indexOf('#');
    let dots = currentUrl.indexOf(':');
    let mainUrl = currentUrl.slice(dots + 2, i);
    return mainUrl.includes('localhost')
      ? 'http://localhost'
      : 'http://192.168.1.118';
  }

  goIn() {
    let url = this.makeUrl();
    this._glopal.loading = true;
    this._auth
      .getUser(this.formData.val.uName, this.formData.val.uAuth)
      .subscribe(
        (data: UserData[]) => {
          if (data.length > 0) {
            const result = data[0];
            let linkInfo = this.linksArry(url, data).find(
              (link) => link.name === result.name
            );
            localStorage.setItem('tmpDB', `${linkInfo?.url()}`);
            let prems = {
              /* taxes */
              taxes: result.taxes,
              /* workers */
              workers: result.workers,
              /* customers */
              customers: result.customers,
              /* otherAcc */
              otherAcc: result.otherAcc,
              /* check */
              checksTrace: result.checksTrace,
              /* stock */
              stockes: result.stockes,
              stockeInv: result.stockeInv,
              stockeProd: result.stockeProd,
              /* trucks */
              addtruck: result.addtruck,
              truckList: result.truckList,
              /* truckCust */
              addTruckCust: result.addTruckCust,
              truckCustList: result.truckCustList,
              /* concrete */
              addconc: result.addconc,
              concInv: result.concInv,
              concbon: result.concbon,
              concCust: result.concCust,
              concFinan: result.concFinan,
              /* safe */
              safes: result.safes,
              addSafe: result.addSafe,
              safeInv: result.safeInv,
              /* premissions */
              edi: result.edi,
              expEdi: result.expEdi,
              del: result.del,
              prem: result.prem,
              dev: result.dev,
            };
            let n = {
              i: result.id,
              realName: result.realName,
              userPic: result.userPic,
            };

            sessionStorage.setItem('y', `${JSON.stringify(prems)}`);
            sessionStorage.setItem('n', `${JSON.stringify(n)}`);

            const checks = {
              check: sessionStorage.getItem('y'),
              uName: sessionStorage.getItem('n'),
            };

            if (checks.check) {
              this._auth.check = JSON.parse(checks.check);
              this._glopal.check = JSON.parse(checks.check);
            }
            if (checks.uName) this._auth.uName = JSON.parse(checks.uName);

            this._auth.isAuth = true;
            this._glopal.loading = false;
            this._router.navigate(['/Home']).then(() => {
              this._mainService.setNotification();
              setTimeout(() => {
                this._mainService.playIntro();
              }, 200);
            });

            this._auth.backUp();
          } else {
            this.formData.valid = {
              cond: false,
              msg: 'يجب التأكد من اسم المستخدم و كلمة السر',
            };
            this._auth.isAuth = false;
            this._glopal.loading = false;
            this._mainService.playDrumFail();
          }
        },
        (error) => {
          //its not error (backend responce done)
          this.formData.valid = {
            cond: false,
            msg: 'يجب التأكد من اسم المستخدم و كلمة السر',
          };
          this._auth.isAuth = false;
          this._glopal.loading = false;
          this._mainService.playDrumFail();
        }
      );
  }
}
