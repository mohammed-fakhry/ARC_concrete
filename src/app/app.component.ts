import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterOutlet } from '@angular/router';
import { SearchInvoiceDialogComponent } from './dialogs/search-invoice-dialog/search-invoice-dialog.component';
import { AuthService } from './services/auth.service';
import { CheckService } from './services/check.service';
import { GlobalVarsService } from './services/global-vars.service';
import { MainService } from './services/main.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'ARC';
  opened = false;

  /* important */
  expansionPanel = [
    { name: 'database', opened: false }, // 0
    { name: 'Acc', opened: false }, // 1
    { name: 'money', opened: false }, // 2
    { name: 'stocks', opened: false }, // 3
    { name: 'industry', opened: false }, // 4
    { name: 'trucks', opened: false }, // 5
    { name: 'reports', opened: false }, // 6
    { name: 'settings', opened: false }, // 7
    { name: 'support', opened: false }, // 8
  ];

  bodyScroll: number = 0;
  mainUrl: string = '';

  constructor(
    public _router: Router,
    public _auth: AuthService,
    public _glopal: GlobalVarsService,
    public _snackBar: MatSnackBar,
    public _dialog: MatDialog,
    public _mainService: MainService
  ) {}

  ngOnInit() {
    document.addEventListener('keydown', (e) => {
      if (e.key == 'F2') {
        if (this._router.url != '/LogIn' && this._router.url != '/CaherReceipt')
          this.opened = !this.opened;
      }
      if (e.key == 'F9') {
        if (!this._glopal.loading) this.backUp();
      }
    });

    if (this._glopal.check) this._mainService.setNotification();

    this.mainUrl = this.currentUrl()
  }

  currentUrl(): string {
    const storageUrl = localStorage.getItem('tmpDB');
    //if (storageUrl) return storageUrl
    return storageUrl ? storageUrl : 'http://localhost/accounting/';
  }

  out() {
    sessionStorage.removeItem('y');
    sessionStorage.removeItem('n');
    this._router.navigate(['/LogIn']);
  }

  openSearchDialog = (cond: string) => {
    this._glopal.loading = true;

    let dialogRef = this._dialog.open(SearchInvoiceDialogComponent, {
      data: `${cond}`,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.opened = !this.opened;
      this.doTheRoute(result, cond);
    });
  };

  doTheRoute(result: string, cond: string) {
    // "cond" is the reson of search
    // "result" will be the route id or newReciept
    let childLink =
      result != undefined && result != 'newReciept' ? `/${result}` : '';

    const condArr = [
      { cond: 'users', router: `/UserSettings${childLink}` },
      { cond: 'stockInvoice', router: `/StockInvoice${childLink}` },
      { cond: 'safeReceipt', router: `/SafeReceipt${childLink}` },
      { cond: 'ProductsProfits', router: `/ProductsProfits${childLink}` },
      { cond: 'stockingDetails', router: `/Stocking${childLink}` },
      {
        cond: 'outInvoices',
        router: `/invoiceReport/invoiceOut/2${childLink}`,
      },
      {
        cond: 'inInvoices',
        router: `/invoiceReport/invoiceIn/1${childLink}`,
      },
      {
        cond: 'invoiceAll',
        router: `/invoiceReport/invoiceAll/0${childLink}`,
      },
    ];

    let routeLink = condArr.find((c) => c.cond === cond);
    if (routeLink && result != undefined)
      this._router.navigate([`${routeLink.router}`]);
  }

  goBack() {
    window.history.back();
  }

  hRefTo(url: string) {
    window.location.href = url;
  }

  backUp() {
    this._glopal.loading = true;
    this._auth.backUp().subscribe(() => {
      this._snackBar.open('تم حفظ النسخة الاحتياطية', 'اخفاء', {
        duration: 2500,
      });
      this._glopal.loading = false;
    });
    this.opened = false;
  }

  prepareRoute(outlet: RouterOutlet) {
    return (
      outlet && outlet.activatedRouteData && outlet.activatedRouteData.animation
    );
  }
}
