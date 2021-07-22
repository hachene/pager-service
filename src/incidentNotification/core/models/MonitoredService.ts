export class MonitoredService {
  public id: number
  public status: MonitoredServiceStatus

  constructor({ id, status }: Partial<MonitoredService>) {
    this.id = id
    this.status = status
  }
}

export enum MonitoredServiceStatus {
  healthy = 'healthy',
  unhealthy = 'unhealthy',
}
