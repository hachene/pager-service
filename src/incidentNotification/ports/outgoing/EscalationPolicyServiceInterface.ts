import { EscalationPolicy } from '../../core/models/EscalationPolicy'
import { MonitoredService } from '../../core/models/MonitoredService'

export interface EscalationPolicyServiceInterface {
  getEscalationPolicyByServiceId(monitoredServiceId: MonitoredService['id']): EscalationPolicy
}
