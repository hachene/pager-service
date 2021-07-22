import { Alert } from '../../core/models/Alert'

export interface TimerServiceInterface {
  setTimerForAlert(minutesUntilTimeout: number, alert: Alert): void
}
