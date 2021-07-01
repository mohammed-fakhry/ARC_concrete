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
  accId: number = 0;
  AccName: string = '';
  currentAccVal: number = 0;
  //safe inpts
  secSafeName: string = '';
  secSafeId: number = 1;
  current_SecSafeVal: number = 0;
  // customer inpts
  customerId: number = 1;
  customerName: string = '';
  currentCustomerVal: number = 0;
  // concreteCustomer inpts
  concreteCustomer_id: string = '0';
  concreteCustomerName: string = '';
  concreteCustomerVal: number = 0;
  // truck
  truckId: string = '0';
  truckName: string = '';
  truckCurrentVal: number = 0;
  // truckCustomer inpts
  truckCustomerId: string = '0';
  truckCustomerName: string = '';
  truckCustomerVal: number = 0;
  // worker
  workerId: string = '0';
  workerName: string = '';
  workerCurrentVal: number = 0;
  // user inpts
  receiptVal!: number;
  recieptNote: string = '';
  madeBy: string = '';
  isUpdated: boolean = false;
}
