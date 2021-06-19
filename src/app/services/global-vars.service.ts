import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GlobalVarsService {

  currentHeader: string = '';
  loading: boolean = false;

  // storage
  checkSession: any = sessionStorage.getItem('y');
  check = JSON.parse(this.checkSession);

  // notification
  notification = {
    value: 0,
    color: 'primary'
  }

  // staticStrings
  colorPlate: string[] = [
    '255, 99, 132',
    '54, 162, 235',
    '255, 206, 86',
    '75, 192, 192',
    '153, 102, 255',
    '255, 159, 64',
    '232, 204, 123',
    '212, 232, 100',
    '77, 232, 102',
    '88, 117, 232',
    '140, 156, 51',
    '123, 174, 232',
    '232, 89, 77',
    '156, 67, 59',
    '232, 100, 128',
    '255, 99, 132',
    '51, 156, 124',
    '232, 137, 111',
    '59, 129, 156',
    '232, 123, 144',
    '100, 195, 232',
    '232, 225, 123',
    '156, 150, 59',
    '211, 88, 232',
    '232, 223, 100',
    '232, 77, 118',
    '156, 59, 85',
    '232, 225, 123',
    '232, 100, 135',
    '77, 194, 232',
    '59, 132, 156',
  ];

  constructor() { }

  ngOnInit() {
    this.currentHeader = 'الرئيسية'
  }
}
