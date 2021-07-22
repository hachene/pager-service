export class Target {
  public type: TargetType

  constructor({ type }: Partial<Target>) {
    this.type = type
  }
}

export enum TargetType {
  email = 'email',
  sms = 'sms',
}
