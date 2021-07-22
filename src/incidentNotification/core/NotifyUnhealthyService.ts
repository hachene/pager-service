import { EscalationPolicyServiceInterface } from '../ports/outgoing/EscalationPolicyServiceInterface'
import { MailServiceInterface } from '../ports/outgoing/MailServiceInterface'
import { PersistanceInterface } from '../ports/outgoing/PersistanceInterface'
import { Alert } from './models/Alert'
import { EmailTarget } from './models/Target/EmailTarget'

export class NotifyUnhealthyService {
  private persistance: PersistanceInterface
  private escalationPolicyService: EscalationPolicyServiceInterface
  private mailService: MailServiceInterface

  constructor(
    persistanceInterface: PersistanceInterface,
    escalationPolicyService: EscalationPolicyServiceInterface,
    mailService: MailServiceInterface,
  ) {
    this.persistance = persistanceInterface
    this.escalationPolicyService = escalationPolicyService
    this.mailService = mailService
  }

  public perform(alert: NotifyUnhealthyServiceParams): void {
    const { monitoredServiceId } = alert

    this.persistance.markMonitoredServiceAsUnhealthy(monitoredServiceId)

    const escalationPolicy = this.escalationPolicyService.getEscalationPolicyByServiceId(monitoredServiceId)
    const firstLevelTargets = escalationPolicy.levels[0] as EmailTarget[] // FIXME: Remove casting
    firstLevelTargets.map((target) => this.mailService.sendAlert(target.emailAddress, alert))
  }
}

type NotifyUnhealthyServiceParams = Alert
