export class UserData {
  id!: number;
  name: string = '';
  realName: string = '';
  auth!: string | null;
  prem: boolean = false;
  workers: boolean = false;
  clients: boolean = false;
  unites: boolean = false;
  stockes: boolean = false;
  safes: boolean = false;
  customers: boolean = false;
  edi: boolean = false;
  expEdi: boolean = false;
  del: boolean = false;
  dev: boolean = false;
  userPic: string = '';
}
