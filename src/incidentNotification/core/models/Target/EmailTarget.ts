import { MailServiceInterface } from '../../../ports/outgoing/MailServiceInterface'
import { Alert } from '../Alert'
import { Target, TargetType } from './Target'

export class EmailTarget implements Target {
  public emailAddress: string
  public type: TargetType
  public notificationService: MailServiceInterface
  public hasActiveAlert: boolean

  constructor({ emailAddress, notificationService, hasActiveAlert = false }: Partial<EmailTarget>) {
    this.type = TargetType.email
    this.notificationService = notificationService
    this.emailAddress = emailAddress
    this.hasActiveAlert = hasActiveAlert
  }

  public notifyTarget(alert: Alert): void {
    if (this.hasActiveAlert) return
    this.notificationService.sendAlert(this.emailAddress, alert)
  }
}
