import { PersistenceInterface } from '../../ports/outgoing/PersistenceInterface'
import { HealthyEvent } from '../models/HealthyEvent'

export class ReceiveHealthyEvent {
  private persistence: PersistenceInterface

  constructor(persistence: PersistenceInterface) {
    this.persistence = persistence
  }

  public perform({ monitoredServiceId }: HealthyEvent): void {
    this.persistence.markMonitoredServiceAsHealthy(monitoredServiceId)
  }
}
