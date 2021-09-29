import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    public _auth: AuthService,
    public _router: Router
  ) { }

  canActivate(): boolean {
    if (this._auth.logged()) {
      return true
    } else {
      this._router.navigate(['/LogIn']);
      return false
    }
  }

}
