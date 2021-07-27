import { EscalationPolicy } from './EscalationPolicy'
import { Target } from './Target/Target'

export class Alert {
  public id: number
  public monitoredServiceId: number
  public isAcknowledged: boolean
  public areLastLevelTargetsNotified: boolean
  public lastTargetsLevelNotified?: number

  constructor({
    monitoredServiceId,
    isAcknowledged,
    areLastLevelTargetsNotified,
    lastTargetsLevelNotified,
  }: Partial<Alert> & { monitoredServiceId: number }) {
    this.monitoredServiceId = monitoredServiceId
    this.isAcknowledged = isAcknowledged
    this.areLastLevelTargetsNotified = areLastLevelTargetsNotified
    this.lastTargetsLevelNotified = lastTargetsLevelNotified
  }

  public getNextTargetsLevelToBeNotified(escalationPolicy: EscalationPolicy): Target[] | undefined {
    if (this.lastTargetsLevelNotified === undefined) return undefined

    const nextLevelIndex = this.lastTargetsLevelNotified + 1
    return escalationPolicy.levels[nextLevelIndex]
  }
}
