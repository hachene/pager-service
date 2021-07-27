import { Alert } from './Alert'

export class Acknowledgement {
  public alertId: Alert['id']

  constructor({ alertId }: Partial<Acknowledgement>) {
    this.alertId = alertId
  }
}
