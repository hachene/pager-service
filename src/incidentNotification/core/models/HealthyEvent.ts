import { MonitoredService } from './MonitoredService'

export class HealthyEvent {
  public monitoredServiceId: MonitoredService['id']

  constructor({ monitoredServiceId }: HealthyEventInitParams) {
    this.monitoredServiceId = monitoredServiceId
  }
}

type HealthyEventInitParams = { monitoredServiceId: MonitoredService['id'] }
