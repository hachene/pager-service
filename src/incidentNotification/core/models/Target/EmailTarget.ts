import { Target, TargetType } from './Target'

export class EmailTarget extends Target {
  public emailAddress: string

  constructor({ emailAddress }: Partial<EmailTarget>) {
    super({ type: TargetType.email })
    this.emailAddress = emailAddress
  }
}
