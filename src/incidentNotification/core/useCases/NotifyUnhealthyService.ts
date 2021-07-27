import { EscalationPolicyServiceInterface } from '../../ports/outgoing/EscalationPolicyServiceInterface'
import { PersistenceInterface } from '../../ports/outgoing/PersistenceInterface'
import { TimerServiceInterface } from '../../ports/outgoing/TimerServiceInterface'
import { Alert } from '../models/Alert'
import { MonitoredServiceStatus } from '../models/MonitoredService'

const MINUTES_FOR_ALERT_TIMER_TIMEOUT = 15

export class NotifyUnhealthyService {
  private persistence: PersistenceInterface
  private escalationPolicyService: EscalationPolicyServiceInterface
  private timerService: TimerServiceInterface

  constructor(
    persistenceInterface: PersistenceInterface,
    escalationPolicyService: EscalationPolicyServiceInterface,
    timerService: TimerServiceInterface,
  ) {
    this.persistence = persistenceInterface
    this.escalationPolicyService = escalationPolicyService
    this.timerService = timerService
  }

  public perform(alert: Alert): void {
    const { monitoredServiceId } = alert

    const monitoredService = this.persistence.getMonitoredServiceById(monitoredServiceId)
    if (monitoredService.status === MonitoredServiceStatus.unhealthy) return

    this.persistence.markMonitoredServiceAsUnhealthy(monitoredServiceId)

    const escalationPolicy = this.escalationPolicyService.getEscalationPolicyByServiceId(monitoredServiceId)
    const firstLevelTargets = escalationPolicy.getFirstLevelTargets()
    firstLevelTargets.map((target) => target.notifyTarget(alert))

    this.persistence.incrementLastLevelContactedForAlert(alert.id)

    this.timerService.setTimerForAlert(MINUTES_FOR_ALERT_TIMER_TIMEOUT, alert)
  }
}
