import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { Customer } from 'src/app/classes/customer';
import { MainService } from 'src/app/services/main.service';
import { GlobalVarsService } from 'src/app/services/global-vars.service';
import { CustomerService } from 'src/app/services/customer.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FilterByDateDialogComponent } from 'src/app/dialogs/filter-by-date-dialog/filter-by-date-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from 'src/app/services/auth.service';
import { SafeReceipt } from 'src/app/classes/safe-receipt';
import { SafeService } from 'src/app/services/safe.service';
import { DeleteDialogComponent } from 'src/app/dialogs/delete-dialog/delete-dialog.component';

@Component({
  selector: 'app-customers-list',
  templateUrl: './customers-list.component.html',
  styleUrls: ['./customers-list.component.scss'],
})
export class CustomersListComponent implements OnInit {
  listData: MatTableDataSource<any> | any;

  displayedColumns: string[] = [
    'customerName',
    'customerRemain',
    'customerAdd',
    'lastResevedReciept',
    /* 'lastPaidReciept', */
    'lastSoldInvoice',
    /* 'lastBoughtInvoice', */
    'edit',
  ];

  /* monthly paid */
  /* customers */
  monthlyPaidCustomers: Customer[] = [];
  /* date */
  monthlyPaid_date_time: {
    date_time: string;
    month: number;
    year: number;
  } = { date_time: '', month: 1, year: 1 };
  /* monthlyTotals */
  monthlyTotals = {
    gaurds: 0,
    monthpay: 0,
  };

  /* add monthlyPaid */
  loadCond: string = '';
  loopDetails = {
    length: 0,
    loop: 0,
  };

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  searchTxt: string = '';
  example_container: HTMLElement = document.querySelector(
    '.example-container'
  ) as HTMLElement;

  countsDom: NodeListOf<Element> = document.querySelectorAll(
    '.counts'
  ) as NodeListOf<Element>;

  customerList: Customer[] = [];
  isFiltered: boolean = false;
  searchFor: string | null = null;
  uncompleted: boolean = false;

  sales_and_Purchases: {
    salesTitle: string;
    sales: number;
    purchasesTitle: string;
    purchases: number;
    trClass: string;
  }[] = [];
  searchDate: { from: string; to: string } = { from: '', to: '' };

  counts!: any; /* {
    activeCustomers: {
      onUs: {
        title: string;
        count: number;
        total: number;
        filter: () => any;
      };
      toUs: {
        title: string;
        count: number;
        total: number;
        filter: () => any;
      };
    };
    allCustomers: {
      onUs: {
        title: string;
        count: number;
        total: number;
        filter: () => any;
      };
      toUs: {
        title: string;
        count: number;
        total: number;
        filter: () => any;
      };
    };
  }; */

  constructor(
    public _mainService: MainService,
    public _glopal: GlobalVarsService,
    public _customerService: CustomerService,
    public activeRoute: ActivatedRoute,
    public _router: Router,
    public _auth: AuthService,
    public _safeService: SafeService,
    public _dialog: MatDialog
  ) {
    this._glopal.currentHeader = 'بيانات موردين | مستهلكين';
    this._glopal.loading = true;
  }

  ngOnInit(): void {
    window.addEventListener('resize', () => {
      this._mainService.handleTableHeight();
    });

    this.example_container = document.querySelector(
      '.example-container'
    ) as HTMLElement;

    this.customerList = [];

    this.onStart();
  }

  onStart() {
    this.searchFor = this.activeRoute.snapshot.paramMap.get('searchFor');
    this.getCustomers().then((data: any) => {
      //this.customerList = data;
      let dataTofill: Customer[] = data;

      if (this.searchFor) {
        this.customerList = this.filterByUrl(this.searchFor, dataTofill);
      } else {
        this._glopal.currentHeader = 'موردين | مستهلكين';
        this.customerList = dataTofill;
      }

      this.uncompleted = this.customerList.find(
        (customer: Customer) => customer.uncompletedCond > 0
      )
        ? true
        : false;

      // Collectible
      this.fillListData(this.customerList);
      this.counts = this.generateCustomerCounts(this.customerList);

      this._mainService.handleTableHeight();
      this._glopal.loading = false;
    });
  }

