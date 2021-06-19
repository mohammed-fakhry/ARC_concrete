export class ClientPayment {
  paymentId!: number;
  PaymentKind: string = '';
  date_time: string = '';
  //cashIN
  cashInKind: string = '';
  //safe
  safeId!: number;
  safeName: string = '';
  currentSafeVal: number = 0;
  //bank
  bankId!: number;
  bankName: string = '';
  currentbankVal: number = 0;
  //Client
  clientId!: number;
  clientName: string = '';
  currentClientVal: number = 0;
  //unit
  unitId!: number;
  unitName: string = '';
  //val
  paymentVal: number = 0;
  paymentNote: string = '';
}
