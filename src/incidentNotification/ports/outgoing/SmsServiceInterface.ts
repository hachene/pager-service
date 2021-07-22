import { Alert } from '../../core/models/Alert'

export interface SmsServiceInterface {
  sendAlert(phoneNumber: string, alert: Alert): void
}