  filterByUrl(searchFor: string, dataTofill: Customer[]): Customer[] {
    const mainHeader = 'موردين | مستهلكين -';

    if (searchFor === 'indebtedness') {
      this._glopal.currentHeader = `${mainHeader} عملاء دائنين`;
      return dataTofill.filter(
        (customer) =>
          customer.customerRemain < 0 &&
          !customer.customerAdd.includes('ايجار') &&
          !customer.customerAdd.includes('حراسة وغفرات')
      );
    } else if (searchFor === 'ActiveIndebtedness') {
      this._glopal.currentHeader = `${mainHeader} عملاء نشطين دائنين`;
      return dataTofill.filter(
        (customer) =>
          customer.customerRemain < 0 &&
          customer.customerName.includes('--') &&
          !customer.customerAdd.includes('ايجار') &&
          !customer.customerAdd.includes('حراسة وغفرات')
      );
    } else if (searchFor === 'collectible') {
      this._glopal.currentHeader = `${mainHeader} عملاء مدينين`;
      return dataTofill.filter(
        (customer) =>
          customer.customerRemain > 0 &&
          !customer.customerAdd.includes('ايجار') &&
          !customer.customerAdd.includes('حراسة وغفرات')
      );
    } else if (searchFor === 'ActiveCollectible') {
      this._glopal.currentHeader = `${mainHeader} عملاء نشطين مدينين`;
      return dataTofill.filter(
        (customer) =>
          customer.customerRemain > 0 &&
          customer.customerName.includes('--') &&
          !customer.customerAdd.includes('ايجار') &&
          !customer.customerAdd.includes('حراسة وغفرات')
      );
    } else if (searchFor === 'uncompleted') {
      this._mainService.scrollTo('customerListTable');
      return dataTofill.filter(
        (customer) =>
          customer.uncompletedCond > 0 &&
          !customer.customerAdd.includes('ايجار') &&
          !customer.customerAdd.includes('حراسة وغفرات')
      );
    } else if (searchFor === 'monthlyPaidCustomers') {
      this._glopal.currentHeader = 'عملاء مستأجرين';
      return dataTofill.filter((customer) =>
        customer.customerAdd.includes('ايجار')
      );
    } else if (searchFor === 'gaurdsCustomers') {
      this._glopal.currentHeader = 'حراسة وغفرات';
      return dataTofill.filter((customer) =>
        customer.customerAdd.includes('حراسة وغفرات')
      );
    }
    return [];
  }

