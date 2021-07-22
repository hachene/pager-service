import { EscalationPolicyServiceInterface } from '../ports/outgoing/EscalationPolicyServiceInterface'
import { MailServiceInterface } from '../ports/outgoing/MailServiceInterface'
import { PersistanceInterface } from '../ports/outgoing/PersistanceInterface'
import { TimerServiceInterface } from '../ports/outgoing/TimerServiceInterface'
import { Alert } from './models/Alert'
import { EmailTarget } from './models/Target/EmailTarget'

const MINUTES_FOR_ALERT_TIMER_TIMEOUT = 15
export class NotifyUnhealthyService {
  private persistance: PersistanceInterface
  private escalationPolicyService: EscalationPolicyServiceInterface
  private mailService: MailServiceInterface
  private timerService: TimerServiceInterface

  constructor(
    persistanceInterface: PersistanceInterface,
    escalationPolicyService: EscalationPolicyServiceInterface,
    mailService: MailServiceInterface,
    timerService: TimerServiceInterface,
  ) {
    this.persistance = persistanceInterface
    this.escalationPolicyService = escalationPolicyService
    this.mailService = mailService
    this.timerService = timerService
  }

  public perform(alert: NotifyUnhealthyServiceParams): void {
    const { monitoredServiceId } = alert

    this.persistance.markMonitoredServiceAsUnhealthy(monitoredServiceId)

    const escalationPolicy = this.escalationPolicyService.getEscalationPolicyByServiceId(monitoredServiceId)
    const firstLevelTargets = escalationPolicy.levels[0] as EmailTarget[] // FIXME: Remove casting
    firstLevelTargets.map((target) => this.mailService.sendAlert(target.emailAddress, alert))

    this.timerService.setTimerForAlert(MINUTES_FOR_ALERT_TIMER_TIMEOUT, alert)
  }
}

type NotifyUnhealthyServiceParams = Alert
