import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { GlobalVarsService } from 'src/app/services/global-vars.service';
import { MainService } from 'src/app/services/main.service';
import { TaxesService } from 'src/app/services/taxes.service';
import { FilterByDateDialogComponent } from 'src/app/dialogs/filter-by-date-dialog/filter-by-date-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-add-taxes-list',
  templateUrl: './add-taxes-list.component.html',
  styleUrls: ['./add-taxes-list.component.scss'],
})
export class AddTaxesListComponent implements OnInit {
  mainData: any;
  listData_invoices: MatTableDataSource<any> | any;
  listData_invoices_toUs: MatTableDataSource<any> | any;
  listData_concretes: MatTableDataSource<any> | any;

  headerTotals = {
    mainTotals: {
      header: ' اجماليات النشاط',
      totalVals: 0,
      addTaxesVal: 0,
      addTaxesVal_toUs: 0,
    },
    taxesTotals: [
      {
        header: 'اجماليات التوريدات',
        totalVals: 0,
        addTaxesVal: 0,
        totalVals_toUs: 0,
        addTaxesVal_toUs: 0,
      },
      {
        header: 'اجماليات محطة الخرسانة',
        totalVals: 0,
        addTaxesVal: 0,
      },
    ],
  };

  displayedColumns: string[] = [
    'date_time',
    'receiptDetails',
    'customerName',
    'invoiceTotal',
    'addTaxesVal',
  ];

  searchTxt_invoices: string = '';
  searchTxt_concretes: string = '';
  searchTxt_invoices_toUs: string = '';

  isFiltered: boolean = false;

  searchDate: { from: string; to: string } = { from: '', to: '' };

  /* @ViewChild(MatSort) sortInvoices!: MatSort;
  @ViewChild(MatPaginator) paginatorInvoices!: MatPaginator;

  @ViewChild(MatSort) sortConcrete!: MatSort;
  @ViewChild(MatPaginator) paginatorConcrete!: MatPaginator; */

  @ViewChild('sort_invoices', { static: true }) sort_invoices!: MatSort;
  @ViewChild('paginator_invoices', { static: true })
  paginator_invoices!: MatPaginator;

  @ViewChild('sort_invoices_toUs', { static: true })
  sort_invoices_toUs!: MatSort;
  @ViewChild('paginator_invoices_toUs', { static: true })
  paginator_invoices_toUs!: MatPaginator;

  @ViewChild('sort_concretes', { static: true }) sort_concretes!: MatSort;
  @ViewChild('paginator_concretes', { static: true })
  paginator_concretes!: MatPaginator;

  constructor(
    public _mainService: MainService,
    public _glopal: GlobalVarsService,
    public _taxesService: TaxesService,
    public _dialog: MatDialog
  ) {
    this._glopal.currentHeader = 'تقرير الضرائب';
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

    this.getAddTaxes().then((data: any) => {
      this.mainData = data;
      this.fillListData(data);
      this._mainService.handleTableHeight();
      this._glopal.loading = false;
    });
  }

  getAddTaxes() {
    return new Promise((res) => {
      this._taxesService.addTaxesList().subscribe((data: any) => res(data));
    });
  }

  fillListData = (data: any) => {
    this.listData_invoices = new MatTableDataSource(data.receiptTaxes);
    this.listData_invoices.sort = this.sort_invoices;
    this.listData_invoices.paginator = this.paginator_invoices;

    this.listData_invoices_toUs = new MatTableDataSource(
      data.receiptTaxes_toUs
    );
    this.listData_invoices.sort = this.sort_invoices_toUs;
    this.listData_invoices.paginator = this.paginator_invoices_toUs;

    this.listData_concretes = new MatTableDataSource(data.concreteTaxes);
    this.listData_concretes.sort = this.sort_concretes;
    this.listData_concretes.paginator = this.paginator_concretes;

    this.setHeaderTotals(data);
  };

  setHeaderTotals(data: any) {
    /*
      header: 'اجماليات التوريدات',
      totalVals: 0,
      addTaxesVal: 0,
      totalVals_toUs: 0,
      addTaxesVal_toUs: 0,
    */
    for (let i = 0; i < this.headerTotals.taxesTotals.length; i++) {
      if (this.headerTotals.taxesTotals[i].header == 'اجماليات محطة الخرسانة') {
        this.headerTotals.taxesTotals[i].addTaxesVal =
          data.concreteTaxes.reduce((a: any, b: any) => a + b.addTaxesVal, 0);

        this.headerTotals.taxesTotals[i].totalVals = data.concreteTaxes.reduce(
          (a: any, b: any) => a + b.invoiceTotal,
          0
        );
      }

      if (this.headerTotals.taxesTotals[i].header == 'اجماليات التوريدات') {
        this.headerTotals.taxesTotals[i].addTaxesVal = data.receiptTaxes.reduce(
          (a: any, b: any) => a + b.addTaxesVal,
          0
        );

        this.headerTotals.taxesTotals[i].totalVals = data.receiptTaxes.reduce(
          (a: any, b: any) => a + b.invoiceTotal,
          0
        );

        this.headerTotals.taxesTotals[i].addTaxesVal_toUs =
          data.receiptTaxes_toUs.reduce(
            (a: any, b: any) => a + b.addTaxesVal,
            0
          );

        this.headerTotals.taxesTotals[i].totalVals_toUs =
          data.receiptTaxes_toUs.reduce(
            (a: any, b: any) => a + b.invoiceTotal,
            0
          );

        this.headerTotals.mainTotals.addTaxesVal_toUs =
          this.headerTotals.taxesTotals[i]?.addTaxesVal_toUs ?? 0;
      }

      this.headerTotals.mainTotals.addTaxesVal =
        this.headerTotals.taxesTotals.reduce(
          (a: any, b: any) => a + b.addTaxesVal,
          0
        );
      this.headerTotals.mainTotals.totalVals =
        this.headerTotals.taxesTotals.reduce(
          (a: any, b: any) => a + b.totalVals,
          0
        );
    }
  }

  scrollTo(header: string) {
    if (header == 'اجماليات محطة الخرسانة') {
      this._mainService.scrollTo('listData_concretes');
    }

    if (header == 'اجماليات التوريدات') {
      this._mainService.scrollTo('listData_invoices');
    }
  }

  search(cond: string) {
    if (cond == 'listData_invoices')
      this.listData_invoices.filter = this.searchTxt_invoices;

    if (cond == 'listData_concretes')
      this.listData_concretes.filter = this.searchTxt_concretes;

    if (cond == 'listData_invoices_toUs')
      this.listData_invoices_toUs.filter = this.searchTxt_invoices_toUs;
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
    this.searchTxt_concretes = '';
    this.searchTxt_invoices = '';

    if (from) {
      let start = `${from} 00:00`;
      let end = `${to} 23:59`;

      let tempData = {
        receiptTaxes: this.mainData.receiptTaxes.filter((acc: any) => {
          return acc.date_time >= start && acc.date_time <= end;
        }),
        concreteTaxes: this.mainData.concreteTaxes.filter((acc: any) => {
          return acc.date_time >= start && acc.date_time <= end;
        }),
      };

      /* let newArr = this.accArr.filter((acc) => {
        return acc.date_time >= start && acc.date_time <= end;
      }); */

      this.isFiltered = true;
      this.fillListData(tempData);
    }
  }

  filterList(cond: string) {
    this.searchTxt_concretes = '';
    this.searchTxt_invoices = '';

    if (cond == 'showAll') {
      this.isFiltered = false;
      this.fillListData(this.mainData);
      this.searchDate = { from: '', to: '' };
    }
  }
}
