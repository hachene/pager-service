import { EscalationPolicyServiceInterface } from '../../ports/outgoing/EscalationPolicyServiceInterface'
import { PersistenceInterface } from '../../ports/outgoing/PersistenceInterface'
import { TimerServiceInterface } from '../../ports/outgoing/TimerServiceInterface'
import { AcknowledgementTimeout } from '../models/AcknowledgementTimeout'
import { MonitoredServiceStatus } from '../models/MonitoredService'

export class ReceiveAcknowledgementTimeout {
  private escalationPolicyService: EscalationPolicyServiceInterface
  private persistence: PersistenceInterface
  private timerService: TimerServiceInterface

  constructor(
    escalationPolicyService: EscalationPolicyServiceInterface,
    persistence: PersistenceInterface,
    timerService: TimerServiceInterface,
  ) {
    this.escalationPolicyService = escalationPolicyService
    this.persistence = persistence
    this.timerService = timerService
  }

  public perform({ monitoredServiceId }: AcknowledgementTimeout): void {
    const monitoredService = this.persistence.getMonitoredServiceById(monitoredServiceId)
    if (monitoredService.status !== MonitoredServiceStatus.unhealthy) return

    const alert = this.persistence.getAlertByMonitoredServiceId(monitoredServiceId)
    if (alert.isAcknowledged || alert.areLastLevelTargetsNotified) return

    const escalationPolicy = this.escalationPolicyService.getEscalationPolicyByServiceId(alert.monitoredServiceId)
    const lastLevelTargets = alert.getNextTargetsLevelToBeNotified(escalationPolicy)
    if (lastLevelTargets) lastLevelTargets.map((target) => target.notifyTarget(alert))
    this.persistence.incrementLastLevelContactedForAlert(alert.id)

    this.timerService.setTimerForAlert(15, alert)
  }
}
