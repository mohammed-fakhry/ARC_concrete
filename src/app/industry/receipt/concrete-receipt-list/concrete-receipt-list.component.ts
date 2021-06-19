import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MainService } from 'src/app/services/main.service';
import { GlobalVarsService } from 'src/app/services/global-vars.service';
import { Router } from '@angular/router';
import { ConcreteService } from 'src/app/services/concrete.service';

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
    public _concrete: ConcreteService
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

  /*
  {
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

  "concreteId": "1",
  "concreteCustomer_id": "1",
  "stockTransactionId": "31",
  },
  */

  onStart() {
    this.getList()
      .then((data: any[]) => {
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
}
