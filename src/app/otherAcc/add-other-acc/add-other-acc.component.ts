import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { OtherAcc } from 'src/app/classes/other-acc';
import { DoneDialogComponent } from 'src/app/dialogs/done-dialog/done-dialog.component';
import { GlobalVarsService } from 'src/app/services/global-vars.service';
import { MainService } from 'src/app/services/main.service';
import { SafeService } from 'src/app/services/safe.service';

@Component({
  selector: 'app-add-other-acc',
  templateUrl: './add-other-acc.component.html',
  styleUrls: ['./add-other-acc.component.scss'],
})
export class AddOtherAccComponent implements OnInit {
  id: string | null = null;
  acc: OtherAcc = new OtherAcc();
  accList: OtherAcc[] = [];
  submitBtn: string = '';

  inputValid = {
    acc: { cond: true, msg: '' },
    form: true,
  };

  constructor(
    public _mainService: MainService,
    public _glopal: GlobalVarsService,
    public _router: Router,
    public activeRoute: ActivatedRoute,
    public _dialog: MatDialog,
    public _safeService: SafeService,
    public _snackBar: MatSnackBar
  ) {
    this._glopal.currentHeader = 'اضافة بيانات حساب';
    this._glopal.loading = true;
  }

  ngOnInit(): void {
    this.submitBtn = 'تسجيل';
    this.id = this.activeRoute.snapshot.paramMap.get('id');

    this.clearInputs();
  }

  clearInputs() {
    this.acc = new OtherAcc();
    this.acc.currentAccVal = 0;
    this.accList = [];
    this._glopal.loading = true;
    this.getOtherAcc().then((data: any) => {
      this.accList = data;
      if (this.id) {
        this.getOtherAcc(this.id).then((data: any) => {
          this.acc = data[0];
        });
        this._glopal.currentHeader = 'تعديل بيانات حساب';
        this.submitBtn = 'تعديل';
      }
      this._glopal.loading = false;
    });
  }

  getOtherAcc(id?: string) {
    return new Promise((res) => {
      this._safeService
        .getOtherAcc(id)
        .subscribe((data: OtherAcc[]) => res(data));
    });
  }

  accNameChanged(addOtherAccForm: NgForm) {
    let accInfo = this.accList.find((acc) => acc.AccName === this.acc.AccName);
    if (accInfo) {
      addOtherAccForm.form.controls['AccName'].setErrors({ incorrect: true });
      this._mainService.playshortFail();
      this.inputValid.acc = { cond: false, msg: 'هذا الاسم مستخدم بالفعل' };
      this.inputValid.form = false;
      return false;
    } else {
      addOtherAccForm.form.controls['AccName'].setErrors(null);
      this.inputValid.acc.cond = true;
      this.inputValid.form = true;
      return true;
    }
  }

  openDialog = () => {
    let dialogRef = this._dialog.open(DoneDialogComponent, {
      data: {
        header: 'تم اضافة بيانات الصنف',
        info: `باسم | ${this.acc.AccName}`,
        discription: [``],
        btns: {
          addNew: 'اضافة بيانات جديدة',
          goHome: 'المصاريف',
        },
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result == 'addNew') {
        if (this.id) {
          this._router.navigate(['/AddOtherAcc']);
        } else {
          this.clearInputs();
        }
      } else {
        this._router.navigate(['/otherAcc']);
      }
    });
  };

  onSubmit(addOtherAccForm: NgForm) {
    if (addOtherAccForm.valid) {
      if (this.accNameChanged(addOtherAccForm)) {
        if (this.id) {
          if (this._glopal.check.edi) {
            this._safeService.updateOtherAcc(this.acc).subscribe(
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
          } else {
            this._snackBar.open('لا توجد صلاحية للتعديل', 'اخفاء', {
              duration: 2500,
            });
            this._mainService.playDrumFail();
          }
        } else {
          this._safeService.creatOtherAcc(this.acc).subscribe(
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
      this._mainService.playshortFail();
    }
  }
}
