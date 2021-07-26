import { EscalationPolicyServiceInterface } from '../ports/outgoing/EscalationPolicyServiceInterface'
import { PersistanceInterface } from '../ports/outgoing/PersistanceInterface'
import { SmsServiceInterface } from '../ports/outgoing/SmsServiceInterface'
import { TimerServiceInterface } from '../ports/outgoing/TimerServiceInterface'
import { AcknowledgementTimeout } from './models/AcknowledgementTimeout'
import { MonitoredServiceStatus } from './models/MonitoredService'
import { SmsTarget } from './models/Target/SmsTarget'

export class ReceiveAcknowledgementTimeout {
  private escalationPolicyService: EscalationPolicyServiceInterface
  private smsService: SmsServiceInterface
  private persistance: PersistanceInterface
  private timerService: TimerServiceInterface

  constructor(
    escalationPolicyService: EscalationPolicyServiceInterface,
    smsService: SmsServiceInterface,
    persistance: PersistanceInterface,
    timerService: TimerServiceInterface,
  ) {
    this.escalationPolicyService = escalationPolicyService
    this.smsService = smsService
    this.persistance = persistance
    this.timerService = timerService
  }

  public perform({ monitoredServiceId }: ReceiveAcknowledgementTimeoutParams): void {
    const monitoredService = this.persistance.getMonitoredServiceById(monitoredServiceId)
    if (monitoredService.status !== MonitoredServiceStatus.unhealthy) return

    const alert = this.persistance.getAlertByMonitoredServiceId(monitoredServiceId)
    if (alert.isAcknowledged || alert.areLastLevelTargetsNotified) return

    const escalationPolicy = this.escalationPolicyService.getEscalationPolicyByServiceId(alert.monitoredServiceId)
    const lastLevelTargets = escalationPolicy.levels[1] as SmsTarget[]
    lastLevelTargets.map((target) => {
      this.smsService.sendAlert(target.phoneNumber, alert)
    })

    this.timerService.setTimerForAlert(15, alert)
  }
}

type ReceiveAcknowledgementTimeoutParams = AcknowledgementTimeout
