import { ConcreteCustomer } from './concrete-customer';
import { Customer } from './customer';
import { TruckCustomer } from './truck-customer';

export class MainCustomer {
  /* main information */
  id!: string | null;
  fullName: string = '';
  notes: string = '';
  totalVal: number = 0;
  /* customers */
  customers: Customer[] = [];
  customerTotals: number = 0;
  /* concreteCustomers */
  concreteCustomers: ConcreteCustomer[] = [];
  concreteTotals: number = 0;
  /* truckCustomers */
  truckCustomers: TruckCustomer[] = [];
  trucktotals: number = 0;
  /* Substitute */
  customer_Substitute: {
    customerId: any;
    customerName: string;
    currentVal: number;
    routeTo: string;
  }[] = [];
  customer_Substitute_totals: number = 0;
  customer_digging: {
    customerId: any;
    customerName: string;
    currentVal: number;
    routeTo: string;
  }[] = [];
  customer_digging_totals: number = 0;

  constructor(data?: MainCustomer) {
    if (data) {
      this.id = data.id;
      this.fullName = data.fullName;
      this.notes = data.notes;
      this.totalVal = data.totalVal;

      /* customers */
      this.customers = data.customers.filter(
        (cust: Customer) => !cust.customerName.includes('احلال')
      );
      this.customerTotals = this.customers.reduce(
        (a: any, b: any) => a + b.customerRemain,
        0
      );

      /* truckCustomers */
      this.truckCustomers = data.truckCustomers.filter(
        (cust: TruckCustomer) =>
          !cust.fullName.includes('احلال') && !cust.fullName.includes('حفر')
      );
      this.trucktotals = this.truckCustomers.reduce(
        (a: any, b: any) => a + b.currentVal,
        0
      );

      /* concreteCustomers */
      this.concreteCustomers = data.concreteCustomers;
      this.concreteTotals = this.concreteCustomers.reduce(
        (a: any, b: any) => a + b.currentVal,
        0
      );

      /* customer_digging */
      this.customer_digging = data.truckCustomers
        .filter((cust: TruckCustomer) => cust.fullName.includes('حفر'))
        .map((cust: TruckCustomer) => {
          return {
            customerId: cust.id,
            customerName: cust.fullName,
            currentVal: cust.currentVal,
            routeTo: `/TruckCustomerInformation/${cust.id}`,
          };
        });

      this.customer_digging_totals = this.customer_digging.reduce(
        (a: any, b: any) => a + b.currentVal,
        0
      );

      /* customer_Substitute */
      const customers_Substitute = data.customers
        .filter((cust: Customer) => cust.customerName.includes('احلال'))
        .map((cust: Customer) => {
          return {
            customerId: cust.customerId,
            customerName: cust.customerName,
            currentVal: cust.customerRemain,
            routeTo: `/customerInformation/${cust.customerId}`,
          };
        });

      const truckCust_Substitute = data.truckCustomers
        .filter((cust: TruckCustomer) => cust.fullName.includes('احلال'))
        .map((cust: TruckCustomer) => {
          return {
            customerId: cust.id,
            customerName: cust.fullName,
            currentVal: cust.currentVal,
            routeTo: `/TruckCustomerInformation/${cust.id}`,
          };
        });

      this.customer_Substitute = [
        ...customers_Substitute,
        ...truckCust_Substitute,
      ];

      this.customer_Substitute_totals = this.customer_Substitute.reduce(
        (a: any, b: any) => a + b.currentVal,
        0
      );
    }
  }
}
