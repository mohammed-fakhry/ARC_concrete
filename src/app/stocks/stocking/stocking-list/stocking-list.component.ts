import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { GlobalVarsService } from 'src/app/services/global-vars.service';
import { StockingService } from 'src/app/services/stocking.service';
import { MainService } from 'src/app/services/main.service';

@Component({
  selector: 'app-stocking-list',
  templateUrl: './stocking-list.component.html',
  styleUrls: ['./stocking-list.component.scss'],
})
export class StockingListComponent implements OnInit {
  listData: MatTableDataSource<any> | any;
  displayedColumns: string[] = ['stockingId','stockingDate', 'stockingNote'];
  stockingList: any[] = [];

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  searchTxt: string = '';

  constructor(
    public _mainService: MainService,
    public _glopal: GlobalVarsService,
    public _stockingService: StockingService
  ) {
    this._glopal.currentHeader = 'تقارير الجرد الفعلى للمخازن';
    this._glopal.loading = true;
  }

  ngOnInit(): void {
    window.addEventListener('resize', () => {
      this._mainService.handleTableHeight();
    });

    this.onStart();
  }

  onStart() {
    this.getStockingList().then((data: any) => {
      this.stockingList = data;
      this.fillListData(data);
      this._mainService.handleTableHeight();
      this._glopal.loading = false;
    });
  }

  getStockingList() {
    return new Promise((res) => {
      this._stockingService.stockingList().subscribe((data: any) => res(data));
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

  /*  getStockingList() {
    return new Promise((res) => {
      this._stockingService.stockingList().subscribe((data: any) => res(data)
    )
  } */
}
