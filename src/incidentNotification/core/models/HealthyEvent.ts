import { MonitoredService } from './MonitoredService'

export class HealthyEvent {
  public monitoredServiceId: MonitoredService['id']

  constructor({ monitoredServiceId }: Partial<HealthyEvent>) {
    this.monitoredServiceId = monitoredServiceId
  }
}
