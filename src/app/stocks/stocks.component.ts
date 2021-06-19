import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MainService } from '../services/main.service';
import { GlobalVarsService } from '../services/global-vars.service';
import { Router } from '@angular/router';
import { StockService } from '../services/stock.service';
import { Stock } from '../classes/stock';

@Component({
  selector: 'app-stocks',
  templateUrl: './stocks.component.html',
  styleUrls: ['./stocks.component.scss'],
})
export class StocksComponent implements OnInit {
  fstNum!: number;
  sndNum!: number;
  result!: number;
  opreation!: string;
  logoImg: string = 'inventory.png'

  stocksLogo: HTMLElement = document.querySelector('#stocksLogo') as HTMLElement;

  listData: MatTableDataSource<any> | any;
  displayedColumns: string[] = ['stockName', 'edit'];

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  searchTxt: string = '';

  constructor(
    public _mainService: MainService,
    public _glopal: GlobalVarsService,
    public _router: Router,
    public _stockService: StockService
  ) {
    this._glopal.currentHeader = 'بيانات المخازن';
    this._glopal.loading = true;
  }

  ngOnInit(): void {
    window.addEventListener('resize', () => {
      this._mainService.handleTableHeight();
    });

    this.getStocks().then((data: any) => {
      this.fillListData(data);
      this._mainService.handleTableHeight();
      this._glopal.loading = false;
    });


    this.stocksLogo = document.querySelector('#stocksLogo') as HTMLElement;
  }

  getStocks() {
    return new Promise((res) => {
      this._stockService.getStockes().subscribe((data: Stock[]) => res(data));
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

  changeLogo(ind: any) {
    // this.transLogoEffect()
    if (ind == 1) {
      this._glopal.currentHeader = 'بيانات الاصناف';
      this.logoImg = "supplyGoods.png"
    }
    if (ind == 0) {
      this.logoImg = 'inventory.png'
      this._glopal.currentHeader = 'بيانات المخازن';
    }
  }

  transLogoEffect(ind: any) {
    this._mainService.handleTableHeight();
    if (this.stocksLogo) {
      this.stocksLogo.style.top = "-100%"
      setTimeout(() => {
        this.changeLogo(ind)
        this.stocksLogo.style.top = "0"
      },350)
    }
  }
}
