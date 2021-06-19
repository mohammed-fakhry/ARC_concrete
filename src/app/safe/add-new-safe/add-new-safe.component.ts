import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { SafeData } from 'src/app/classes/safe-data';
import { DoneDialogComponent } from 'src/app/dialogs/done-dialog/done-dialog.component';
import { AuthService } from 'src/app/services/auth.service';
import { GlobalVarsService } from 'src/app/services/global-vars.service';
import { MainService } from 'src/app/services/main.service';
import { SafeService } from 'src/app/services/safe.service';
import { WorkerService } from 'src/app/services/worker.service';
import { Worker } from '../../classes/worker';

@Component({
  selector: 'app-add-new-safe',
  templateUrl: './add-new-safe.component.html',
  styleUrls: ['./add-new-safe.component.scss'],
})
export class AddNewSafeComponent implements OnInit {
  workersList: Worker[] = [];
  safeList: SafeData[] = [];
  safe: SafeData = new SafeData();
  inputValid = {
    worker: { cond: true, msg: '' },
    safe: { cond: true, msg: '' },
    form: true,
  };
  submitBtn = {
    val: 'تسجيل',
  };
  id: string | null = null;
  constructor(
    public activeRoute: ActivatedRoute,
    public _router: Router,
    public _glopal: GlobalVarsService,
    public _dialog: MatDialog,
    public _mainService: MainService,
    public _safeService: SafeService,
    public _workerService: WorkerService,
    public _snackBar: MatSnackBar,
    public _auth: AuthService,
  ) {
    this._glopal.currentHeader = 'اضافة بيانات خزنة';
    this._glopal.loading = true;
  }

  ngOnInit(): void {
    this.safe = new SafeData();
    this.id = this.activeRoute.snapshot.paramMap.get('id');

    Promise.all([this.getSafes(), this.getWorkers()]).then((data: any[]) => {
      let result = {
        safes: data[0],
        workers: data[1],
      };

      this.workersList = result.workers;
      this.safeList = result.safes;
      this.safe.opendVal = 0;

      if (this.id) {
        this.getSafes(this.id).then((data: any) => (this.safe = data[0]));
        this._glopal.currentHeader = 'تعديل بيانات خزنة';
        this.submitBtn.val = 'تعديل';
      }
      this._glopal.loading = false;
    });
  }

  getWorkers() {
    return new Promise((res) => {
      this._workerService.getWorker().subscribe((data: Worker[]) => res(data));
    });
  }

  getSafes(id?: string) {
    return new Promise((res) => {
      this._safeService.getSafes(id).subscribe((data: SafeData[]) => {
        res(data);
      });
    });
  }

  employeeChanged(addSafeForm: NgForm) {
    let employee = this.workersList.find(
      (worker) => worker.workerName === this.safe.safeEmployee
    );
    if (employee) {
      this.safe.workerId = employee.workerId;
      this.inputValid.worker.cond = true;
      addSafeForm.form.controls['safeEmployee'].setErrors(null);
    } else {
      addSafeForm.form.controls['safeEmployee'].setErrors({ incorrect: true });
      this.inputValid.worker = {
        cond: false,
        msg: 'الاسم غير مسجل بقاعدة البيانات',
      };
    }
  }

  clearInputs() {
    this._glopal.loading = true;
    this.safe = new SafeData();
    this.getSafes().then((data: any) => {
      this.safeList = data;
      this._glopal.loading = false;
    });
  }

  isSaferecorded(inp: string) {
    return this.safeList.find((safe) => safe.safeName === inp);
  }

  safeChanged(addSafeForm: NgForm) {
    if (!this.id) {
      if (this.isSaferecorded(this.safe.safeName)) {
        addSafeForm.form.controls['safeName'].setErrors({ incorrect: true });
        this.inputValid.safe = { cond: false, msg: 'هذا الاسم مستخدم بالفعل' };
      } else {
        addSafeForm.form.controls['safeName'].setErrors(null);
        this.inputValid.safe.cond = true;
      }
    }
  }

  openDialog = () => {
    let dialogRef = this._dialog.open(DoneDialogComponent, {
      data: {
        header: 'تم اضافة بيانات الخزنة',
        info: `باسم | ${this.safe.safeName}`,
        discription: [`امين الخزن | ${this.safe.safeEmployee}`],
        btns: {
          addNew: "اضافة بيانات جديدة",
          goHome: "الخزنة"
        }
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result == 'addNew') {
        if (this.id) {
          this._router.navigate(['/AddSafe']);
        } else {
          this.clearInputs();
        }
      } else {
        this._router.navigate(['/Safe']);
      }
    });
  };

  recordSafe() {
    if (this.id) {
      if (this._glopal.check.edi) {
        this._safeService.updateSafeData(this.safe).subscribe(
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
      }
    } else {
      this._safeService.creatSafe(this.safe).subscribe(
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

  onSubmit(addSafeForm: NgForm) {
    if (addSafeForm.valid) {
      this.recordSafe();
      this.inputValid.form = true;
    } else {
      this.inputValid.form = false;
    }
  }
}
