export class TaxPayment {
  id!: string;
  date_time: string = '';
  notes: string = '';
  paymentVal: number = 0;
  receiptKind: string = 'ايصال صرف نقدية';
}
