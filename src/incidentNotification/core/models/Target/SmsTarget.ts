import { SmsServiceInterface } from '../../../ports/outgoing/SmsServiceInterface'
import { Alert } from '../Alert'
import { Target, TargetType } from './Target'

export class SmsTarget implements Target {
  public phoneNumber: string
  public type: TargetType
  public notificationService: SmsServiceInterface
  public hasActiveAlert: boolean

  constructor({ phoneNumber, notificationService, hasActiveAlert = false }: Partial<SmsTarget>) {
    this.type = TargetType.sms
    this.phoneNumber = phoneNumber
    this.notificationService = notificationService
    this.hasActiveAlert = hasActiveAlert
  }

  public notifyTarget(alert: Alert): void {
    if (this.hasActiveAlert) return
    this.notificationService.sendAlert(this.phoneNumber, alert)
  }
}
