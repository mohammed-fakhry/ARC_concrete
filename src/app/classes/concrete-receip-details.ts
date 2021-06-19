import { Concrete } from "./concrete";

export class ConcreteReceipDetails {
  id!: string | null;
  concreteReceipt_id!: string | null;
  concreteId!: string | null;
  concreteName: string = '';
  concreteQty: number = 0;
  concretePrice: number = 0;
  discound: number = 1;
  total: number = 0;
  concreteInfo: Concrete = new Concrete()
}
