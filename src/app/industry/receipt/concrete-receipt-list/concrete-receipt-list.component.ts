import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MainService } from 'src/app/services/main.service';
import { GlobalVarsService } from 'src/app/services/global-vars.service';
import { Router } from '@angular/router';
import { ConcreteService } from 'src/app/services/concrete.service';
import { TruckService } from 'src/app/services/truck.service';
import { StockService } from 'src/app/services/stock.service';

@Component({
  selector: 'app-concrete-receipt-list',
  templateUrl: './concrete-receipt-list.component.html',
  styleUrls: ['./concrete-receipt-list.component.scss'],
})
export class ConcreteReceiptListComponent implements OnInit {
  listData: MatTableDataSource<any> | any;

  /*
     "date__time": "2021-06-07T20:11",
     "concreteReceipt_id": "4",
    "concretecCustomerName": "المرشدى"
    "concreteName": "150/250",
    "concreteQty": 20,
    "concretePrice": 100,
    "discound": 1,
    "total": 13543.2,
    "totalDiscound": "14",
    "notes": "",
  */
  displayedColumns: string[] = [
    'date__time',
    'concreteReceipt_id',
    'concretecCustomerName',
    'concreteName',
    'concreteQty',
    'concretePrice',
    'discound',
    'total',
    'totalDiscound',
    'notes',
  ];

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  searchTxt: string = '';

  constructor(
    public _mainService: MainService,
    public _glopal: GlobalVarsService,
    public _router: Router,
    public _concrete: ConcreteService,
    public _truckService: TruckService,
    public _stockService: StockService
  ) {
    this._glopal.currentHeader = 'بيان اذون الخرسانة';
    this._glopal.loading = true;
  }

  ngOnInit(): void {
    window.addEventListener('resize', () => {
      this._mainService.handleTableHeight();
    });

    this.onStart();
  }

  tempList: any[] = [];

  onStart() {
    this.getList()
      .then((data: any[]) => {
        this.tempList = data;
        this.fillListData(data.reverse());
      })
      .then(() => {
        this._mainService.handleTableHeight();
        this._glopal.loading = false;
      });
  }

  getList(): Promise<any[]> {
    return new Promise((res) => {
      this._concrete
        .concreteReceiptList()
        .subscribe((data: any[]) => res(data));
    });
  }

  fillListData = (data: any) => {
    this.listData = new MatTableDataSource(data);
    this.listData.sort = this.sort;
    this.listData.paginator = this.paginator;
  };

  search() {
    this.listData.filter = this.searchTxt;
  }

  delCount: number = 0;
  allDetailsCount: number = 0;
  prosessDel: boolean = false;

  /* handleRecordedConcretes_stock() {
    this._glopal.loading = true;
    this._concrete
      .allconcreteReceipts()
      .subscribe((data: ConcreteReceipt[]) => {
        this.updateStocktarnsactionStockId(data);
        this._glopal.loading = false;
      });
  }

  updateStocktarnsactionStockId(concreteReceipts: ConcreteReceipt[]) {
    for (let i = 0; i < concreteReceipts.length; i++) {
      console.log(i);
      if (concreteReceipts[i]?.stockTransaction?.stockId) {
        concreteReceipts[i].stockTransaction.stockId = 11;

        this._stockService
          .UpdateStockTransaction(concreteReceipts[i].stockTransaction)
          .subscribe();
      }
    }
  } */

  /* delTranceDetail = (id: number) => {
    return new Promise((res) => {
      this._stockService
        .deleteStockTransactionDetails(id)
        .subscribe(() => res('done'));
    });
  };

  delReceipteDetail = (id: string | null) => {
    return new Promise((res) => {
      if (id)
        this._concrete
          .delConcreteReceiptDetail(id)
          .subscribe(() => res('done'));
    });
  };

  deleteInvoices(concreteReceipts: ConcreteReceipt[]) {
    const filteredReceipts = concreteReceipts.filter(
      (r) => r.stockTransactionD.length > 0
    );
    for (let i = 0; i < filteredReceipts.length; i++) {
      const receipt = filteredReceipts[i];
      this.allDetailsCount = receipt.stockTransactionD.length;

      const processLoop_receiptDetail = async () => {
        for (let d = 0; d < receipt.stockTransactionD.length; d++) {
          if (receipt.stockTransactionD[d].stockTransactionDetailsId) {
            this._truckService
              .deleteTruckOrder(
                receipt.stockTransactionD[d].stockTransactionDetailsId,
                'transId'
              )
              .subscribe();
          }

          const personId = await this.delTranceDetail(
            receipt.stockTransactionD[d].stockTransactionDetailsId
          );

          this.delCount = i + 1;
        }
      };

      processLoop_receiptDetail().then(() => {
        if (receipt.stockTransaction.stockTransactionId)
          this._stockService
            .deleteStockTransaction(
              parseInt(receipt.stockTransaction.stockTransactionId)
            )
            .subscribe(() => {
              console.log('stockDone');
              if (i == filteredReceipts.length - 1)
                this.deleteReceipts(concreteReceipts);
            });
      });
    }
  }

  deleteReceipts(concreteReceipts: ConcreteReceipt[]) {
    const filteredReceipts = concreteReceipts.filter(
      (r) => r.receiptDetails.length > 0
    );

    this.allDetailsCount = filteredReceipts.length;

    for (let i = 0; i < filteredReceipts.length; i++) {
      const receipt = filteredReceipts[i];

      const processLoop_receiptDetail = async () => {
        for (let d = 0; d < receipt.receiptDetails.length; d++) {
          const personId = await this.delReceipteDetail(
            receipt.receiptDetails[d].id
          );

          this.delCount = i + 1;
        }
      };

      processLoop_receiptDetail().then(() => {
        if (receipt.concreteReceipt_id)
          this._concrete
            .delConcreteReceipt(receipt.concreteReceipt_id)
            .subscribe(() => {
              console.log('alldone');
            });
      });
    }
  } */
}
