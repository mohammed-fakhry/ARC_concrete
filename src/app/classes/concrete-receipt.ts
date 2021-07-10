import { ConcreteReceipDetails } from './concrete-receip-details';
import { StockTransaction } from './stock-transaction';
import { StockTransactionD } from './stock-transaction-d';

export class ConcreteReceipt {
  concreteReceipt_id!: string | null;
  concreteReceiptType: string = 'فاتورة خرسانة';
  concreteCustomer_id!: string | null;
  concreteCustomer_name: string = '';
  customerProject: string = '';
  manualNum: string = '';
  stockTransactionId!: string;
  date_time: string = '';
  totalDiscound: number = 14;
  notes: string = '';
  total: number = 0;
  totalInAr: string = '';
  madeBy: string = '';
  addTaxesVal: number = 0;
  recordedByBon: boolean = false;
  // receiptRemainCash: number = 0;

  receiptDetails: ConcreteReceipDetails[] = [];
  stockTransaction: StockTransaction = new StockTransaction();
  stockTransactionD: StockTransactionD[] = [];
}
