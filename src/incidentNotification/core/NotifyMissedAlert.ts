import { EscalationPolicyServiceInterface } from '../ports/outgoing/EscalationPolicyServiceInterface'
import { PersistanceInterface } from '../ports/outgoing/PersistanceInterface'
import { SmsServiceInterface } from '../ports/outgoing/SmsServiceInterface'
import { AcknowledgeTimeout } from './models/AcknowledgeTimeout'
import { SmsTarget } from './models/Target/SmsTarget'

export class NotifyMissedAlert {
  private escalationPolicyService: EscalationPolicyServiceInterface
  private smsService: SmsServiceInterface
  private persistance: PersistanceInterface

  constructor(
    escalationPolicyService: EscalationPolicyServiceInterface,
    smsService: SmsServiceInterface,
    persistance: PersistanceInterface,
  ) {
    this.escalationPolicyService = escalationPolicyService
    this.smsService = smsService
    this.persistance = persistance
  }

  public perform({ monitoredServiceId }: NotifyMissedAlertParams): void {
    const alert = this.persistance.getAlertByMonitoredServiceId(monitoredServiceId)
    if (alert.isAcknowledge || alert.areLastLevelTargetsNotified) return

    const escalationPolicy = this.escalationPolicyService.getEscalationPolicyByServiceId(alert.monitoredServiceId)
    const lastLevelTargets = escalationPolicy.levels[1] as SmsTarget[]
    lastLevelTargets.map((target) => {
      this.smsService.sendAlert(target.phoneNumber, alert)
    })
  }
}

type NotifyMissedAlertParams = AcknowledgeTimeout
