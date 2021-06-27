export class InvoiceInp {
  stockTransactionDetailsId!: number;
  product: string = '';
  productUnit: number = 1;
  productId!: number;
  qty!: number;
  price!: number;
  discound: number = 0;
  truckOrder_realPrice: number = 0;
  total: number = 0;
  notes: string = '';
}
