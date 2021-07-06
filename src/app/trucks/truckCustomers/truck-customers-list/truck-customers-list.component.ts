import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { GlobalVarsService } from 'src/app/services/global-vars.service';
import { MainService } from 'src/app/services/main.service';
import { TruckService } from 'src/app/services/truck.service';
import { TruckCustomer } from 'src/app/classes/truck-customer';

@Component({
  selector: 'app-truck-customers-list',
  templateUrl: './truck-customers-list.component.html',
  styleUrls: ['./truck-customers-list.component.scss'],
})
export class TruckCustomersListComponent implements OnInit {
  listData: MatTableDataSource<any> | any;

  /*
  adress: "القاهرة"
  currentVal: 8500
  fullName: "عميل تجريبى"
  id: "2"
  notes: "القاهرة"
  openedVal: 0
  tell: ""
  */
  displayedColumns: string[] = ['fullName', 'currentVal', 'edit'];

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  searchTxt: string = '';

  customerList: TruckCustomer[] = [];
  totalCurrentVals: number = 0;

  constructor(
    public _mainService: MainService,
    public _glopal: GlobalVarsService,
    public _truckService: TruckService
  ) {
    this._glopal.loading = true;
    this._glopal.currentHeader = 'بيان عملاء المعدات';
  }

  ngOnInit(): void {
    this.onStart();
  }

  onStart() {
    this.customerList = [];

    this.getCustomers().then((data: TruckCustomer[]) => {
      this.customerList = data.filter(
        (cust) => cust.fullName != 'نقلات من المخزن'
      );

      this.totalCurrentVals = this.customerList.map((a) => a.currentVal).reduce((a, b) => a + b, 0);
      this.fillListData(this.customerList);
      this._glopal.loading = false;

      // currentVal
    });
  }

  getCustomers(): Promise<TruckCustomer[]> {
    return new Promise((res) => {
      this._truckService
        .truckCustomersList()
        .subscribe((data: TruckCustomer[]) => res(data));
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
