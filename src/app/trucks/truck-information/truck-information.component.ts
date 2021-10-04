import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { GlobalVarsService } from 'src/app/services/global-vars.service';
import { MainService } from 'src/app/services/main.service';
import { TruckService } from 'src/app/services/truck.service';
import { MatDialog } from '@angular/material/dialog';
import { FilterByDateDialogComponent } from 'src/app/dialogs/filter-by-date-dialog/filter-by-date-dialog.component';

@Component({
  selector: 'app-truck-information',
  templateUrl: './truck-information.component.html',
  styleUrls: ['./truck-information.component.scss'],
})
export class TruckInformationComponent implements OnInit {
  /*
  $ourTrucks[$cr]['id'] = $row['id'];
  $ourTrucks[$cr]['name'] = $row['name'];
  $ourTrucks[$cr]['number'] = $row['number'];
  $ourTrucks[$cr]['capacity'] = $row['capacity'];
  $ourTrucks[$cr]['truckType'] = $row['truckType'];
  $ourTrucks[$cr]['otherAccVals'] = (float)$row['otherAccVals'];
  $ourTrucks[$cr]['truckOrderVals'] = (float)$row['truckOrderVals'];
  $ourTrucks[$cr]['cashIn'] = (float)$row['cashIn'];
  */

  listData: MatTableDataSource<any> | any;
  displayedColumns: string[] = [
    /* 'id', */
    'name',
    'capacity',
    'truckType',
    'truckOrderVals',
    'otherAccVals',
    'cashIn',
    'netIncome',
  ];

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  searchTxt: string = '';

  counts: {
    works: number;
    expenses: number;
    cashIn: number;
  } = {
    works: 0,
    expenses: 0,
    cashIn: 0,
  };

  searchDate: { from: string; to: string } = { from: '', to: '' };
  isFiltered: boolean = false;

  constructor(
    public _mainService: MainService,
    public _glopal: GlobalVarsService,
    public _truckService: TruckService,
    public _dialog: MatDialog
  ) {
    this._glopal.currentHeader = 'مُعدات الشركة';
    this._glopal.loading = true;
  }

  ngOnInit(): void {
    window.addEventListener('resize', () => {
      this._mainService.handleTableHeight();
    });

    this.onStart();
  }

  onStart(from?: string, to?: string) {
    this.getOurtruckAcc(from, to).then((data) => {
      const sortedData = data.map((a: any) => {
        return {
          ...a,
          netIncome: a.truckOrderVals - a.otherAccVals - a.cashIn,
        };
      });

      this.fillListData(sortedData);
      this.counts = this.setCounts(data);
      this._glopal.loading = false;
      this._mainService.handleTableHeight();
    });
  }

  setCounts = (
    data: any[]
  ): {
    works: number;
    expenses: number;
    cashIn: number;
  } => {
    return {
      works: data.map((d) => d.truckOrderVals).reduce((a, b) => a + b, 0),
      expenses: data.map((d) => d.otherAccVals).reduce((a, b) => a + b, 0),
      cashIn: data.map((d) => d.cashIn).reduce((a, b) => a + b, 0),
    };
  };

  getOurtruckAcc(from?: string, to?: string): Promise<any[]> {
    return new Promise((res) => {
      this._truckService
        .ourTrucksAcc(from, to)
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

  openFilterDialog = (data: any) => {
    let dialogRef = this._dialog.open(FilterByDateDialogComponent, data);

    dialogRef.afterClosed().subscribe((result) => {
      if (result !== 'cancel') {
        this.searchDate = {
          from: result.fromDate,
          to: result.toDate,
        };
        this.filterByDate(result.fromDate, result.toDate);
      }
    });
  };

  filterByDate(from?: string, to?: string) {
    this.searchTxt = '';

    this._glopal.loading = true;

    if (from && to) {
      this.onStart(from, to);

      this.isFiltered = true;
    } else {
      this.onStart();
      this.searchDate = { from: '', to: '' };
      this.isFiltered = false;
    }
  }
}
