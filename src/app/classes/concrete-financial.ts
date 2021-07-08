export class ConcreteFinancial {
  id!: string | null;
  concreteReceipt_id!: string | null;
  manualNum: string = '';
  checkDate: string = '';
  totalQty: number = 0;
  customerName: string = '';
  customerId: string = '';
  receiptTotal: number = 0;
  taxesDiscound: number = 0;
  netBeforTaxes: number = 0;
  addTaxes: number = 0;
  customerDiscound: number = 0;
  netVal: number = 0;
  cashPaid: number = 0;
  remainVal: number = 0;
  receiptCondition: string = '';
  notes: string = '';
  date_time: string = '';
  // receiptCashes: ConcreteRecieptCash[] = [];
}
