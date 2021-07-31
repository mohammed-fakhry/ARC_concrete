import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { MainService } from '../services/main.service';

@Injectable({
  providedIn: 'root'
})
export class WorkerGuard implements CanActivate {
  constructor(
    public _auth: AuthService,
    public _router: Router,
    public _snackBar: MatSnackBar,
    public _mainService: MainService,
  ) { }

  canActivate(): boolean {
    if (this._auth.check) {
      if (this._auth.check.workers) {
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
