import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { Customer } from 'src/app/classes/customer';
import { MainService } from 'src/app/services/main.service';
import { GlobalVarsService } from 'src/app/services/global-vars.service';
import { CustomerService } from 'src/app/services/customer.service';
import { ActivatedRoute, Router } from '@angular/router';

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
    public _router: Router
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

    /* this.getCustomers().then((data: any) => {
      this.customerList = data;
      this.fillListData(data);
      this._mainService.handleTableHeight();
      this._glopal.loading = false;
    }); */

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

      console.log(this.counts);
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
        total: gaurdsCustomers
          .map((cust: Customer) => cust.customerRemain)
          .reduce((a: number, b: number) => a + b, 0),
        filter: () => this.counterAction(gaurdsCustomers, 'gaurdsCustomers'),
      },
      monthlyPaidCustomers: {
        title: 'مستأجرين',
        id: 'monthlyPaidCustomers',
        count: monthlyPaidCustomers.length,
        total: monthlyPaidCustomers
          .map((cust: Customer) => cust.customerRemain)
          .reduce((a: number, b: number) => a + b, 0),
        filter: () =>
          this.counterAction(monthlyPaidCustomers, 'monthlyPaidCustomers'),
      },
    };
  }

  counterAction(newCustomerList: Customer[], elementId: string): any {
    this.fillListData(newCustomerList);
    this.isFiltered = false;
    const boxDom = document.querySelector(`#${elementId}`) as HTMLElement;

    /* if (boxDom) {
      boxDom.classList.contains('activeBox');
      this.filterList('showAll');
    } */

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

  /* searchCustomer(searchFor: string): Promise<Customer[]> {
    return new Promise((res) => {
      this._customerService
        .searchCustomers(searchFor)
        .subscribe((data: Customer[]) => {
          res(data);
        });
    });
  } */

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
    }
  }
}
