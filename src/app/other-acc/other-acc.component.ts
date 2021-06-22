import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MainService } from '../services/main.service';
import { GlobalVarsService } from '../services/global-vars.service';
import { SafeService } from '../services/safe.service';
import { OtherAcc } from '../classes/other-acc';
import { Chart } from 'chart.js';
import { FilterByDateDialogComponent } from '../dialogs/filter-by-date-dialog/filter-by-date-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-other-acc',
  templateUrl: './other-acc.component.html',
  styleUrls: ['./other-acc.component.scss'],
})
export class OtherAccComponent implements OnInit {
  listData: MatTableDataSource<any> | any;
  displayedColumns: string[] = ['accId', 'AccName', 'currentAccVal', 'edit'];

  searchDate: { from: string; to: string } = { from: '', to: '' };

  PieChart!: any;
  otherAcc: OtherAcc[] = [];

  isFiltered: boolean = false;

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  searchTxt: string = '';

  constructor(
    public _mainService: MainService,
    public _glopal: GlobalVarsService,
    public _dialog: MatDialog,
    public _safeService: SafeService
  ) {
    this._glopal.currentHeader = 'حسابات اخرى';
    this._glopal.loading = true;
  }

  ngOnInit(): void {
    window.addEventListener('resize', () => {
      this._mainService.handleTableHeight();
    });

    this.onStart();
  }

  onStart() {
    if (!this._glopal.loading) this._glopal.loading = true;
    this.getOtherAcc().then((data: OtherAcc[]) => {
      this.otherAcc = data;
      this.fillListData(data);
      this.generateChart(data.filter((acc: OtherAcc) => acc.currentAccVal > 0));
      this._mainService.handleTableHeight();
      this._glopal.loading = false;
    });
  }

  generateChart(data: OtherAcc[]) {
    Chart.defaults.global.defaultFontSize = 13;
    Chart.defaults.global.defaultFontFamily =
      '"Droid Arabic Kufi", "sans-serif"';

    this.PieChart = new Chart('pieChart', {
      type: 'doughnut',
      data: {
        labels: data.map((sub) => sub.AccName),
        datasets: [
          {
            label: 'المصاريف',
            data: data.map((sub) => sub.currentAccVal),
            maxBarThickness: 50,
            backgroundColor: this._glopal.colorPlate.map(
              (c: string) => `rgba(${c}, 0.8)`
            ),
            /* borderColor: colorPlate.map((c: string) => `rgba(${c})`), */
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true,
              },
            },
          ],
        },
      },
    });
  }

  updateChart(data: OtherAcc[]) {
    this.PieChart.data.datasets[0].data = data.map((sub) => sub.currentAccVal);
    this.PieChart.data.labels = data.map((sub) => sub.AccName)

    this.PieChart.update()
  }

  getOtherAcc(): Promise<OtherAcc[]> {
    return new Promise((res) => {
      this._safeService
        .getOtherAcc()
        .subscribe((data: OtherAcc[]) => res(data));
    });
  }

  getOtherAccByDate(from: string, to: string): Promise<OtherAcc[]> {
    return new Promise((res) => {
      this._safeService
        .getOtherAccByDate(from, to)
        .subscribe((data: OtherAcc[]) => res(data));
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
      if (result !== 'cancel')
        this.filterByDate(result.fromDate, result.toDate);
    });
  };

  filterByDate(from?: string, to?: string) {
    if (from && to) {
      if (!this._glopal.loading) this._glopal.loading = true;
      this.getOtherAccByDate(from, to).then((data: OtherAcc[]) => {
        this.otherAcc = data;
        this.fillListData(data);
        this.updateChart(
          data.filter((acc: OtherAcc) => acc.currentAccVal > 0)
        );
        this._mainService.handleTableHeight();
        this._glopal.loading = false;
        this.isFiltered = true;
      });
    } else {
      this.onStart();
      this.isFiltered = false;
    }
  }

  printDocument() {
    let search = this.searchTxt ? this.searchTxt : '';
    let printAcc = this.otherAcc.filter(
      (acc) =>
        acc.currentAccVal > 0
    );
    this.fillListData(printAcc);
    setTimeout(() => window.print(), 200);
  }
}
