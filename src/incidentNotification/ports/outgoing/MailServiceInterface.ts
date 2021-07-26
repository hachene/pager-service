import { Alert } from '../../core/models/Alert'
import { NotificationServiceInterface } from './NotificationServiceInterface'

export interface MailServiceInterface extends NotificationServiceInterface {
  sendAlert(address: string, alert: Alert): void
}
