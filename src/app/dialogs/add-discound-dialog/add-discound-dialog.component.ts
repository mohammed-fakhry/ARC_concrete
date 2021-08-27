import { Component, OnInit, Inject } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { OtherAcc } from 'src/app/classes/other-acc';
import { SafeData } from 'src/app/classes/safe-data';
import { SafeReceipt } from 'src/app/classes/safe-receipt';
import { GlobalVarsService } from 'src/app/services/global-vars.service';
import { SafeService } from 'src/app/services/safe.service';
import { WorkerService } from 'src/app/services/worker.service';
import { Worker } from 'src/app/classes/worker';
import { MainService } from 'src/app/services/main.service';

@Component({
  selector: 'app-add-discound-dialog',
  templateUrl: './add-discound-dialog.component.html',
  styleUrls: ['./add-discound-dialog.component.scss'],
})
export class AddDiscoundDialogComponent implements OnInit {
  safeList: SafeData[] = [];
  accList: OtherAcc[] = [];
  workerList: Worker[] = [];
  loading: boolean = true;
  inputValid: any;

  receiptFor: string = 'acc';
  header: string = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: SafeReceipt,
    public _safeService: SafeService,
    public _workerService: WorkerService,
    public _mainService: MainService,
    public _glopal: GlobalVarsService
  ) {}

  ngOnInit(): void {
    this.onStart();
  }

  onStart() {
    this.loading = true;
    Promise.all([this.getSafes(), this.getAccList()]).then(
      (resultData: any) => {
        const result = {
          safeList: resultData[0],
          accList: resultData[1],
        };

        this.accList = result.accList;
        this.safeList = result.safeList.filter((safe: any) => safe.safeName != 'خزنة مصاريف من فترة 22-3-2020 الى فترة 1-5-2021');

        if (this.data.customerId > 1) {
          this.header = this.data.customerName
          this.receiptFor = 'acc';
        }

        if (this.data.workerId > '0') {
          this.header = this.data.workerName
          this.receiptFor = 'worker';
        } else {
          this.header = this.data.customerName
          this.receiptFor = 'acc';
        }

        this.data.safeName = this.safeList[0].safeName;
        this.safeChanged();
        this.loading = false;
      }
    );
  }

  getSafeInfo = (safeName: string) =>
    this.safeList.find((safe) => safe.safeName == safeName);

  safeChanged() {
    let safeInfo = this.getSafeInfo(this.data.safeName);
    //this.customerList = this.mainCustomerList;
    if (safeInfo) {
      this.data.currentSafeVal = safeInfo.currentSafeVal;
      this.data.safeId = safeInfo.safeId;
    }
  }

  getSafes(): Promise<SafeData[]> {
    return new Promise((res) => {
      this._safeService.getSafes().subscribe((data: SafeData[]) => res(data));
    });
  }

  getAccList(): Promise<OtherAcc[]> {
    return new Promise((res) => {
      this._safeService
        .getOtherAcc()
        .subscribe((data: OtherAcc[]) => res(data));
    });
  }

  getWorkers(): Promise<Worker[]> {
    return new Promise((res) => {
      this._workerService.getWorker().subscribe((data: Worker[]) => res(data));
    });
  }

  findAcc_byName = (accName: string): OtherAcc | undefined =>
    this.accList.find((acc) => acc.AccName === accName);

  accNameChanged = (modalForm: NgForm) => {
    let accName = this.data.AccName;
    let accInfo = accName ? this.findAcc_byName(accName) : null;
    if (accInfo) {
      this.data.accId = accInfo.accId;
      this.data.recieptNote = `${this.data.customerName} - ${this.data.AccName}`;
    } else {
      modalForm.form.controls['AccName'].setErrors({ incorrect: true });
      this._mainService.playshortFail()
    }
  };
}
