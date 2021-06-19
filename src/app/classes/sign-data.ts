export class SignData {
  private uName: string;
  private uAuth: string;

  constructor(uName: string, uAuth: string) {
      this.uName = uName;
      this.uAuth = uAuth;
  }

  getName(): string {
      return this.uName;
  };

  getAuth(): string {
      return this.uAuth;
  };
}
