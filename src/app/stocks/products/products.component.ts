import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { Product } from 'src/app/classes/product';
import { MainService } from 'src/app/services/main.service';
import { GlobalVarsService } from 'src/app/services/global-vars.service';
import { StockService } from 'src/app/services/stock.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { DynamicInputDialogComponent } from 'src/app/dialogs/dynamic-input-dialog/dynamic-input-dialog.component';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
})
export class ProductsComponent implements OnInit {
  listData: MatTableDataSource<any> | any;
  displayedColumns: string[] = ['productName', 'productCategory', 'edit'];
  produsctsList: Product[] = [];

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  searchTxt: string = '';

  constructor(
    public _mainService: MainService,
    public _glopal: GlobalVarsService,
    public _stockService: StockService,
    public _dialog: MatDialog,
    public _snackBar: MatSnackBar,
    public _router: Router
  ) {
    this._glopal.loading = true;
  }

  ngOnInit(): void {
    window.addEventListener('resize', () => {
      this._mainService.handleTableHeight();
    });

    this.getProducts().then((data: any) => {
      this.produsctsList = data;
      this.fillListData(data);
      this._mainService.handleTableHeight();
      this._glopal.loading = false;
    });
  }

  getProducts() {
    return new Promise((res) => {
      this._stockService.getProduct().subscribe((data: Product[]) => res(data));
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

  openDynamicDialog = () => {
    let data = {
      from: '',
      to: '',
    };
    let dialogRef = this._dialog.open(DynamicInputDialogComponent, {
      data: data,
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.spliceProducts(result);
      }
    });
  };

  openSnake(message: string) {
    this._snackBar.open(message, 'اخفاء', {
      duration: 3000,
    });
  }

  spliceProducts(result: any) {
    this._glopal.loading = true;
    let oldProducts = this.produsctsList.filter((product) =>
      product.productName.includes(result.from)
    );
    for (let i = 0; i < oldProducts.length; i++) {
      const product = new Product();
      product.productName = oldProducts[i].productName.replace(
        result.from,
        result.to
      );
      product.productCategory = result.to;
      this._stockService.creatProduct(product).subscribe(() => {
        if (i == oldProducts.length - 1) {
          this._glopal.loading = false;
          this.openSnake(`تم اضافة (${i + 1}) صنف`);
        }
      });
    }
  }
}
