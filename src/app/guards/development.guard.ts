import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { MainService } from '../services/main.service';

@Injectable({
  providedIn: 'root'
})
export class DevelopmentGuard implements CanActivate {
  constructor(
    public _auth: AuthService,
    public _router: Router,
    public _mainService: MainService,
    public _snackBar: MatSnackBar
  ) { }

  canActivate(): boolean {
    if (this._auth.check) {
      if (this._auth.check.dev) {
        return true
      } else {
        this._snackBar.open(
          'لا توجد صلاحية للوصول'
          , 'اخفاء'
          , { duration: 2500 }
        )
        this._mainService.PlayDrumFail()
        return false
      }
    } else {
      this._router.navigate(['/LogIn']);
      return false
    }
  }

}
