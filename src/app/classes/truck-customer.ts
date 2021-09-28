export class TruckCustomer {
  id!: string | null;
  fullName: string = '';
  tell: string = '';
  adress: string = '';
  openedVal: number = 0;
  currentVal: number = 0;
  notes: string = '';
  mainCustomerId!: string | null;
  mainCustomerName!: string;
}
