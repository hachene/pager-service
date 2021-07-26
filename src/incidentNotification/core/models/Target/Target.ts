import { NotificationServiceInterface } from '../../../ports/outgoing/NotificationServiceInterface'
import { Alert } from '../Alert'

export interface Target {
  type: TargetType
  notificationService: NotificationServiceInterface
  notifyTarget(alert: Alert): void
}

export enum TargetType {
  email = 'email',
  sms = 'sms',
}
