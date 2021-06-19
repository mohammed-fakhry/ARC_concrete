import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MainService } from 'src/app/services/main.service';
import { GlobalVarsService } from 'src/app/services/global-vars.service';
import { ConcreteService } from 'src/app/services/concrete.service';
import { ConcreteBon } from 'src/app/classes/concrete-bon';

@Component({
  selector: 'app-concrete-bon-list',
  templateUrl: './concrete-bon-list.component.html',
  styleUrls: ['./concrete-bon-list.component.scss'],
})
export class ConcreteBonListComponent implements OnInit {
  listData: MatTableDataSource<any> | any;

  bonList: ConcreteBon[] = [];

  unrecordedInfo: {
    unrecorded: boolean;
    details: {
      date: string;
      customerName: string;
      customerProject: string;
      customerId: string;
      qty: number;
    }[];
  } = {
    unrecorded: false,
    details: [],
  };

  displayedColumns: string[] = [
    'date',
    'bonManualNum',
    'concreteCustomer_name',
    'concreteName',
    'concreteQty',
    'pump',
    'truckName',
    'driverName',
    'notes',
  ];

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  searchTxt: string = '';

  constructor(
    public _mainService: MainService,
    public _glopal: GlobalVarsService,
    public _concrete: ConcreteService
  ) {
    this._glopal.currentHeader = 'بونات الخرسانة';
    this._glopal.loading = true;
  }

  ngOnInit(): void {
    window.addEventListener('resize', () => {
      this._mainService.handleTableHeight();
    });

    this.onStart();
  }

  onStart() {
    this.getConcreteBones().then((data: ConcreteBon[]) => {
      this.bonList = data;

      this.fillListData(data);

      const unrecordedBons = data.filter(
        (bon) => bon.concreteReceipt_id == '0'
      );

      this.checkUnrecorded(unrecordedBons);
      this._mainService.handleTableHeight();
      this._glopal.loading = false;
    });
  }

  checkUnrecorded(concreteBons: ConcreteBon[]) {
    this.unrecordedInfo = {
      unrecorded: concreteBons.length > 0 ? true : false,
      details: this.creatunrecordedBonsArr(concreteBons),
    };
  }

  creatunrecordedBonsArr(
    unrecordedBons: ConcreteBon[]
  ): {
    date: string;
    customerName: string;
    customerProject: string;
    customerId: string;
    qty: number;
  }[] {
    let result: {
      date: string;
      customerName: string;
      customerProject: string;
      customerId: string;
      qty: number;
    }[] = [];

    if (unrecordedBons.length > 0) {
      const customerIds = [
        ...new Set(unrecordedBons.map((bon) => bon.concreteCustomer_id)),
      ];

      const dateIds = [...new Set(unrecordedBons.map((bon) => bon.date))];

      const projectNames = [
        ...new Set(unrecordedBons.map((bon) => bon.customerProject)),
      ];


      for (let i = 0; i < customerIds.length; i++) {
        for (let dIndx = 0; dIndx < dateIds.length; dIndx++) {
          for (let pIndx = 0; pIndx < projectNames.length; pIndx++) {
            const rowInfo = unrecordedBons.find(
              (bon) =>
                bon.concreteCustomer_id == customerIds[i] &&
                bon.date == dateIds[dIndx] &&
                bon.customerProject == projectNames[pIndx]
            );

            if (rowInfo) {
              const row = {
                date: rowInfo.date ?? '',
                customerName: `${rowInfo.concreteCustomer_name}` ?? '',
                customerProject: projectNames[pIndx],
                customerId: rowInfo.concreteCustomer_id ?? '',
                qty: unrecordedBons.filter(
                  (bon) =>
                    bon.concreteCustomer_id == customerIds[i] &&
                    bon.date == dateIds[dIndx] &&
                    bon.customerProject == projectNames[pIndx]
                ).length,
              };
              result = [...result, row];
            }
          }
        }
      }
    }

    return result;
  }

  fillListData = (pureData: any) => {
    const data = pureData.reverse();
    this.listData = new MatTableDataSource(data);
    this.listData.sort = this.sort;
    this.listData.paginator = this.paginator;
  };

  search() {
    this.listData.filter = this.searchTxt;
  }

  getConcreteBones(): Promise<ConcreteBon[]> {
    return new Promise((res) => {
      this._concrete
        .concreteBonList()
        .subscribe((data: ConcreteBon[]) => res(data));
    });
  }
}
