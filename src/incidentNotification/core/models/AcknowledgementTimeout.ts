import { MonitoredService } from './MonitoredService'

export class AcknowledgementTimeout {
  public monitoredServiceId: MonitoredService['id']

  constructor({ monitoredServiceId }: Partial<AcknowledgementTimeout>) {
    this.monitoredServiceId = monitoredServiceId
  }
}
