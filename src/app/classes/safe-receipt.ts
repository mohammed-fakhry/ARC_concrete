export class SafeReceipt {
  safeReceiptId!: number | null;
  receiptKind: string = '';
  date_time: string = '';
  //fst safe inpts
  safeName: string = '';
  currentSafeVal: number = 0;
  safeId!: number;
  // sec section
  transactionAccKind: string = '';
  // acc inpts
  accId!: number | null;
  AccName!: string | null;
  currentAccVal: number = 0;
  //safe inpts
  secSafeName: string = '';
  secSafeId!: number | null;
  current_SecSafeVal!: number | null;
  // customer inpts
  customerId!: number | null;
  customerName: string = '';
  currentCustomerVal: number = 0;
  // concreteCustomer inpts
  concreteCustomer_id!: string | null;
  concreteCustomerName: string = '';
  concreteCustomerVal: number = 0;
  // truckCustomer inpts
  truckCustomerId!: string | null;
  truckCustomerName: string = '';
  truckCustomerVal: number = 0;
  // user inpts
  receiptVal!: number;
  recieptNote: string = '';
  madeBy: string = '';
  isUpdated: boolean = false;
}
