import { Alert } from '../../core/models/Alert'
import { NotificationServiceInterface } from './NotificationServiceInterface'

export interface SmsServiceInterface extends NotificationServiceInterface {
  sendAlert(phoneNumber: string, alert: Alert): void
}
