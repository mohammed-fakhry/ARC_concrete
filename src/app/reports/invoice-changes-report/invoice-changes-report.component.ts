import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { Changedinvoice } from 'src/app/classes/changedinvoice';
import { MainService } from 'src/app/services/main.service';
import { GlobalVarsService } from 'src/app/services/global-vars.service';
import { StockService } from 'src/app/services/stock.service';
import { MatDialog } from '@angular/material/dialog';
import { FilterByDateDialogComponent } from 'src/app/dialogs/filter-by-date-dialog/filter-by-date-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-invoice-changes-report',
  templateUrl: './invoice-changes-report.component.html',
  styleUrls: ['./invoice-changes-report.component.scss'],
})
export class InvoiceChangesReportComponent implements OnInit {
  listData: MatTableDataSource<any> | any;
  displayedColumns: string[] = [
    'date_time',
    'transactionType',
    'stockName',
    'customerName',
    'oldPruductName',
    'productName',
    'oldQty',
    'Qty',
    'oldPrice',
    'price',
    'oldNotes',
    'changedDisc',
    'realName',
  ];
  changedIvoices: Changedinvoice[] = [];

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  searchTxt: string = '';
  isFiltered: boolean = false;

  constructor(
    public activeRoute: ActivatedRoute,
    public _mainService: MainService,
    public _glopal: GlobalVarsService,
    public _stockService: StockService,
    public _dialog: MatDialog,
    public _router: Router
  ) {
    this._glopal.loading = true;
    this._glopal.currentHeader = 'تقرير تعديل او حذف الفواتير';
  }

  ngOnInit(): void {
    window.addEventListener('resize', () => {
      this._mainService.handleTableHeight();
    });
    this.onStart();
  }

  onStart() {
    this.getChangedInvoices()
      .then((data: any) => {
        this.changedIvoices = data;
        this.fillListData(data);
        this._mainService.handleTableHeight();
        this._glopal.loading = false;
        // console.log(this.changedIvoices)
      })
      .then(() => {
        const searchFor = this.activeRoute.snapshot.paramMap.get('searchFor');
        if (searchFor) {
          this.searchTxt = searchFor;
          this.search();
        }
      });
  }

  getChangedInvoices() {
    return new Promise((res) => {
      this._stockService
        .changedinvoiceList()
        .subscribe((data: Changedinvoice[]) => res(data));
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
    if (from) {
      let start = `${from} 00:00`;
      let end = `${to} 23:59`;

      let newArr = this.changedIvoices.filter((invoice) => {
        return invoice.date_time >= start && invoice.date_time <= end;
      });

      this.isFiltered = true;
      this.fillListData(newArr);
    }
  }

  showAll() {
    this.isFiltered = false;
    this.fillListData(this.changedIvoices);
  }

  toInvoice(isDeletet: boolean, stockTransactionId: string) {
    if (!isDeletet) {
      this._router.navigate([`/StockInvoice/${stockTransactionId}`]);
    }
  }
}
