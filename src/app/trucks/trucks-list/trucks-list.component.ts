import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MainService } from 'src/app/services/main.service';
import { GlobalVarsService } from 'src/app/services/global-vars.service';
import { TruckService } from 'src/app/services/truck.service';
import { Truck } from 'src/app/classes/truck';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-trucks-list',
  templateUrl: './trucks-list.component.html',
  styleUrls: ['./trucks-list.component.scss'],
})
export class TrucksListComponent implements OnInit {
  listData: MatTableDataSource<any> | any;
  displayedColumns: string[] = [
    'name',
    'number',
    'capacity',
    'model',
    'owner',
    'edit',
  ];

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  searchTxt: string = '';

  searchFor: string | null = null;

  constructor(
    public _mainService: MainService,
    public _glopal: GlobalVarsService,
    public activeRoute: ActivatedRoute,
    public _router: Router,
    public _truckService: TruckService
  ) {
    this._glopal.currentHeader = 'قائمة المعدات';
    this._glopal.loading = true;
  }

  ngOnInit(): void {
    window.addEventListener('resize', () => {
      this._mainService.handleTableHeight();
    });

    let observUrlChange = this._router.events.subscribe((val) => {
      if (
        val instanceof NavigationEnd &&
        this._router.url.includes('TrucksList')
      ) {
        setTimeout(() => this.onStart(), 0);
      }

      if (
        val instanceof NavigationEnd &&
        !this._router.url.includes('TrucksList')
      ) {
        observUrlChange.unsubscribe();
      }
    });

    this.onStart();
  }

  onStart() {
    this.searchFor = this.activeRoute.snapshot.paramMap.get('searchFor');

    const truckTypes = [
      { en: 'cars', ar: 'سيارة' },
      { en: 'loaders', ar: 'لودر' },
      { en: 'harras', ar: 'هراس' },
      { en: 'diggers', ar: 'حفار' },
      { en: 'mixers', ar: 'خلاطة' },
      { en: 'pumps', ar: 'مضخة' },
    ];

    const arType = truckTypes.find((truck) => truck.en == this.searchFor);

    this.getTruckList().then((data: Truck[]) => {
      const result = arType
        ? data.filter((truck) => truck.truckType == arType.ar)
        : data;

      this.fillListData(result);
      this._mainService.handleTableHeight();

      this._glopal.loading = false;
    });
  }

  getTruckList(): Promise<Truck[]> {
    return new Promise((res) => {
      this._truckService.trucksList().subscribe((data: Truck[]) => {
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
}
