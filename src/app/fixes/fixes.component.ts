import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { GlobalVarsService } from '../services/global-vars.service';
import { SafeService } from '../services/safe.service';
import { StockService } from '../services/stock.service';
import { Location } from '@angular/common';
import { StockTransaction } from '../classes/stock-transaction';
import { StockTransactionD } from '../classes/stock-transaction-d';
import { OtherAcc } from '../classes/other-acc';
import { SafeReceipt } from '../classes/safe-receipt';
import { DeleteDialogComponent } from '../dialogs/delete-dialog/delete-dialog.component';
import { MainService } from '../services/main.service';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-fixes',
  templateUrl: './fixes.component.html',
  styleUrls: ['./fixes.component.scss'],
})
export class FixesComponent implements OnInit {
  queryString: string = '';

  defaults = {
    mainUrl: 'http://localhost/accounting/',
  };

  db_changes = [
    'ALTER TABLE `customers` ADD `truckCustomerId` INT(11) NOT NULL AFTER `uncompletedCond`',
  ];

  url: string | null = localStorage.getItem('tmpDB');

  constructor(
    public _stockService: StockService,
    public _glopal: GlobalVarsService,
    public _safeService: SafeService,
    public _dialog: MatDialog,
    public _location: Location,
    public _mainService: MainService,
    private http: HttpClient,
    public _router: Router,
    public _snackBar: MatSnackBar,
    private _auth: AuthService
  ) {
    this._glopal.currentHeader = 'SystemFixes';
  }

  ngOnInit(): void {
    this.defaults.mainUrl = this.currentUrl();
  }

  currentUrl(cond?: string): string {
    if (cond) return 'http://localhost/shayman/';
    const storageUrl = localStorage.getItem('tmpDB');
    // if (storageUrl) return storageUrl
    return storageUrl ? storageUrl : 'http://localhost/accounting/';
  }

  changeMainUrl = (cond?: string) => {
    if (cond) this.defaults.mainUrl = this.currentUrl('setToAyman');
    localStorage.setItem('tmpDB', `${this.defaults.mainUrl}`);
    this._router.navigate(['/Home']).then(() => location.reload());
  };

  getStockTransAction() {
    return new Promise((res) => {
      this._stockService
        .getStockTransactionList()
        .subscribe((data: StockTransaction[]) => res(data));
    });
  }

  getStockTranseDetail() {
    return new Promise((res) => {
      this._stockService
        .getStockTransactionDetailsList()
        .subscribe((data: StockTransactionD[]) => {
          res(data);
        });
    });
  }

  getOtherAcc() {
    return new Promise((res) => {
      this._safeService
        .getOtherAcc()
        .subscribe((data: OtherAcc[]) => res(data));
    });
  }

  getSafesReceipts() {
    return new Promise((res) => {
      this._safeService
        .getSafesReceipt()
        .subscribe((data: SafeReceipt[]) => res(data));
    });
  }

  openDelDialog = (
    dataVals: {
      header: string;
      info: string;
      discription: string[];
      btn: string;
    },
    func: string
  ) => {
    let dialogRef = this._dialog.open(DeleteDialogComponent, {
      data: {
        header: dataVals.header,
        info: dataVals.info,
        discription: dataVals.discription,
        btn: dataVals.btn,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result == 'true') {
        if (func === 'fixStockTransactionId') this.fixStockTransactionId();
        if (func === 'fixSafeAccId') this.fixSafeAccId();
        if (func === 'sendSQL') this.sendSQL(this.queryString);
        if (func === 'autoQuery') this.autoQuery();
      }
    });
  };

  openFixDialog = (func: string) => {
    let data: {
      header: string;
      info: string;
      discription: string[];
      btn: string;
    };

    if (func === 'fixStockTransactionId') {
      data = {
        header: 'you must Do this steps first',
        info: `the functhion will loop over StockTransactionDetails table to equal
        StockTransactionDetails.stockTransactionId col with stockTransaction.stockTransactionId`,
        discription: [
          '1: remove primary key from stockTransaction.stockTransactionId',
          '2: add a new col to stockTransaction table with name (id) !make it as primaryKey',
          '3: do the fix functhion',
          '4: delete stockTransactionId col from backend (phpMyAdmin)',
          '5: rename (id) to stockTransactionId',
        ],
        btn: 'fixStockTransactionId',
      };
      this.openDelDialog(data, func);
    }

    if (func === 'fixSafeAccId') {
      data = {
        header: 'you must Do this steps first',
        info: `fix add accId to otherAcc table`,
        discription: [
          '1: Add a new col to otherAcc table named "accId"',
          '2: run the function',
        ],
        btn: 'fixSafeAccId',
      };
      this.openDelDialog(data, func);
    }

    if (func === 'sendSQL') {
      data = {
        header: 'make sure about your queryFirst',
        info: this.queryString,
        discription: [],
        btn: 'sendSQL',
      };
      this.openDelDialog(data, func);
    }

    if (func === 'autoQuery') {
      data = {
        header: 'make sure about your queryFirst',
        info: this.queryString,
        discription: this.db_changes,
        btn: 'send auto query',
      };
      this.openDelDialog(data, func);
    }
  };

