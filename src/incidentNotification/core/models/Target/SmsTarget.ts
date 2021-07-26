import { SmsServiceInterface } from '../../../ports/outgoing/SmsServiceInterface'
import { Alert } from '../Alert'
import { Target, TargetType } from './Target'

export class SmsTarget implements Target {
  public phoneNumber: string
  public type: TargetType
  public notificationService: SmsServiceInterface

  constructor({ phoneNumber, notificationService }: Partial<SmsTarget>) {
    this.type = TargetType.sms
    this.phoneNumber = phoneNumber
    this.notificationService = notificationService
  }

  public notifyTarget(alert: Alert): void {
    this.notificationService.sendAlert(this.phoneNumber, alert)
  }
}
