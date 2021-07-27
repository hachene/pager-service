import { Alert } from './Alert'

export class Acknowledgement {
  public alertId: Alert['id']

  constructor({ alertId }: AcknowledgementInitParams) {
    this.alertId = alertId
  }
}

type AcknowledgementInitParams = { alertId: Alert['id'] }
