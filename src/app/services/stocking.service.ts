import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { StockingDetails } from '../classes/stocking-details';
import { StockingHeader } from '../classes/stocking-header';

@Injectable({
  providedIn: 'root',
})
export class StockingService {
  constructor(private http: HttpClient) {}

  url: string | null = localStorage.getItem('tmpDB'); //'http://localhost/accounting/'

  /* stockingHeader */
  stockingHeaderList(id: string) {
    return this.http.get<StockingHeader[]>(
      `${this.url}stockingHeaderList.php?id=${id}`
    );
  }

  postStoking(stockingHeader: StockingHeader) {
    return this.http.post(`${this.url}postStoking.php`, stockingHeader);
  }

  updateStocking(stockingHeader: StockingHeader) {
    return this.http.put(
      `${this.url}updateStocking.php?id=${stockingHeader.stockingId}`,
      stockingHeader
    );
  }

  /* stockingDetails */
  stockingListById(id: string) {
    return this.http.get<StockingDetails[]>(
      `${this.url}stockingListById.php?id=${id}`
    );
  }

  stockingList() {
    return this.http.get<any[]>(
      `${this.url}stockingList.php`
    );
  }

  postStockingDetails(StockingDetails: StockingDetails) {
    return this.http.post(
      `${this.url}postStockingDetails.php`,
      StockingDetails
    );
  }

  updateStockingDetails(stockingDetails: StockingDetails) {
    return this.http.put(
      `${this.url}updateStockingDetails.php?id=${stockingDetails.stockingDetailsId}`,
      stockingDetails
    );
  }

  deleteStockingDetails(id: number) {
    return this.http.delete<StockingDetails[]>(
      `${this.url}deleteStockingDetails.php?id=` + id
    );
  }

  get_next_prev(tableName: string, currentId: string) {
    return this.http.get<StockingDetails[]>(
      `${this.url}get_next_prev.php?tableName=${tableName}&currentId=${currentId}`
    );
  }
}
