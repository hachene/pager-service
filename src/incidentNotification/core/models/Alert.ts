export class Alert {
  public monitoredServiceId: number

  constructor({ monitoredServiceId }: Partial<Alert>) {
    this.monitoredServiceId = monitoredServiceId
  }
}
