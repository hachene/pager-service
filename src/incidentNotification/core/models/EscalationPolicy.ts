import { MonitoredService } from './MonitoredService'
import { Target } from './Target/Target'

export class EscalationPolicy {
  public monitoredServiceId: MonitoredService['id']
  public levels: Target[][]

  constructor({ monitoredServiceId, levels }: EscalationPolicyInitParams) {
    this.monitoredServiceId = monitoredServiceId
    this.levels = levels
  }

  public getFirstLevelTargets(): Target[] {
    return this.levels[0]
  }
}

type EscalationPolicyInitParams = { monitoredServiceId: MonitoredService['id']; levels: Target[][] }
