export class StockTransactionD {
  stockTransactionDetailsId!: number;
  stockTransactionId!: string;
  productId!: number;
  productName!: string;
  productUnit: number = 1;
  price!: number;
  Qty!: number;
  discound!: number;
  truckOrder_realPrice!: number;
  notes: string = '';
}
