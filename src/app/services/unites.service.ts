import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TowerData } from '../classes/tower-data';
import { UnitData } from '../classes/unit-data';

@Injectable({
  providedIn: 'root'
})
export class UnitesService {

  url: string | null = localStorage.getItem('tmpDB');

  constructor(private http: HttpClient) { }

  getUnites(id?: string) {
    if (id != null) return this.http.get<UnitData[]>(`${this.url}unitList.php?id=${id}`);
    return this.http.get<UnitData[]>(`${this.url}unitList.php`);
  };

  creatUnit(unit: UnitData) {
    return this.http.post(`${this.url}postUnit.php`, unit)
  };

  updateUnit(unit: UnitData) {
    return this.http.put(`${this.url}updateUnit.php?id=` + unit.unitId, unit )
  };

  deleteUnitSer(id: number) {
    return this.http.delete<UnitData[]>(`${this.url}deleteUnit.php?id=` + id)
  };

  getTowers() {
    return this.http.get<TowerData[]>(`${this.url}towerList.php`);
  };
}
