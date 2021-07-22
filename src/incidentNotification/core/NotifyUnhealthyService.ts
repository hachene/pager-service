import { PersistanceInterface } from '../ports/outgoing/PersistanceInterface'
import { Alert } from './models/Alert'

export class NotifyUnhealthyService {
  private persistance: PersistanceInterface

  constructor(persistanceInterface: PersistanceInterface) {
    this.persistance = persistanceInterface
  }

  public perform({ monitoredServiceId }: NotifyUnhealthyServiceParams): void {
    this.persistance.markMonitoredServiceAsUnhealthy(monitoredServiceId)
  }
}

type NotifyUnhealthyServiceParams = Alert
