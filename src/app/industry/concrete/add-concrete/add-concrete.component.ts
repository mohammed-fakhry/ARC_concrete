import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Concrete } from 'src/app/classes/concrete';
import { ConcreteMaterial } from 'src/app/classes/concrete-material';
import { OtherAcc } from 'src/app/classes/other-acc';
import { Product } from 'src/app/classes/product';
import { DoneDialogComponent } from 'src/app/dialogs/done-dialog/done-dialog.component';
import { ConcreteService } from 'src/app/services/concrete.service';
import { GlobalVarsService } from 'src/app/services/global-vars.service';
import { MainService } from 'src/app/services/main.service';
import { SafeService } from 'src/app/services/safe.service';
import { StockService } from 'src/app/services/stock.service';

@Component({
  selector: 'app-add-concrete',
  templateUrl: './add-concrete.component.html',
  styleUrls: ['./add-concrete.component.scss'],
})
export class AddConcreteComponent implements OnInit {
  concrete: Concrete = new Concrete();
  productList: Product[] = [];
  concreteList: Concrete[] = [];

  dataList: string[] = [];
  accList: OtherAcc[] = [];

  formValid = {
    mainForm: true,
    materials: [{ productName: true, qty: true }],
  };

  id!: string | null;

  constructor(
    public _mainService: MainService,
    public _glopal: GlobalVarsService,
    public _router: Router,
    public activeRoute: ActivatedRoute,
    public _stockService: StockService,
    public _concrete: ConcreteService,
    public _safeService: SafeService,
    public _dialog: MatDialog
  ) {
    this._glopal.loading = true;
    this._glopal.currentHeader = 'اضافة بيانات خرسانة';
  }

  ngOnInit(): void {
    window.addEventListener('resize', () => {
      this._mainService.handleTableHeight();
    });

    this.onStart();
  }

  onStart() {
    this.id = this.activeRoute.snapshot.paramMap.get('id');

    this.productList = [];
    this.concreteList = [];
    this.dataList = [];

    this.formValid = {
      mainForm: false,
      materials: [],
    };

    Promise.all([this.getConcreats(), this.getProducts()])
      .then((data: any) => {
        const result = {
          concretes: data[0],
          products: data[1],
        };

        this.concreteList = result.concretes;
        this.productList = result.products;
      })
      .then(() => {
        this.startForm();
        this._mainService.handleTableHeight();
        this._glopal.loading = false;
      });
  }

  addFildes() {
    for (let i = 0; i < 2; i++) {
      this.addRow();
    }
  }

  startForm() {
    this.concrete = new Concrete();

    if (this.id) {
      const concreteInfo = this.concreteList.find(
        (concrete: Concrete) => concrete.id == this.id
      );

      if (concreteInfo) {
        for (let i = 0; i < concreteInfo.materials.length; i++) {
          this.addRow('update');
        }

        this.concrete = concreteInfo;
      }
    } else {
      this.addFildes();
    }
  }

  addRow(cond?: string) {
    if (!cond) {
      const material = new ConcreteMaterial();
      this.concrete.materials.push(material);
    }
    this.dataList.push(`datalistproducts${this.dataList.length}`);
    this.formValid.materials.push({ productName: true, qty: true });
  }

  getProducts(id?: string): Promise<Product[]> {
    return new Promise((res) => {
      this._stockService
        .getProduct(id)
        .subscribe((data: Product[]) => res(data));
    });
  }

  getConcreats(): Promise<Concrete[]> {
    return new Promise((res) => {
      this._concrete.concreteList().subscribe((data: Concrete[]) => res(data));
    });
  }

  getOtherAcc() {
    return new Promise((res) => {
      this._safeService
        .getOtherAcc()
        .subscribe((data: OtherAcc[]) => res(data));
    });
  }

  concreteNameChanged(addConcreteForm: NgForm) {
    const isRecorded = this.concreteList.find(
      (concrete: Concrete) => concrete.name === this.concrete.name
    );

    if (this.concrete.name.includes('مضخ')) {
      addConcreteForm.form.controls['concreteName'].setErrors(null);
      this.formValid.mainForm = true;

      this.concrete.materials = [];
      this.dataList = [];
      this.formValid.materials = [];
    } else if (isRecorded) {
      addConcreteForm.form.controls['concreteName'].setErrors({
        incorrect: true,
      });
    } else {
      addConcreteForm.form.controls['concreteName'].setErrors(null);
    }
  }

  productNameChanged(i: number) {
    const isProduct = this.productList.find(
      (product: Product) =>
        product.productName === this.concrete.materials[i].productName
    );

    if (isProduct) {
      this.formValid.materials[i].productName = true;
      this.concrete.materials[i].productId = isProduct.productId;
      this.formValid.mainForm = true;
    } else {
      this.formValid.materials[i].productName = false;
      this.concrete.materials[i].productId = null;
      this.formValid.mainForm = false;
    }
  }

  checkProduct(i: number): boolean {
    if (this.concrete.materials[i].productName) {
      return true;
    } else {
      return false;
    }
  }

  openDialog = () => {
    let dialogRef = this._dialog.open(DoneDialogComponent, {
      data: {
        header: `تم ${this.id ? 'تعديل' : 'اضافة'} بيانات الخرسانة`,
        info: `باسم | ${this.concrete.name}`,
        discription: [``],
        btns: {
          addNew: 'اضافة بيانات جديدة',
          goHome: 'الخرسانة',
        },
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result == 'addNew') {
        if (this.id) {
          this._router.navigate(['/AddConcrete']);
        } else {
          this.onStart();
        }
      } else {
        this._router.navigate(['/ConcreteList']);
      }
    });
  };

  recordMainConcrete(addConcreteForm: NgForm) {
    if (this.id) {
      this.concrete.lastUpdated = this._mainService.makeTime_date(
        new Date(Date.now())
      );

      this._concrete.updateConcrete(this.concrete).subscribe();
      this.recordMaterials(this.concrete.id);
    } else {
      this._concrete
        .postConcrete(this.concrete)
        .subscribe((data: any) => this.recordMaterials(data[0]));
    }
  }

  recordMaterials(concreteId: string) {
    if (this.concrete.name.includes('مضخ')) {
      this.openDialog();
    } else {
      for (let i = 0; i < this.concrete.materials.length; i++) {
        if (this.checkProduct(i)) {
          const concreteMaterial = this.concrete.materials[i];
          concreteMaterial.concreteId = concreteId;

          if (concreteMaterial.concreteMaterial_id) {
            this._concrete.updateConcreteMaterial(concreteMaterial).subscribe();
          } else {
            this._concrete.postConcreteMaterial(concreteMaterial).subscribe();
          }
        }

        if (i == this.concrete.materials.length - 1) {
          this.openDialog();
        }
      }
    }
  }

  onSubmit(addConcreteForm: NgForm) {
    if (addConcreteForm.valid) {
      this.recordMainConcrete(addConcreteForm);
    }
  }
}
