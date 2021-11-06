export class BankCheck {
  checkId!: string;
  // bankId!: string;
  bankName!: string;
  payFor!: string;
  checkValue: number = 0;
  date: string = '';
  paid_off_date: string = '0';
  checkNumber!: string;
  checkType: string = 'مستحق التحصيل';
  isPaid: number = 0;

  constructor(newDate?: string) {
    if (newDate) this.date = newDate;
  }
}
