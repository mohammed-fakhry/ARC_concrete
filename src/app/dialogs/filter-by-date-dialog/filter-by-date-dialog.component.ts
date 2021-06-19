import { Component, OnInit, Inject } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MainService } from 'src/app/services/main.service';

@Component({
  selector: 'app-filter-by-date-dialog',
  templateUrl: './filter-by-date-dialog.component.html',
  styleUrls: ['./filter-by-date-dialog.component.scss'],
})
export class FilterByDateDialogComponent implements OnInit {
  fromDate: string = '';
  toDate: string = '';
  formValid: boolean = true;

  checkTempDate: any = sessionStorage.getItem('tempDate');
  tempDate: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public _mainService: MainService
  ) {}

  ngOnInit(): void {
    this.tempDate = JSON.parse(this.checkTempDate);
    // {"fromDate":"2021-03-26","toDate":"2021-03-28"}
    if (this.tempDate) {
      this.fromDate = this.tempDate.fromDate;
      this.toDate = this.tempDate.toDate;
    } else {
      this.fromDate = this._mainService.makeDate(new Date(Date.now()));
      this.toDate = this._mainService.makeDate(new Date(Date.now()));
    }
  }

  saveToLocalStorage(filterByDateForm: NgForm) {
    sessionStorage.setItem(
      'tempDate',
      `${JSON.stringify(filterByDateForm.value)}`
    );
  }
}
