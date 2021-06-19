import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { ChangedReciepts } from 'src/app/classes/changed-reciepts';
import { GlobalVarsService } from 'src/app/services/global-vars.service';
import { MainService } from 'src/app/services/main.service';
import { SafeService } from 'src/app/services/safe.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { FilterByDateDialogComponent } from 'src/app/dialogs/filter-by-date-dialog/filter-by-date-dialog.component';

@Component({
  selector: 'app-receipt-changes-list',
  templateUrl: './receipt-changes-list.component.html',
  styleUrls: ['./receipt-changes-list.component.scss'],
})
export class ReceiptChangesListComponent implements OnInit {
  listData: MatTableDataSource<any> | any;
  displayedColumns: string[] = [
    'date_time',
    'oldReceiptKind',
    'receiptKind',
    'oldSafeName',
    'safeName',
    'oldAccOrCustomer',
    'accOrCustomer',
    'oldReceiptVal',
    'receiptVal',
    'recieptNote',
    'changedType',
    'userRealName',
  ];

  changedReceipts: ChangedReciepts[] = [];

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  searchTxt: string = '';
  isFiltered: boolean = false;

  constructor(
    public activeRoute: ActivatedRoute,
    public _safeService: SafeService,
    public _glopal: GlobalVarsService,
    public _mainService: MainService,
    public _dialog: MatDialog,
    public _router: Router
  ) {
    this._glopal.loading = true;
    this._glopal.currentHeader = 'تقرير تعديل او حذف ايصالات النقدية';
  }

  ngOnInit(): void {
    window.addEventListener('resize', () => {
      this._mainService.handleTableHeight();
    });
    this.onStart();
  }

  onStart() {
    this.receiptChangesList()
      .then((data: ChangedReciepts[]) => {
        this.changedReceipts = data;
        this.fillListData(data);
        this._mainService.handleTableHeight();
        this._glopal.loading = false;
      })
      .then(() => {
        const searchFor = this.activeRoute.snapshot.paramMap.get('searchFor');
        if (searchFor) {
          this.searchTxt = searchFor;
          this.search();
        }
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

  receiptChangesList(): Promise<ChangedReciepts[]> {
    return new Promise((res) => {
      this._safeService
        .receiptChangesList()
        .subscribe((data: ChangedReciepts[]) => {
          res(data);
        });
    });
    //
  }

  filterByDate(from?: string, to?: string) {
    if (from) {
      let start = `${from} 00:00`;
      let end = `${to} 23:59`;

      let newArr = this.changedReceipts.filter((receipt) => {
        return receipt.date_time >= start && receipt.date_time <= end;
      });

      this.isFiltered = true;
      this.fillListData(newArr);
    }
  }

  showAll() {
    this.isFiltered = false;
    this.fillListData(this.changedReceipts);
  }

  toReceipt(isDeletet: boolean, receiptId: string) {
    if (!isDeletet) {
      this._router.navigate([`/SafeReceipt/${receiptId}`]);
    }
  }
}
