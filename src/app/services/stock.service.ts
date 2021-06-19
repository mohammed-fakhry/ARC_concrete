import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Product } from '../classes/product';
import { ProductsAvg } from '../classes/products-avg';
import { Stock } from '../classes/stock';
import { StockTransactionD } from '../classes/stock-transaction-d';
import { StockTransaction } from '../classes/stock-transaction';
import { Changedinvoice } from '../classes/changedinvoice';

@Injectable({
  providedIn: 'root',
})
export class StockService {
  constructor(private http: HttpClient) {}

  url: string | null = localStorage.getItem('tmpDB'); //'http://localhost/accounting/'

  //invoicesReportList

  getStockes() {
    return this.http.get<Stock[]>(`${this.url}stocksList.php`);
  }

  getInvoicesReport(searchFor: string, id: string, transactionType: string) {
    return this.http.get<Stock[]>(
      `${this.url}invoicesReportList.php?id=${id}&transactionType=${transactionType}&searchFor=${searchFor}`
    );
  }

  creatStock(stock: Stock) {
    return this.http.post(`${this.url}postStock.php`, stock);
  }

  deleteStockSer(id: number) {
    return this.http.delete<Stock[]>(`${this.url}deleteStock.php?id=` + id);
  }

  updateStockSer(stock: Stock) {
    return this.http.put(
      `${this.url}editeStock.php?id=` + stock.stockId,
      stock
    );
  }

  creatProduct(product: Product) {
    return this.http.post(`${this.url}postProduct.php`, product);
  }

  updateProduct(product: Product) {
    return this.http.put(
      `${this.url}updateProduct.php?id=${product.productId}`,
      product
    );
  }

  getProduct(id?: string) {
    if (id)
      return this.http.get<Product[]>(`${this.url}productsList.php?id=${id}`);
    return this.http.get<Product[]>(`${this.url}productsList.php`);
  }

  getStockProductsList(id: string) {
    return this.http.get<any[]>(`${this.url}stockProductsList.php?id=${id}`);
  }

  getProductAvrList(id: string, date?: { from: string; to: string }) {
    if (date) {
      return this.http.get<ProductsAvg[]>(
        `${this.url}productAvrList.php?id=${id}&fromDate=${date.from}&toDate=${date.to}`
      );
    } else {
      return this.http.get<ProductsAvg[]>(
        `${this.url}productAvrList.php?id=${id}`
      );
    }
  }

  creatStockTransactionDetails(StockTransactionD: StockTransactionD) {
    return this.http.post(
      `${this.url}postStocktTransactionDetailsId.php`,
      StockTransactionD
    );
  }

  creatStockTransaction(StockTransaction: StockTransaction) {
    return this.http.post(`${this.url}stockTransaction.php`, StockTransaction);
  }

  getStockTransactionDetailsList(id?: string) {
    if (id)
      return this.http.get<StockTransactionD[]>(
        `${this.url}stockTransactionDetailsList.php?id=${id}`
      );
    return this.http.get<StockTransactionD[]>(
      `${this.url}stockTransactionDetailsList.php`
    );
  }

  productsLastPriceList(id: string) {
    return this.http.get<any[]>(
      `${this.url}productsLastPriceList.php?id=${id}`
    );
  }

  productLastSoldPrice(id: string) {
    return this.http.get<any[]>(
      `${this.url}productLastSoldPrice.php?id=${id}`
    );
  }
  // stockTransactionList
  getStockTransactionList(id?: string) {
    if (id)
      return this.http.get<StockTransaction[]>(
        `${this.url}stockTransactionList.php?id=${id}`
      );
    return this.http.get<StockTransaction[]>(
      `${this.url}stockTransactionList.php`
    );
  }

  UpdateStockTransactionDetails(stockTransactionDetails: StockTransactionD) {
    return this.http.put(
      `${this.url}updatestocktransactiondetails.php?id=` +
        stockTransactionDetails.stockTransactionDetailsId,
      stockTransactionDetails
    );
  }

  deleteStockTransactionDetails(id: number) {
    return this.http.delete<StockTransactionD[]>(
      `${this.url}deleteInvoiceDetails.php?id=` + id
    );
  }

  UpdateStockTransaction(stockTransaction: StockTransaction) {
    return this.http.put(
      `${this.url}updateStocktransaction.php?id=` +
        stockTransaction.stockTransactionId,
      stockTransaction
    );
  }

  deleteStockTransaction(id: number) {
    return this.http.delete<StockTransactionD[]>(
      `${this.url}deleteInvoice.php?id=` + id
    );
  }

  allStockProductTrans() {
    return this.http.get<any[]>(`${this.url}allStockProductTrans.php`);
  }

  postChangedInvoice(changedinvoice: Changedinvoice) {
    return this.http.post(`${this.url}postChangedInvoice.php`, changedinvoice);
  }

  changedinvoiceList() {
    return this.http.get<Changedinvoice[]>(`${this.url}changedinvoiceList.php`);
  }

  getLocalJson(url: string) {
    return this.http.get<any[]>(`${url}`);
  }

  getLastInvoices() {
    return this.http.get<any[]>(`${this.url}getLastInvoices.php`);
  }

  getcountInvoices(date: string) {
    return this.http.get<any[]>(
      `${this.url}countInvoices.php?reportDate=${date}`
    );
  }

  getSalesReport(duration: string, safeId: number, toDate: string) {
    return this.http.get<any[]>(
      `${this.url}getSalesReport.php?duration=${duration}&safeId=${safeId}&toDate=${toDate}`
    );
  }

  getProfitReport() {
    return this.http.get<any[]>(`${this.url}getProfitReport.php`);
  }

  getTotalExpencies(id: number, date?: { from: string; to: string }) {
    if (date) {
      return this.http.get<ProductsAvg[]>(
        `${this.url}getTotalExpencies.php?id=${id}&fromDate=${date.from}&toDate=${date.to}`
      );
    }
    return this.http.get<any[]>(`${this.url}getTotalExpencies.php?id=${id}`);
  }

  getLastCasherSerial(customerId: number) {
    return this.http.get<any[]>(`${this.url}getLastCasherSerial.php?id=${customerId}`);
  }

  getAddQtyFromTransactionStock(id: string) {
    return this.http.get<any[]>(`${this.url}getAddQtyFromTransactionStock.php?id=${id}`);
  }
}
