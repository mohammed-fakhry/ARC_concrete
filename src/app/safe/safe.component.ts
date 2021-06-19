import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MainService } from '../services/main.service';
import { GlobalVarsService } from '../services/global-vars.service';
import { SafeService } from '../services/safe.service';
import { Router } from '@angular/router';
import { SafeData } from '../classes/safe-data';

@Component({
  selector: 'app-safe',
  templateUrl: './safe.component.html',
  styleUrls: ['./safe.component.scss'],
})
export class SafeComponent implements OnInit {
  listData: MatTableDataSource<any> | any;
  displayedColumns: string[] = ['safeName', 'currentSafeVal', 'edit'];

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  searchTxt: string = '';

  constructor(
    public _mainService: MainService,
    public _glopal: GlobalVarsService,
    public _safeService: SafeService,
    public _router: Router
  ) {
    this._glopal.currentHeader = 'الخزنة';
    this._glopal.loading = true;
  }

  ngOnInit(): void {
    window.addEventListener('resize', () => {
      this._mainService.handleTableHeight();
    });

    this.getSafes().then((data: any) => {
      this.fillListData(data);
      this._mainService.handleTableHeight();
      this._glopal.loading = false;
    });
  }

  search() {
    this.listData.filter = this.searchTxt;
  }

  getSafes() {
    return new Promise((res) => {
      this._safeService.getSafes().subscribe((data: SafeData[]) => {
        res(data);
      });
    });
  }

  fillListData = (data: any) => {
    this.listData = new MatTableDataSource(data);
    this.listData.sort = this.sort;
    this.listData.paginator = this.paginator;
  };
}
