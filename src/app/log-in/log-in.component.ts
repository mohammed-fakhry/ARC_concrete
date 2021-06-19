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
    this.userNameDom = document.querySelector('#userName') as HTMLElement;
    window.onload = () => this.userNameDom.focus();
  }

  resetAuth() {
    sessionStorage.removeItem('y');
    sessionStorage.removeItem('n');
    this._auth.isAuth = false;
    this._auth.check = null;
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
          /* if (data.length > 0) {
            this._auth.isAuth = true;
            this._glopal.loading = false;
            this._router
              .navigate(['/Home'])
              .then(() => this._mainService.setNotification());
          } */

          if (data.length > 0) {
            const result = data[0];
            let linkInfo = this.linksArry(url, data).find(
              (link) => link.name === result.name
            );
            localStorage.setItem('tmpDB', `${linkInfo?.url()}`);
            let prems = {
              clients: result.clients,
              customers: result.customers,
              del: result.del,
              edi: result.edi,
              expEdi: result.edi,
              prem: result.prem,
              safes: result.safes,
              stockes: result.stockes,
              unites: result.unites,
              workers: result.workers,
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
            this._router
              .navigate(['/Home'])
              .then(() => this._mainService.setNotification());

            this._auth.backUp();
          } else {
            this.formData.valid = {
              cond: false,
              msg: 'يجب التأكد من اسم المستخدم و كلمة السر',
            };
            this._auth.isAuth = false;
            this._glopal.loading = false;
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
        }
      );
  }
}
