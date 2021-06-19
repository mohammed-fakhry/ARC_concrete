import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { GlobalVarsService } from 'src/app/services/global-vars.service';
import { MainService } from 'src/app/services/main.service';
import { ConcreteService } from 'src/app/services/concrete.service';
import { Concrete } from 'src/app/classes/concrete';
import { ThrowStmt } from '@angular/compiler';

@Component({
  selector: 'app-concrete-list',
  templateUrl: './concrete-list.component.html',
  styleUrls: ['./concrete-list.component.scss']
})
export class ConcreteListComponent implements OnInit {

  listData: MatTableDataSource<any> | any;
  displayedColumns: string[] = ['name', 'edit'];

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  searchTxt: string = '';

  constructor(
    public _mainService: MainService,
    public _glopal: GlobalVarsService,
    public _concrete: ConcreteService,
  ) {
    this._glopal.currentHeader = "الخرسانة"
    this._glopal.loading = true;
  }

  ngOnInit(): void {
    window.addEventListener('resize', () => {
      this._mainService.handleTableHeight();
    });

    this.onStart()
  }

  onStart() {
    if (this._glopal.loading == false) this._glopal.loading = true

    this.getConcretes().then((data: Concrete[]) => {
      this.fillListData(data)

      this._mainService.handleTableHeight()
      this._glopal.loading = false
    })
  }

  getConcretes(): Promise<Concrete[]> {
    return new Promise((res) => {
      this._concrete.concreteList().subscribe((data :Concrete[]) => res(data))
    })
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
