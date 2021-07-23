export class Alert {
  public monitoredServiceId: number
  public isAcknowledge: boolean
  public areLastLevelTargetsNotified: boolean

  constructor({ monitoredServiceId, isAcknowledge: acknowledged, areLastLevelTargetsNotified }: Partial<Alert>) {
    this.monitoredServiceId = monitoredServiceId
    this.isAcknowledge = acknowledged
    this.areLastLevelTargetsNotified = areLastLevelTargetsNotified
  }
}
