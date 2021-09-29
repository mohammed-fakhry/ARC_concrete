import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MainService } from '../services/main.service';
import { GlobalVarsService } from '../services/global-vars.service';
import { MainCustomer } from '../classes/main-customer';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';

@Component({
  selector: 'app-main-customers',
  templateUrl: './main-customers.component.html',
  styleUrls: ['./main-customers.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
})
export class MainCustomersComponent implements OnInit {
  listData: MatTableDataSource<any> | any;
  displayedColumns: string[] = [
    'fullName',
    'totalVal',
    'customerTotals',
    'concreteTotals',
    'trucktotals',
    'customer_Substitute_totals',
    'customer_digging_totals',
    'notes',
  ];
  expandedElement!: MainCustomer | null;

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  searchTxt: string = '';

  mainCustomers: MainCustomer[] = [];
  mainCustomerInfo: MainCustomer = new MainCustomer();

  tableTotals = {
    customerTotals: 0,
    concreteTotals: 0,
    trucktotals: 0,
    customer_Substitute_totals: 0,
    customer_digging_totals: 0,
    totalVal: 0,
  };

  sideLogo!: HTMLElement;

  constructor(
    public _mainService: MainService,
    public _glopal: GlobalVarsService
  ) {
    this._glopal.currentHeader = 'الشركات الام';
    this._glopal.loading = true;
  }

  ngOnInit(): void {
    window.addEventListener('resize', () => {
      this._mainService.handleTableHeight();
    });

    this.sideLogo = document.querySelector('.sideLogo') as HTMLElement;
    this.onStart();
  }

  onStart() {
    this.getMainCustomers().then((data: MainCustomer[]) => {
      // this.mainCustomers = data;

      this.mainCustomers = this.makeCompanyAcc(data);
      console.log(this.mainCustomers);
      this.fillListData(this.mainCustomers);
      this._mainService.handleTableHeight();
      this._glopal.loading = false;
      /*  setTimeout(() => {
        if (this.mainCustomers[0].id) {
          this.postCustomerInfo(0, this.mainCustomers[0].id);
        }
      }, 100); */
    });
  }

  makeCompanyAcc(data: MainCustomer[]) {
    // this.mainCustomers = []
    let mainArr: MainCustomer[] = [];
    for (let i = 0; i < data.length; i++) {
      const customer = new MainCustomer(data[i]);

      console.log(customer);
      mainArr.push(customer);
    }

    return mainArr;
  }

  getMainCustomers(): Promise<MainCustomer[]> {
    return new Promise((res) => {
      this._mainService
        .mainCustomersList()
        .subscribe((data: MainCustomer[]) => res(data));
    });
  }

  search() {
    this.listData.filter = this.searchTxt;
  }

  fillListData = (data: any) => {
    this.listData = new MatTableDataSource(data);
    this.listData.sort = this.sort;
    this.listData.paginator = this.paginator;
    this.tableTotals = this.getTableTotals(data);
  };

  getTableTotals(data: any) {
    const result = {
      customerTotals: data.reduce((a: any, b: any) => a + b.customerTotals, 0),
      concreteTotals: data.reduce((a: any, b: any) => a + b.concreteTotals, 0),
      trucktotals: data.reduce((a: any, b: any) => a + b.trucktotals, 0),
      customer_Substitute_totals: data.reduce(
        (a: any, b: any) => a + b.customer_Substitute_totals,
        0
      ),
      customer_digging_totals: data.reduce(
        (a: any, b: any) => a + b.customer_digging_totals,
        0
      ),
      totalVal: data.reduce((a: any, b: any) => a + b.totalVal, 0),
    };

    return result;
  }

  postCustomerInfo(i: number, customerId: string) {

    if (this.sideLogo) this.sideLogo.style.opacity = '.10'

    const mainCustomerCells = document.querySelectorAll(
      '.mainCustomerCells'
    ) as NodeListOf<Element>;

    mainCustomerCells.forEach((element: any) => {
      element.classList.remove('darkBadge');
    });

    const mainCustomerInfo_id = document.getElementById(
      `mainCustomerInfo_id`
    ) as HTMLElement;

    if (mainCustomerInfo_id) {
      mainCustomerInfo_id.style.left = '20px';
    }

    const mainCustomer_tr = document.querySelectorAll(
      `.mainCustomer-tr`
    ) as NodeListOf<Element>;

    mainCustomer_tr.forEach((element: any) => {
      element.classList.remove('darkBadge');
      element.classList.remove('noHover');
    });

    const mainCustomer_tr_i = document.querySelectorAll(
      `.mainCustomer-tr${i}`
    ) as NodeListOf<Element>;

    mainCustomer_tr_i.forEach((element: any) => {
      element.classList.add('darkBadge');
      element.classList.add('noHover');
    });

    const mainCompanies_mat_card = document.querySelector(
      '#mainCompanies_mat_card'
    ) as HTMLElement;
    if (mainCompanies_mat_card) mainCompanies_mat_card.style.width = '75%';

    this.mainCustomerInfo =
      this.mainCustomers.find(
        (customer: MainCustomer) => customer.id == customerId
      ) ?? new MainCustomer();
  }

  hideCustomerInfo() {

    if (this.sideLogo) this.sideLogo.style.opacity = '.65'

    const mainCustomerInfo_id = document.getElementById(
      `mainCustomerInfo_id`
    ) as HTMLElement;

    if (mainCustomerInfo_id) {
      mainCustomerInfo_id.style.left = '-100%';

      const mainCompanies_mat_card = document.querySelector(
        '#mainCompanies_mat_card'
      ) as HTMLElement;
      if (mainCompanies_mat_card) mainCompanies_mat_card.style.width = '100%';
    }
  }
}
