import { HttpClient, JsonpClientBackend } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { UserData } from '../classes/user-data';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  checkSession: any = sessionStorage.getItem('y');
  checkUName: any = sessionStorage.getItem('n');
  check: any = JSON.parse(this.checkSession);
  uName: any = JSON.parse(this.checkUName);
  isAuth = false;

  constructor(private http: HttpClient, public _router: Router) {}

  getUsersPromise() {
    return new Promise((res, rej) => {
      this.getUsers().subscribe(
        (data: UserData[]) => {
          res(data);
        },
        (error) => {
          if (error.status == 200) {
            rej('برجاء التأكد من الاتصال بالخادم و اعادة المحاولة');
          }
        }
      );
    });
  }

  returnLog() {
    this.checkSession = sessionStorage.getItem('y');
    this.check = JSON.parse(this.checkSession);
    if (this.check) {
      this.isAuth = true;
    } else {
      this._router.navigate(['/LogIn']);
    }
  }

  logged() {
    this.checkSession = sessionStorage.getItem('y');
    this.check = JSON.parse(this.checkSession);
    return !!this.check;
  }

  theMainUrl() {
    return window.location.href.includes('localhost')
      ? 'http://localhost/auth_concrete/'
      : 'http://192.168.1.118/auth_concrete/';
  }

  readVersion() {
    let url = this.theMainUrl();
    return this.http.get<any>(`${url}readVersionDocument.php`);
  }

  getUser = (name: string, auth: string) => {
    let url = this.theMainUrl();
    return this.http.get<UserData[]>(
      `${url}getUsers.php?name=${name}&auth=${auth}`
    );
  };

  getUsers(id?: string) {
    let url = this.theMainUrl();
    if (id) return this.http.get<UserData[]>(`${url}getUser.php?id=${id}`);
    return this.http.get<UserData[]>(`${url}getUser.php`);
  }

  creatUser(user: UserData) {
    let url = this.theMainUrl();
    return this.http.post(`${url}postUser.php`, user);
  }

  updateUser(user: UserData, noChangePass?: string) {
    let url = this.theMainUrl();
    if (noChangePass)
      return this.http.put(
        `${url}updateUser.php?id=${user.id}&noChangePass=1`,
        user
      );
    return this.http.put(`${url}updateUser.php?id=` + user.id, user);
  }

  backUp() {
    let url = this.theMainUrl();
    return this.http.get<any>(
      `${url}backup.php?userName=${this.uName?.realName}`
    );
  }
}
