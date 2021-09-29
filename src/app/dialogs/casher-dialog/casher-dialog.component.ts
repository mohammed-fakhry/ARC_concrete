import { stringify } from '@angular/compiler/src/util';
import { Component, OnInit, Inject } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MainService } from 'src/app/services/main.service';

@Component({
  selector: 'app-casher-dialog',
  templateUrl: './casher-dialog.component.html',
  styleUrls: ['./casher-dialog.component.scss'],
})
export class CasherDialogComponent implements OnInit {
  cashVal!: number;
  remainCash: number = 0;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: number,
    public _mainService: MainService
  ) {}

  ngOnInit(): void {
    this.calcCash();
  }

  calcCash(modalForm?: NgForm) {
    if (modalForm) {
      if (this.cashVal) {
        if (this.cashVal < this.data) {
          modalForm.form.controls['cashRecived'].setErrors({
            incorrect: true,
          });
          this._mainService.playshortFail();
        } else {
          modalForm.form.controls['cashRecived'].setErrors(null);
        }
      }
      this.remainCash = this.data * -1 + modalForm.value.cashRecived;
    } else {
      this.remainCash = this.data * -1;
    }
  }

  /* goRecord(modalForm: NgForm): boolean {
    return true
  } */
}
