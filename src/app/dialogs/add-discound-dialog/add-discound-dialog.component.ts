import { Component, OnInit, Inject } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { OtherAcc } from 'src/app/classes/other-acc';
import { SafeData } from 'src/app/classes/safe-data';
import { SafeReceipt } from 'src/app/classes/safe-receipt';
import { GlobalVarsService } from 'src/app/services/global-vars.service';
import { SafeService } from 'src/app/services/safe.service';

@Component({
  selector: 'app-add-discound-dialog',
  templateUrl: './add-discound-dialog.component.html',
  styleUrls: ['./add-discound-dialog.component.scss'],
})
export class AddDiscoundDialogComponent implements OnInit {
  safeList: SafeData[] = [];
  accList: OtherAcc[] = [];
  loading: boolean = true;
  inputValid: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: SafeReceipt,
    public _safeService: SafeService,
    public _glopal: GlobalVarsService
  ) {}

  ngOnInit(): void {
    this.onStart();
  }

  onStart() {
    this.loading = true;
    Promise.all([this.getSafes(), this.getAccList()]).then((data: any) => {
      const result = {
        safeList: data[0],
        accList: data[1],
      };

      this.accList = result.accList;
      if (this.data.customerName.includes('- حسام'))
        this.safeList = result.safeList.filter((safe: any) =>
          safe.safeName.includes('حسام')
        );
      else if (this.data.customerName.includes('- سيف'))
        this.safeList = result.safeList.filter((safe: SafeData) =>
          safe.safeName.includes('سيف')
        );
      else this.safeList = result.safeList;

      this.data.safeName = this.safeList[0].safeName;
      this.safeChanged();
      this.loading = false;
    });
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

  findAcc_byName = (accName: string): OtherAcc | undefined =>
    this.accList.find((acc) => acc.AccName === accName);

  accNameChanged = (modalForm: NgForm) => {
    let accName = this.data.AccName;
    let accInfo = accName ? this.findAcc_byName(accName) : null;
    if (accInfo) {
      this.data.accId = accInfo.accId;
    } else {
      modalForm.form.controls['AccName'].setErrors({ incorrect: true });
    }
  };
}
