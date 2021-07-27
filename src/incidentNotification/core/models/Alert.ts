export class Alert {
  public id: number
  public monitoredServiceId: number
  public isAcknowledged: boolean
  public areLastLevelTargetsNotified: boolean

  constructor({ monitoredServiceId, isAcknowledged, areLastLevelTargetsNotified }: Partial<Alert>) {
    this.monitoredServiceId = monitoredServiceId
    this.isAcknowledged = isAcknowledged
    this.areLastLevelTargetsNotified = areLastLevelTargetsNotified
  }
}
