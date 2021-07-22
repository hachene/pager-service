import { Target, TargetType } from './Target'

export class SmsTarget extends Target {
  public phoneNumber: string

  constructor({ phoneNumber }: Partial<SmsTarget>) {
    super({ type: TargetType.sms })
    this.phoneNumber = phoneNumber
  }
}