  generateCustomerCounts(customers: Customer[]) {
    const mainFilter = customers.filter(
      (cust: Customer) =>
        !cust.customerName.includes('المحل') &&
        !cust.customerName.includes('راس المال') &&
        !cust.customerName.includes('بنك') &&
        !cust.customerAdd.includes('ايجار') &&
        !cust.customerName.includes('- شريك') &&
        !cust.customerAdd.includes('حراسة وغفرات')
    );

    const gaurdsCustomers = customers.filter(
      (cus) =>
        cus.customerRemain != 0 && cus.customerAdd.includes('حراسة وغفرات')
    );
    const monthlyPaidCustomers = customers.filter(
      (cus) => cus.customerRemain != 0 && cus.customerAdd.includes('ايجار')
    );

    const filterd = {
      active: {
        onUs: mainFilter.filter(
          (customer: Customer) =>
            customer.customerName.includes('--') && customer.customerRemain < 0
        ),
        toUs: mainFilter.filter(
          (customer: Customer) =>
            customer.customerName.includes('--') && customer.customerRemain > 0
        ),
      },
      all: {
        onUs: mainFilter.filter(
          (customer: Customer) => customer.customerRemain < 0
        ),
        toUs: mainFilter.filter(
          (customer: Customer) => customer.customerRemain > 0
        ),
      },
    };

    return {
      activeCustomers: {
        onUs: {
          title: 'مستحق الدفع',
          id: 'activeOnUs',
          count: filterd.active.onUs.length,
          total: filterd.active.onUs
            .map((cust: Customer) => cust.customerRemain)
            .reduce((a: number, b: number) => a + b, 0),
          uncompletedCond: filterd.active.onUs.filter(
            (cust: Customer) => cust.uncompletedCond > 0
          ).length,
          filter: () => this.counterAction(filterd.active.onUs, 'activeOnUs'),
        },
        toUs: {
          title: 'مستحق التحصيل',
          id: 'activeToUs',
          count: filterd.active.toUs.length,
          total: filterd.active.toUs
            .map((cust: Customer) => cust.customerRemain)
            .reduce((a: number, b: number) => a + b, 0),
          uncompletedCond: filterd.active.toUs.filter(
            (cust: Customer) => cust.uncompletedCond > 0
          ).length,
          filter: () => this.counterAction(filterd.active.toUs, 'activeToUs'),
        },
      },
      allCustomers: {
        onUs: {
          title: 'مستحق الدفع',
          id: 'allOnUs',
          count: filterd.all.onUs.length,
          total: filterd.all.onUs
            .map((cust: Customer) => cust.customerRemain)
            .reduce((a: number, b: number) => a + b, 0),
          uncompletedCond: filterd.all.onUs.filter(
            (cust: Customer) => cust.uncompletedCond > 0
          ).length,
          filter: () => this.counterAction(filterd.all.onUs, 'allOnUs'),
        },
        toUs: {
          title: 'مستحق التحصيل',
          id: 'allToUs',
          count: filterd.all.toUs.length,
          total: filterd.all.toUs
            .map((cust: Customer) => cust.customerRemain)
            .reduce((a: number, b: number) => a + b, 0),
          uncompletedCond: filterd.all.toUs.filter(
            (cust: Customer) => cust.uncompletedCond > 0
          ).length,
          filter: () => this.counterAction(filterd.all.toUs, 'allToUs'),
        },
      },
      gaurdsCustomers: {
        title: 'حراسة وغفرات',
        id: 'gaurdsCustomers',
        count: gaurdsCustomers.length,
        total: gaurdsCustomers.reduce(
          (a: any, b: any) => a + b.customerRemain,
          0
        ),
        filter: () => this.counterAction(gaurdsCustomers, 'gaurdsCustomers'),
      },
      monthlyPaidCustomers: {
        title: 'مستأجرين',
        id: 'monthlyPaidCustomers',
        count: monthlyPaidCustomers.length,
        total: monthlyPaidCustomers.reduce(
          (a: any, b: any) => a + b.customerRemain,
          0
        ),
        filter: () =>
          this.counterAction(monthlyPaidCustomers, 'monthlyPaidCustomers'),
      },
    };
  }

  counterAction(newCustomerList: Customer[], elementId: string): any {
    this.fillListData(newCustomerList);
    this.isFiltered = false;
    const boxDom = document.querySelector(`#${elementId}`) as HTMLElement;

    if (boxDom) {
      if (boxDom.classList.contains('activeBox')) {
        this.filterList('showAll');
      } else {
        this.countsDom = document.querySelectorAll(
          '.counts'
        ) as NodeListOf<Element>;

        this.countsDom.forEach((count) => {
          count.classList.remove('activeBox');
        });

        boxDom.classList.add('activeBox');
      }
    }
  }

  getCustomers() {
    return new Promise((res) => {
      this._customerService.getCustomer().subscribe((data: Customer[]) => {
        res(data);
      });
    });
  }

  fillListData = (data: any) => {
    this.listData = new MatTableDataSource(data);
    this.listData.sort = this.sort;
    this.listData.paginator = this.paginator;
  };

  search() {
    this.listData.filter = this.searchTxt;
  }

  printDocument() {
    let search = this.searchTxt ? this.searchTxt : '';
    let printCustomers = this.customerList.filter(
      (customer) =>
        customer.customerRemain != 0 &&
        customer.customerName.includes(search) &&
        !customer.customerName.includes('المحل')
    );
    this.fillListData(printCustomers);
    setTimeout(() => window.print(), 200);
  }

  filterList(cond: string) {
    if (cond == 'filterUncomplete') {
      let uncompleted = this.listData.data.filter(
        (c: any) => c.uncompletedCond > 0
      );
      this.fillListData(uncompleted);
      this._mainService.scrollTo('customerListTable');
      this.isFiltered = true;
    }

    if (cond == 'showAll') {
      this.fillListData(this.customerList);
      this.isFiltered = false;

      this.countsDom = document.querySelectorAll(
        '.counts'
      ) as NodeListOf<Element>;

      this.countsDom.forEach((count) => {
        count.classList.remove('activeBox');
      });

      this.searchDate = { from: '', to: '' };

      this.sales_and_Purchases = [];
    }
  }

  openFilterDialog = (data: any) => {
    let dialogRef = this._dialog.open(FilterByDateDialogComponent, data);

    dialogRef.afterClosed().subscribe((result) => {
      if (result !== 'cancel') {
        this.searchDate = {
          from: result.fromDate,
          to: result.toDate,
        };
        this.filterByDate(result.fromDate, result.toDate);
      }
    });
  };

