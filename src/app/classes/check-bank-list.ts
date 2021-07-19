/* import { ViewChild } from '@angular/core'; */
import { BankCheck } from './bankCheck';
import { MatTableDataSource } from '@angular/material/table';

export class CheckBankList {
  today = new Date();
  searchTxt = {
    toUs: '',
    onUs: '',
  };

  hasData: boolean = false;

  html = {
    elementId: '',
  };

  classes = {
    widgetIconBg: '',
    widgetIconText: '',
    rowBorder: '',
  };

  header = {
    mainHeader: '',
    toUs: 'مستحق التحصيل',
    onUs: 'مستحق الدفع',
  };

  checkDetail: {
    displayedColumns: string[];

    totals: {
      toUs: number;
      onUs: number;
    };

    mainData: {
      toUs: BankCheck[];
      onUs: BankCheck[];
    };

    listData: {
      toUs: MatTableDataSource<any>;
      onUs: MatTableDataSource<any>;
    };

    searchResult: {
      onUs: {
        total: number;
        length: number;
      };
      toUs: {
        total: number;
        length: number;
      };
    };

    length: {
      toUs: number;
      onUs: number;
    };
  };

  constructor(
    arry?: BankCheck[],
    timing?: {
      title: string;
      elementId: string;
      classes: { bg: string; text: string };
    }
  ) {
    //this.todayDate = new Date(`${this.today.getFullYear()}-${this.today.getMonth() + 1}-${this.today.getDate()}`)

    const filteredList = {
      toUs: this.filterList(arry, 'مستحق التحصيل', timing?.title),
      onUs: this.filterList(arry, 'مستحق الدفع', timing?.title),
    };

    //this.tomorrow = new Date(this.today.setDate(this.today.getDate() + 1));

    this.html.elementId = timing?.elementId ?? '';

    this.hasData =
      filteredList.toUs.length > 0 || filteredList.onUs.length > 0
        ? true
        : false;

    this.header.mainHeader = timing?.title ?? '';

    this.classes = {
      widgetIconBg: timing?.classes?.bg ?? '',
      widgetIconText: timing?.classes?.text ?? '',
      rowBorder:
        timing?.title === 'شيكات متأخرة'
          ? 'borderRight-alert boxRadios px-3 mx-3'
          : '',
    };

    const mainCols = [
      'date',
      'checkNumber',
      'bankName',
      'payFor',
      'checkValue',
      'isPaid',
    ];

    if (timing?.title === 'شيكات تم تحصيلها') {
      mainCols.push('paid_off_date');
    }

    this.checkDetail = {
      displayedColumns: mainCols,

      totals: {
        toUs: this.sumTotals(filteredList.toUs),
        onUs: this.sumTotals(filteredList.onUs),
      },

      mainData: {
        toUs: filteredList.toUs,
        onUs: filteredList.onUs,
      },

      searchResult: {
        onUs: {
          total: this.sumTotals(filteredList.onUs),
          length: filteredList.onUs.length,
        },
        toUs: {
          total: this.sumTotals(filteredList.toUs),
          length: filteredList.toUs.length,
        },
      },

      listData: {
        toUs: this.newMatTable(filteredList.toUs),
        onUs: this.newMatTable(filteredList.onUs),
      },

      length: {
        toUs: filteredList.toUs.length,
        onUs: filteredList.onUs.length,
      },
    };
  }

  sumTotals(array?: BankCheck[]): number {
    if (!array) return 0;
    return array
      .map((a: BankCheck) => a.checkValue)
      .reduce((a: number, b: number) => a + b, 0);
  }

  filterList(
    array?: BankCheck[],
    checkType?: string,
    timing?: string
  ): BankCheck[] {
    if (!array) return [];
    return array.filter(
      (a: BankCheck) =>
        a.checkType === checkType && this.checkDate(a.date, timing ?? '')
    );
  }

  newMatTable = (data: any): MatTableDataSource<any> => {
    return new MatTableDataSource(data);
  };

  checkDate = (checkDate: string, timing: string): boolean => {
    const todayDate = new Date(
      `${this.today.getFullYear()}-${
        this.today.getMonth() + 1
      }-${this.today.getDate()}`
    );
    const newDate = this.dateToStr(new Date(checkDate));
    const todayStr = this.dateToStr(new Date(this.today));
    const tomorrowDate = new Date(todayDate.setDate(this.today.getDate() + 1));
    const tomorrow = this.dateToStr(tomorrowDate);

    if (timing === 'شيكات تم تحصيلها') return true;
    if (timing === 'شيكات اليوم' && newDate === todayStr) return true;
    if (timing === 'شيكات غداً' && tomorrow === newDate) return true;
    if (timing === 'شيكات متأخرة' && todayStr > newDate) return true;
    if (timing === 'شيكات مجدولة' && todayStr < newDate && tomorrow !== newDate)
      return true;
    return false;
  };

  dateToStr = (date: Date): number => {
    return new Date(
      `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
    ).getTime();
  };
}
