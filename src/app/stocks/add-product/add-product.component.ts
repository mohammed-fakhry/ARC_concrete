import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from 'src/app/classes/product';
import { DoneDialogComponent } from 'src/app/dialogs/done-dialog/done-dialog.component';
import { GlobalVarsService } from 'src/app/services/global-vars.service';
import { MainService } from 'src/app/services/main.service';
import { StockService } from 'src/app/services/stock.service';

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.scss'],
})
export class AddProductComponent implements OnInit {
  submitBtn = {
    val: 'تسجيل',
  };

  product: Product = new Product();
  productsList: Product[] = [];
  productsCategeories: any[] = [];
  inputValid = {
    product: { cond: true, msg: '' },
    productCategory: { cond: true, msg: '' },
    form: true,
  };
  id!: string;

  constructor(
    public _mainService: MainService,
    public _glopal: GlobalVarsService,
    public _router: Router,
    public activeRoute: ActivatedRoute,
    public _stockService: StockService,
    public _dialog: MatDialog
  ) // public _snackBar: MatSnackBar
  {
    this._glopal.currentHeader = 'اضافة بيانات صنف';
    this._glopal.loading = true;
  }

  ngOnInit(): void {
    let isId = this.activeRoute.snapshot.paramMap.get('id');
    if (isId) this.id = isId;
    this.clearInputs();
  }

  getProducts(id?: string) {
    return new Promise((res) => {
      this._stockService
        .getProduct(id)
        .subscribe((data: Product[]) => res(data));
    });
  }

  clearInputs() {
    this.product = new Product();
    this.productsList = [];
    this._glopal.loading = true;
    this.getProducts().then((data: any) => {
      this.productsList = data;
      this.productsCategeories = [
        ...new Set(data.map((product: any) => product.productCategory)),
      ];
      if (this.id) {
        this.getProducts(this.id).then((data: any) => (this.product = data[0]));
        this._glopal.currentHeader = 'تعديل بيانات صنف';
        this.submitBtn.val = 'تعديل';
      }
      this._glopal.loading = false;
    });
  }

  ProductChanged(addProductForm: NgForm) {
    let p = this.productsList.find(
      (p) => p.productName === this.product.productName
    );
    if (p && !this.id) {
      addProductForm.form.controls['productName'].setErrors({
        incorrect: true,
      });
      this._mainService.playshortFail();
      this.inputValid.product = { cond: false, msg: 'هذا الاسم مستخدم بالفعل' };
      this.inputValid.form = false;
      return false;
    } else {
      addProductForm.form.controls['productName'].setErrors(null);
      this.inputValid.product.cond = true;
      this.inputValid.form = true;
      return true;
    }
  }

  openDialog = () => {
    let dialogRef = this._dialog.open(DoneDialogComponent, {
      data: {
        header: 'تم اضافة بيانات الصنف',
        info: `باسم | ${this.product.productName}`,
        discription: [``],
        btns: {
          addNew: "اضافة بيانات جديدة",
          goHome: "المخازن"
        }
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result == 'addNew') {
        if (this.id) {
          this._router.navigate(['/AddProduct']);
        } else {
          this.clearInputs();
        }
      } else {
        this._router.navigate(['/Stokes']);
      }
    });
  };

  onSubmit(addProductForm: NgForm) {
    if (addProductForm.valid) {
      if (this.ProductChanged(addProductForm)) {
        if (this.id) {
          if (this._mainService.canUpdate()) {
            this._stockService.updateProduct(this.product).subscribe(
              () => {
                this._glopal.loading = false;
                this.openDialog();
              },
              (error) => {
                if (error.status == '201') {
                  this._glopal.loading = false;
                  this.openDialog();
                }
              }
            );
          }
        } else {
          this._stockService.creatProduct(this.product).subscribe(
            () => {
              this._glopal.loading = false;
              this.openDialog();
            },
            (error) => {
              if (error.status == '201') {
                this._glopal.loading = false;
                this.openDialog();
              }
            }
          );
        }
      }
    } else {
      this._mainService.playshortFail()
    }
  }
}
