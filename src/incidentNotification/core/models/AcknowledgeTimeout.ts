import { MonitoredService } from './MonitoredService'

export class AcknowledgeTimeout {
  public monitoredServiceId: MonitoredService['id']

  constructor({ monitoredServiceId }: Partial<AcknowledgeTimeout>) {
    this.monitoredServiceId = monitoredServiceId
  }
}
