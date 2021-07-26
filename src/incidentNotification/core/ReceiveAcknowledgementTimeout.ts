import { EscalationPolicyServiceInterface } from '../ports/outgoing/EscalationPolicyServiceInterface'
import { PersistanceInterface } from '../ports/outgoing/PersistanceInterface'
import { TimerServiceInterface } from '../ports/outgoing/TimerServiceInterface'
import { AcknowledgementTimeout } from './models/AcknowledgementTimeout'
import { MonitoredServiceStatus } from './models/MonitoredService'

export class ReceiveAcknowledgementTimeout {
  private escalationPolicyService: EscalationPolicyServiceInterface
  private persistance: PersistanceInterface
  private timerService: TimerServiceInterface

  constructor(
    escalationPolicyService: EscalationPolicyServiceInterface,
    persistance: PersistanceInterface,
    timerService: TimerServiceInterface,
  ) {
    this.escalationPolicyService = escalationPolicyService
    this.persistance = persistance
    this.timerService = timerService
  }

  public perform({ monitoredServiceId }: ReceiveAcknowledgementTimeoutParams): void {
    const monitoredService = this.persistance.getMonitoredServiceById(monitoredServiceId)
    if (monitoredService.status !== MonitoredServiceStatus.unhealthy) return

    const alert = this.persistance.getAlertByMonitoredServiceId(monitoredServiceId)
    if (alert.isAcknowledged || alert.areLastLevelTargetsNotified) return

    const escalationPolicy = this.escalationPolicyService.getEscalationPolicyByServiceId(alert.monitoredServiceId)
    const lastLevelTargets = escalationPolicy.levels[1]
    lastLevelTargets.map((target) => target.notifyTarget(alert))

    this.timerService.setTimerForAlert(15, alert)
  }
}

type ReceiveAcknowledgementTimeoutParams = AcknowledgementTimeout
