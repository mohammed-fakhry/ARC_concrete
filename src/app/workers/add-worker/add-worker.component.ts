import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { DoneDialogComponent } from 'src/app/dialogs/done-dialog/done-dialog.component';
import { AuthService } from 'src/app/services/auth.service';
import { GlobalVarsService } from 'src/app/services/global-vars.service';
import { MainService } from 'src/app/services/main.service';
import { WorkerService } from 'src/app/services/worker.service';
import { Worker } from '../../classes/worker';
import { Location } from '@angular/common';

@Component({
  selector: 'app-add-worker',
  templateUrl: './add-worker.component.html',
  styleUrls: ['./add-worker.component.scss'],
})
export class AddWorkerComponent implements OnInit {
  workerList: Worker[] = [];
  workerInfo: Worker = new Worker();
  id!: string | null;

  constructor(
    public _workerService: WorkerService,
    public _mainService: MainService,
    public activeRoute: ActivatedRoute,
    public _dialog: MatDialog,
    public _router: Router,
    public _glopal: GlobalVarsService,
    public _location: Location,
    public _auth: AuthService
  ) {
    this._glopal.currentHeader = 'اضافة بيانات موظف';
    this._glopal.loading = true;
  }

  ngOnInit(): void {
    this.onStart();
  }

  onStart() {
    this.id = this.activeRoute.snapshot.paramMap.get('id');
    this.getWorkers().then((data: Worker[]) => {
      this.workerList = data;

      if (this.id) {
        this.getWorkers(this.id).then((data: Worker[]) => {
          this.workerInfo = data[0];
          this._glopal.loading = false;
        });
      } else {
        this.workerInfo = new Worker();
        this._glopal.loading = false;
      }
    });
  }

  getWorkers(id?: string): Promise<Worker[]> {
    return new Promise((res) => {
      this._workerService
        .getWorker(id)
        .subscribe((data: Worker[]) => res(data));
    });
  }

  openDialog = () => {
    let dialogRef = this._dialog.open(DoneDialogComponent, {
      data: {
        header: `تم ${this.id ? 'تعديل' : 'اضافة'} بيانات الموظف`,
        info: `باسم | ${this.workerInfo.workerName}`,
        discription: [
          `الادارة | ${this.workerInfo.workerJopCateg}`,
          `الوظيفة | ${this.workerInfo.workerJop}`,
          `الراتب | ${this.workerInfo.workerSalary}`
        ],
        btns: {
          addNew: 'اضافة بيانات جديدة',
          goHome: 'الموظفين',
        },
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result == 'addNew') {
        if (this.id) {
          this._router.navigate(['/AddProduct']);
        } else {
          this.onStart();
        }
      } else if (result == 'back') {
        this._location.back();
      } else {
        this._router.navigate(['/Workers']);
      }
    });
  };

  recordWorker() {
    this._glopal.loading = true;

    if (this.id) {
      this._workerService.updateWorkerSer(this.workerInfo).subscribe(
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
      this._workerService.creatEmployee(this.workerInfo).subscribe(
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

  onSubmit(addWorkerForm: NgForm) {
    if (addWorkerForm.valid) {
      this.recordWorker();
    }
  }
}
