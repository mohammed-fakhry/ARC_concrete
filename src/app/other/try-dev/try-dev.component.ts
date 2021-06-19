import { Component, OnInit } from '@angular/core';
import { GlobalVarsService } from 'src/app/services/global-vars.service';
import { MainService } from 'src/app/services/main.service';

@Component({
  selector: 'app-try-dev',
  templateUrl: './try-dev.component.html',
  styleUrls: ['./try-dev.component.scss'],
})
export class TryDevComponent implements OnInit {
  constructor(
    public _mainService: MainService,
    public _glopal: GlobalVarsService
  ) {}

  dataList: /* { date: string; persons: { name: string; amount: number } } */ any[] =
    [];

  persons: { name: string; amount: number; checked: boolean }[] = [];
  personNames: string[] = [];

  ngOnInit(): void {
    this.onStart();
  }

  addDay(date: string): string {
    let dateToDate = new Date(date);
    let newDate = new Date(dateToDate.setDate(dateToDate.getDate() + 1));
    if (this._mainService.makeDate(newDate) < '2021-06-28')
      return this._mainService.makeDate(newDate);
    else return '';
  }

  dayNameToAr(dayName: string, year: string, dayofYear: string): string {
    const dayesNames = [
      {
        english: 'Sunday',
        arabic: `الاحد ${this.dateFromDay(year, dayofYear)}`,
      },
      {
        english: 'Monday',
        arabic: `الاثنين ${this.dateFromDay(year, dayofYear)}`,
      },
      {
        english: 'Tuesday',
        arabic: `الثلاثاء ${this.dateFromDay(year, dayofYear)}`,
      },
      {
        english: 'Wednesday',
        arabic: `الاربعاء ${this.dateFromDay(year, dayofYear)}`,
      },
      {
        english: 'Thursday',
        arabic: `الخميس ${this.dateFromDay(year, dayofYear)}`,
      },
      {
        english: 'Friday',
        arabic: `الجمعة ${this.dateFromDay(year, dayofYear)}`,
      },
      {
        english: 'Saturday',
        arabic: `السبت ${this.dateFromDay(year, dayofYear)}`,
      },
    ];

    let newName = dayesNames.find(
      (day: any) => day.english === dayName
    )?.arabic;

    return newName ? newName : '';
  }

  dateFromDay(year: any, day: any) {
    let date = new Date(year, 0);
    const fullDate = new Date(date.setDate(day));
    return `${date.getMonth() + 1}/${date.getDate()}`;
  }


  onStart() {
    this.personNames = [];
    this.persons = this.generatePerson();

    this.personNames = this.persons.map((p) => p.name);
    this.dataList = [];
    let newDate = this._mainService.makeDate(new Date('2021-05-31'));
    for (let i = 0; i < 200; i++) {
      newDate = this.addDay(newDate);

      const newData = {
        date: newDate,
        persons: this.generatePerson(),
      };

      if (newDate == '') {
        this._mainService.handleTableHeight();
        break;
      }
      this.dataList = [...this.dataList, newData];
      if (i == 199) {
        this._mainService.handleTableHeight();
      }
    }

    //console.log(this.dataList);
  }

  generatePerson = (): { name: string; amount: number; checked: boolean }[] => {
    return [
      {
        name: 'على',
        amount: 50,
        checked: false,
      },
      {
        name: 'الجن',
        amount: 25,
        checked: false,
      },
      {
        name: 'عمر',
        amount: 25,
        checked: false,
      },
      {
        name: 'فوزى',
        amount: 25,
        checked: false,
      },
      {
        name: 'حسين',
        amount: 25,
        checked: false,
      },
      {
        name: 'اسلام',
        amount: 50,
        checked: false,
      },
      {
        name: 'ملك',
        amount: 50,
        checked: false,
      },
      {
        name: 'الجن',
        amount: 50,
        checked: false,
      },
      {
        name: 'محمد حسين',
        amount: 50,
        checked: false,
      },
      {
        name: 'فوزى',
        amount: 50,
        checked: false,
      },
      {
        name: 'ادهم',
        amount: 50,
        checked: false,
      },
      {
        name: 'على',
        amount: 25,
        checked: false,
      },
      {
        name: 'عمر',
        amount: 25,
        checked: false,
      },
    ];
  };
}
