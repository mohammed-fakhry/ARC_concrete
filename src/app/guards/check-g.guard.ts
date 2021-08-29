import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MainService } from '../services/main.service';

@Injectable({
  providedIn: 'root'
})
export class CheckGGuard implements CanActivate {
  constructor(
    public _auth: AuthService,
    public _router: Router,
    public _snackBar: MatSnackBar,
    public _mainService: MainService,
  ) { }

  canActivate(): boolean {
    if (this._auth.check) {
      if (this._auth.check.checksTrace) {
        return true
      } else {
        this._snackBar.open(
          'لا توجد صلاحية للوصول'
          , 'اخفاء'
          , { duration: 2500 }
        )
        this._mainService.playDrumFail()
        return false
      }
    } else {
      this._router.navigate(['/LogIn']);
      return false
    }
  }

}
