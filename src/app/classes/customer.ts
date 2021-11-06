export class Customer {
  customerId!: number;
  customerName: string = '';
  customerTell: string = '';
  customerUnit: string = '';
  customerPaid: number = 0;
  customerRemain: number = 0;
  customerAdd: string = '';
  customerDateIN: string = '';
  uncompletedCond: number = 0;
  lastResevedReciept: string = '';
  lastPaidReciept: string = '';
  lastSoldInvoice: string = '';
  lastBoughtInvoice: string = '';
  truckCustomerId!: string | null;
  truckCustomerName: string = '';
  mainCustomerId!: string | null;
  mainCustomerName!: string;
  monthlyPayment: number = 0;
}