  filterByDate(from: string, to: string) {
    this.searchTxt = '';

    if (from && to) {
      this._glopal.loading = true;
      this.getSalesAndPurshus_ByDate(from, to).then((data: any) => {
        this.sales_and_Purchases = [
          {
            salesTitle: 'مبيعات',
            sales: data[0]?.outCome ?? 0,
            purchasesTitle: 'تحصيلات',
            purchases: data[1]?.inCome ?? 0,
            trClass: 'secondaryBadge',
          },

          {
            salesTitle: 'مشتريات',
            sales: data[0]?.inCome ?? 0,
            purchasesTitle: 'دفعات',
            purchases: data[1]?.outCome ?? 0,
            trClass: 'tdborder_top_primary dangerBadge',
          },

          {
            salesTitle: 'حراسة و غفرات',
            sales: data[2]?.inCome ?? 0,
            purchasesTitle: 'ايجارات',
            purchases: data[2]?.outCome ?? 0,
            trClass: 'tdborder_top_primary lightBg',
          },
        ];
        this.isFiltered = true;

        this._glopal.loading = false;
      });
    }
  }

  getSalesAndPurshus_ByDate(from: string, to: string) {
    return new Promise((res) => {
      this._customerService
        .getSalesAndPurshus_ByDate(from, to)
        .subscribe((data: any) => res(data));
    });
  }

  showMonthlyPaid() {
    this.monthlyPaidCustomers = this.customerList
      .filter(
        (customer: Customer) =>
          customer.customerAdd == 'حراسة وغفرات' ||
          customer.customerAdd == 'ايجار'
      )
      .sort((a: Customer, b: Customer) => b.monthlyPayment - a.monthlyPayment);

    this.monthlyTotals = {
      gaurds: this.monthlyPaidCustomers
        .filter((customer: Customer) => customer.customerAdd == 'حراسة وغفرات')
        .reduce((a: any, b: any) => a + b.monthlyPayment, 0),
      monthpay: this.monthlyPaidCustomers
        .filter((customer: Customer) => customer.customerAdd == 'ايجار')
        .reduce((a: any, b: any) => a + b.monthlyPayment, 0),
    };

    const monthlyPaidCustomers_id = document.getElementById(
      `monthlyPaidCustomers_id`
    ) as HTMLElement;

    const DATE_NOW = new Date(Date.now());
    const today = `${DATE_NOW.getFullYear()}-${
      DATE_NOW.getMonth() + 1
    }-01T00:00`; // 2021-10-09T08:05 this._mainService.makeTime_date(new Date(Date.now()));
    const theDate = new Date(today);

    this.monthlyPaid_date_time = {
      date_time: today,
      month: theDate.getMonth() + 1,
      year: theDate.getFullYear(),
    };

    if (monthlyPaidCustomers_id) {
      monthlyPaidCustomers_id.style.left = '20px';
    }
  }

  date_timeChanged() {
    const theDate = new Date(this.monthlyPaid_date_time.date_time);
    this.monthlyPaid_date_time.month = theDate.getMonth() + 1;
    this.monthlyPaid_date_time.year = theDate.getFullYear();
  }

  closeMonthlyPaid() {
    const monthlyPaidCustomers_id = document.getElementById(
      `monthlyPaidCustomers_id`
    ) as HTMLElement;

    if (monthlyPaidCustomers_id) {
      monthlyPaidCustomers_id.style.left = '-100%';
    }
  }

  recordSafeReceipt(safeReciept: SafeReceipt) {
    return new Promise((res) => {
      this._safeService.creatSafeReceipt(safeReciept).subscribe((data: any) => {
        res(data);
      });
    });
  }

  postMonthlyPaid_dialog = () => {
    let dialogRef = this._dialog.open(DeleteDialogComponent, {
      data: {
        header: `يجب مراجعة البيانات الآتية قبل التأكيد`,
        info: `سيتم ترحيل جميع المستحقات الشهرية عن شهر ${this.monthlyPaid_date_time.month} لسنة ${this.monthlyPaid_date_time.year}`,
        discription: [
          `عدد العملاء المستحقين للدفع ${
            this.monthlyPaidCustomers.filter(
              (customer: Customer) => customer.monthlyPayment > 0
            ).length
          }`,
          `سيتم انشاء ايصالات صرف بالمستحق على العملاء لكل عميل`,
          `سيتم ترحيل مستحقات العملاء الى حساب ايراد الايجار او الغفرات`,
          `جميع الايصالات ستتم بخزنه الايجارات`,
        ],
        btn: 'تأكيد',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result == 'true') {
        this.postMonthlyPaid();
      }
    });
  };

