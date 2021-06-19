export class Changedinvoice {
  changedId!: string | null;
  // invoice information
  stockTransactionId!: string;
  stockTransactionDetailsId!: number;
  invNumber!: number;
  stockId!: number;
  stockName!: string;
  transactionType!: string;
  // customer
  customerId!: number | null;
  customerName!: string;
  oldCustomerId!: number;
  oldCustomerName!: string;
  // product
  productId!: number | null;
  productName!: string;
  oldProductId!: number;
  oldPruductName!: string;
  // qty
  Qty!: number;
  oldQty!: number;
  // price
  price!: number;
  oldPrice!: number;
  // notes
  notes: string = '';
  oldNotes: string = '';
  // type and date and realName
  changedType!: number;
  changedDisc: string = '';
  date_time: string = '';
  userId!: string;
  realName!: string;
  userPic!: string;
}
