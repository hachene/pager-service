import { EscalationPolicyServiceInterface } from '../ports/outgoing/EscalationPolicyServiceInterface'
import { PersistanceInterface } from '../ports/outgoing/PersistanceInterface'
import { TimerServiceInterface } from '../ports/outgoing/TimerServiceInterface'
import { Alert } from './models/Alert'
import { MonitoredServiceStatus } from './models/MonitoredService'

const MINUTES_FOR_ALERT_TIMER_TIMEOUT = 15

export class NotifyUnhealthyService {
  private persistance: PersistanceInterface
  private escalationPolicyService: EscalationPolicyServiceInterface
  private timerService: TimerServiceInterface

  constructor(
    persistanceInterface: PersistanceInterface,
    escalationPolicyService: EscalationPolicyServiceInterface,
    timerService: TimerServiceInterface,
  ) {
    this.persistance = persistanceInterface
    this.escalationPolicyService = escalationPolicyService
    this.timerService = timerService
  }

  public perform(alert: NotifyUnhealthyServiceParams): void {
    const { monitoredServiceId } = alert

    const monitoredService = this.persistance.getMonitoredServiceById(monitoredServiceId)
    if (monitoredService.status === MonitoredServiceStatus.unhealthy) return

    this.persistance.markMonitoredServiceAsUnhealthy(monitoredServiceId)

    const escalationPolicy = this.escalationPolicyService.getEscalationPolicyByServiceId(monitoredServiceId)
    const firstLevelTargets = escalationPolicy.levels[0]
    firstLevelTargets.map((target) => target.notifyTarget(alert))

    this.timerService.setTimerForAlert(MINUTES_FOR_ALERT_TIMER_TIMEOUT, alert)
  }
}

type NotifyUnhealthyServiceParams = Alert
