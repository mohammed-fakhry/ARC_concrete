export class ConcreteRecieptCash {
  id!: string | null;
  concreteReceipt_id: string = '';
  safeReceiptId: string = '';
  safeReceiptKind: string = '';
  receiptFor: string = 'فاتورة'; // or 'خصم'
  manualNum: string = '';
  receiptVal: number = 0;
}
