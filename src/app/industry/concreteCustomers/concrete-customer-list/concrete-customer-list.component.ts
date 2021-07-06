import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { ConcreteCustomer } from 'src/app/classes/concrete-customer';
import { MainService } from 'src/app/services/main.service';
import { GlobalVarsService } from 'src/app/services/global-vars.service';
import { ConcreteService } from 'src/app/services/concrete.service';

@Component({
  selector: 'app-concrete-customer-list',
  templateUrl: './concrete-customer-list.component.html',
  styleUrls: ['./concrete-customer-list.component.scss'],
})
export class ConcreteCustomerListComponent implements OnInit {
  listData: MatTableDataSource<any> | any;
  displayedColumns: string[] = ['fullName', 'currentVal', 'edit'];

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  searchTxt: string = '';

  customerList: ConcreteCustomer[] = [];

  totalCurrentVal: number = 0;

  constructor(
    public _mainService: MainService,
    public _glopal: GlobalVarsService,
    public _concrete: ConcreteService
  ) {
    this._glopal.currentHeader = 'بيانات عملاء خرسانة';
    this._glopal.loading = true;
  }

  ngOnInit(): void {
    window.addEventListener('resize', () => {
      this._mainService.handleTableHeight();
    });

    this.onStart();
  }

  onStart() {
    this.getCustomers()
      .then((data: ConcreteCustomer[]) => {
        this.customerList = data;
        // currentVal

        this.totalCurrentVal = this.customerList
          .map((a) => a.currentVal)
          .reduce((a, b) => a + b, 0);
        this.fillListData(data);
        this._glopal.loading = false;
      })
      .then(() => {
        this._mainService.handleTableHeight();
      });
  }

  getCustomers(): Promise<ConcreteCustomer[]> {
    return new Promise((res) => {
      this._concrete
        .concreteCustomerList()
        .subscribe((data: ConcreteCustomer[]) => {
          res(data);
        });
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
