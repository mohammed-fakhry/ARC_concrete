export class StockingDetails {
  stockingDetailsId!: number | null;
  stockingId!: number;
  productId!: number | null;
  productName: string = '';
  productCategory: string = '';
  stockId!: number;
  realQty: number = 0;
  computerQty: number = 0;
  price: number = 0;
  net: number = 0;
}
