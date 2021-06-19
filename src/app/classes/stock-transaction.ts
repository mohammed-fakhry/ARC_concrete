export class StockTransaction {
  stockTransactionId!: string;
  invNumber!: number;
  stockId!: number;
  stockName!: string;
  sndStockId!: number;
  truckId: string = '0';
  truckName: string = '';
  truckCapacity: number = 0;
  truckOwner: string = '';
  customerId!: number;
  customerName!: string;
  transactionType!: number;
  invoiceTotal: number = 0;
  date_time: string = '';
  notes: string = '';
  uncompleted: string = '';
  madeBy: string = '';
  isUpdated: boolean = false;
  addtaxes: number = 0;
}
