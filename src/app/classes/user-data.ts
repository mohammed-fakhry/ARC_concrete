export class UserData {
  id!: number;
  name: string = '';
  realName: string = '';
  auth!: string | null;
  /* taxes */
  taxes: boolean = false; //
  /* workers */
  workers: boolean = false; //
  /* customers */
  customers: boolean = false; //
  /* otherAcc */
  otherAcc: boolean = false; //
  /* check */
  checksTrace: boolean = false; //
  /* stock */
  stockes: boolean = false; //
  stockeInv: boolean = false; //
  stockeProd: boolean = false; //
  /* trucks */
  addtruck: boolean = false; //
  truckList: boolean = false; //
  /* truckCust */
  addTruckCust: boolean = false; //
  truckCustList: boolean = false; //
  /* concrete */
  addconc: boolean = false; //
  concInv: boolean = false; //
  concbon: boolean = false; //
  concCust: boolean = false; //
  concFinan: boolean = false; //
  /* safe */
  safes: boolean = false;
  addSafe: boolean = false;
  safeInv: boolean = false;
  /* premissions */
  edi: boolean = false;
  expEdi: boolean = false;
  del: boolean = false;
  dev: boolean = false;
  userPic: string = '';
  prem: boolean = false;
  // clients: boolean = false;
  // unites: boolean = false;
}