  postMonthlyPaid() {
    this._glopal.loading = true;
    const processLoop = async () => {
      const filtered = this.monthlyPaidCustomers.filter(
        (customer: Customer) => customer.monthlyPayment > 0
      );
      this.loadCond = '...جارى الترحيل';
      this.loopDetails.length = filtered.length;
      for (let i = 0; i < filtered.length; i++) {
        const receipt_main = {
          AccName:
            filtered[i].customerAdd == 'حراسة وغفرات'
              ? 'ايراد غفرات و حراسة'
              : 'ايراد الايجارات',
          accId: filtered[i].customerAdd == 'حراسة وغفرات' ? '88' : '70',
          currentSafeVal: 0,
          customerId: filtered[i].customerId,
          date_time: this.monthlyPaid_date_time.date_time,
          receiptVal: filtered[i].monthlyPayment,
          recieptNote: `مستحق ${filtered[i].customerName} عن شهر ${this.monthlyPaid_date_time.month} لسنة ${this.monthlyPaid_date_time.year}`,
          safeId: '16',
          safeName: 'خزنه الايجارات',
          secSafeId: 1,
          secSafeName: '',
        };

        const receipt_acc = this.recieptData_forDb(receipt_main, 'حساب');
        const receipt_customer = this.recieptData_forDb(receipt_main, 'عميل');

        const respon_acc = await this.recordSafeReceipt(receipt_acc);
        const respon_customer = await this.recordSafeReceipt(receipt_customer);

        this.loopDetails.loop = i + 1;
        if (this.loopDetails.length === this.loopDetails.loop)
          this._glopal.loading = false;
      }
    };

    processLoop().then(() => {
      this._mainService.openSnake('تم الترحيل');
      setTimeout(() => this.closeMonthlyPaid(), 1000);
    });
  }

  recieptData_forDb(receipt: any, transactionAccKind: string): SafeReceipt {
    return {
      safeReceiptId: receipt.safeReceiptId ? receipt.safeReceiptId : null, //
      receiptKind:
        transactionAccKind == 'حساب' ? 'ايصال استلام نقدية' : 'ايصال صرف نقدية', //
      date_time: receipt.date_time, //
      //fst safe inpts
      safeName: receipt.safeName, //
      currentSafeVal: receipt.currentSafeVal, //
      safeId: receipt.safeId, //
      // sec section
      transactionAccKind: transactionAccKind, //
      // acc inpts
      accId: transactionAccKind == 'حساب' ? receipt.accId : 0, //
      AccName: transactionAccKind == 'حساب' ? receipt.AccName : '', //
      currentAccVal: receipt.currentAccVal ? receipt.currentAccVal : 0, //
      //safe inpts
      secSafeName: receipt.secSafeName ? receipt.secSafeName : '', //
      secSafeId: receipt.secSafeId ? receipt.secSafeId : 1, //
      current_SecSafeVal: receipt.current_SecSafeVal
        ? receipt.current_SecSafeVal
        : 0, //
      // customer inpts
      customerId: transactionAccKind == 'عميل' ? receipt.customerId : 1, //
      customerName: receipt.customerName ? receipt.customerName : '', //
      currentCustomerVal: receipt.currentCustomerVal
        ? receipt.currentCustomerVal
        : 0, //
      // concreteCustomer inpts
      concreteCustomer_id: '0', //
      concreteCustomerName: '', //
      concreteCustomerVal: 0, //
      // truck
      truckId: '0',
      truckName: '',
      truckCurrentVal: 0,
      // truckCustomer inpts
      truckCustomerId: '0',
      truckCustomerName: '',
      truckCustomerVal: 0,
      // worker
      workerId: '0',
      workerName: '',
      workerCurrentVal: 0,
      // user inpts
      receiptVal: receipt.receiptVal,
      recieptNote: receipt.recieptNote ? receipt.recieptNote : '',
      madeBy: this._auth.uName.realName,
      isUpdated: false,
    };
  }
}
