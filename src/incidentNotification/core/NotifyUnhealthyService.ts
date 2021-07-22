import { EscalationPolicyServiceInterface } from '../ports/outgoing/EscalationPolicyServiceInterface'
import { PersistanceInterface } from '../ports/outgoing/PersistanceInterface'
import { Alert } from './models/Alert'

export class NotifyUnhealthyService {
  private persistance: PersistanceInterface
  private escalationPolicyService: EscalationPolicyServiceInterface

  constructor(persistanceInterface: PersistanceInterface, escalationPolicyService: EscalationPolicyServiceInterface) {
    this.persistance = persistanceInterface
    this.escalationPolicyService = escalationPolicyService
  }

  public perform({ monitoredServiceId }: NotifyUnhealthyServiceParams): void {
    this.persistance.markMonitoredServiceAsUnhealthy(monitoredServiceId)
    const escalationPolicy = this.escalationPolicyService.getEscalationPolicyByServiceId(monitoredServiceId)
  }
}

type NotifyUnhealthyServiceParams = Alert
