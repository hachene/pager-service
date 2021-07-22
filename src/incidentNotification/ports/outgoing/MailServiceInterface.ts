import { Alert } from '../../core/models/Alert'

export interface MailServiceInterface {
  sendAlert(address: string, alert: Alert): void
}
