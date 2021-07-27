import { MonitoredService } from './MonitoredService'

export class AcknowledgementTimeout {
  public monitoredServiceId: MonitoredService['id']

  constructor({ monitoredServiceId }: AcknowledgementInitParams) {
    this.monitoredServiceId = monitoredServiceId
  }
}

type AcknowledgementInitParams = { monitoredServiceId: MonitoredService['id'] }
