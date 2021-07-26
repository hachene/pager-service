import { PersistanceInterface } from '../ports/outgoing/PersistanceInterface'
import { HealthyEvent } from './models/HealthyEvent'

export class ReceiveHealthyEvent {
  private persistance: PersistanceInterface

  constructor(persistance: PersistanceInterface) {
    this.persistance = persistance
  }

  public perform({ monitoredServiceId }: HealthyEvent): void {
    this.persistance.markMonitoredServiceAsHealthy(monitoredServiceId)
  }
}
