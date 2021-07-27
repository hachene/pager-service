import { MonitoredService } from './MonitoredService'
import { Target } from './Target/Target'

export class EscalationPolicy {
  public monitoredServiceId: MonitoredService['id']
  public levels: Target[][]

  constructor({ monitoredServiceId, levels }: Partial<EscalationPolicy>) {
    this.monitoredServiceId = monitoredServiceId
    this.levels = levels
  }

  public getFirstLevelTargets(): Target[] {
    return this.levels[0]
  }
}
