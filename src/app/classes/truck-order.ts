import { AuthService } from '../services/auth.service';

export class TruckOrder {
  orderId!: string | null;
  truckId: string = '';
  truckName: string = '';
  truckCapacity!: number;
  truckModel!: string;
  orderType: string = 'سيارة الشركة';
  truckType: string = '';
  loadingType: string = '';
  truckCustomerId: string = '';
  truckCustomerName: string = '';
  LoadTimes: number = 0;
  totalQty: number = 0;
  price: number = 0;
  realPrice: number = 0;
  totalVal: number = 0;
  date_time: string = '';
  notes: string = '';
  stockTransactionDetailsId: string = '1';
  stockTransactionId: string = '';
  concreteBonId: string = '0';
  madeBy: string = '';
}
