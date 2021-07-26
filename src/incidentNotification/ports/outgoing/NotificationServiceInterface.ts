import { Alert } from '../../core/models/Alert'

export interface NotificationServiceInterface {
  sendAlert(target: string, alert: Alert): void
}