  fixStockTransactionId() {
    /*
     * 1: remove primary key from stockTransaction.stockTransactionId
     * 2: add a new col to stockTransaction table with name (id) !make it as primaryKey
     * 3: do the fix functhion
     * 4: delete stockTransactionId col from backend (phpMyAdmin)
     * 5: rename (id) to stockTransactionId
     */

    /*
    the functhion will loop over StockTransactionDetails table to equal
    StockTransactionDetails.stockTransactionId col with stockTransaction.stockTransactionId
    */

    let detailArr: StockTransactionD[] = [];
    let tranceArry: any[] = [];

    Promise.all([this.getStockTransAction(), this.getStockTranseDetail()])
      .then((data: any[]) => {
        let result = {
          transe: data[0],
          detail: data[1],
        };

        detailArr = result.detail;
        tranceArry = result.transe;
      })
      .then(() => {
        for (let i = 0; i < detailArr.length; i++) {
          let found = tranceArry.find(
            (t) => detailArr[i].stockTransactionId == t.stockTransactionId
          );
          if (found) {
            detailArr[i].stockTransactionId = found.id;
            this._stockService
              .UpdateStockTransactionDetails(detailArr[i])
              .subscribe();
          }
        }
        this._glopal.loading = false;
      });
  }

  fixSafeAccId() {
    /* fix add accId to otherAcc table */

    this._glopal.loading = true;
    Promise.all([this.getOtherAcc(), this.getSafesReceipts()]).then(
      (data: any[]) => {
        let otherAccList: OtherAcc[] = data[0];
        let safeReceiptsList: SafeReceipt[] = data[1];

        for (let i = 0; i < safeReceiptsList.length; i++) {
          if (safeReceiptsList[i].AccName) {
            let accId =
              otherAccList.find(
                (a) => a.AccName === safeReceiptsList[i].AccName
              )?.accId ?? 0;
            if (accId) {
              safeReceiptsList[i].accId = accId;
              this._safeService
                .updateSafeReceipt(safeReceiptsList[i])
                .subscribe();
            }
          }
        }

        this._glopal.loading = false;
      }
    );
  }

  autoQuery() {
    for (let i = 0; i < this.db_changes.length; i++) {
      this.sendSQL(this.db_changes[i]);
    }
  }

  sendSQL(query: string) {
    this._mainService.postSqlQuery(query).subscribe(
      (data) => {
        console.log(data);
      },
      (error) => {
        console.log(error);
      }
    );
  }

  loadCond: string = 'tempFix';
  loopDetails = {
    length: 0,
    loop: 0,
  };

  tempFix_request(cond: string, data?: any) {
    if (cond == 'get')
      return this.http.get<any[]>(`${this.url}tempFix.php?get=1`);

    if (cond == 'post')
      return this.http.post(`${this.url}tempFix.php?post=1`, data);
    else
      return this.http.put(
        `${this.url}tempFix.php?id=${data.bonId}&put=1`,
        data,
        { responseType: 'text' }
      );
  }

  getTempData(): Promise<any[]> {
    return new Promise((res) => {
      this.tempFix_request('get').subscribe((data: any) => res(data));
    });
  }

  post_put_TempData(cond: string, data: any) {
    return new Promise((res) => {
      this.tempFix_request(cond, data).subscribe((data: any) => res(data));
    });
  }

  tempFix() {
    console.log('tempFix');
    /* this.getTempData().then((data: any[]) => {
      this.loadCond = '...loading';
      this.loopDetails.length = data.length;

      const processLoop = async () => {
        for (let i = 0; i < data.length; i++) {
          const PostData = {
            bonId: data[i].bonId,
            pumpId: data[i].pumpId,
          };

          const respon = await this.post_put_TempData('put', PostData);

          this.loopDetails.loop = i + 1;
        }
      };

      processLoop().then(() => (this.loadCond = 'done.'));
    }); */
  }

  // nowDate: string = '';
  setVersion() {
    const nowDate = this._mainService.makeTime_date(new Date(Date.now()));

    this._auth.read_write_Version(nowDate).subscribe((data: any) =>
      this._snackBar.open(`${data} | ${nowDate}`, 'اخفاء', {
        duration: 2500,
      })
    );
  }
}
