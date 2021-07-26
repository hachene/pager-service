import { MailServiceInterface } from '../../../ports/outgoing/MailServiceInterface'
import { Alert } from '../Alert'
import { Target, TargetType } from './Target'

export class EmailTarget implements Target {
  public emailAddress: string
  public type: TargetType
  public notificationService: MailServiceInterface

  constructor({ emailAddress, notificationService }: Partial<EmailTarget>) {
    this.type = TargetType.email
    this.notificationService = notificationService
    this.emailAddress = emailAddress
  }

  public notifyTarget(alert: Alert): void {
    this.notificationService.sendAlert(this.emailAddress, alert)
  }
}
