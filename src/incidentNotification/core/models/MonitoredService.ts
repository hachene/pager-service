export class MonitoredService {
  public id: number
  public status: MonitoredServiceStatus

  constructor({ id, status }: MonitoredServiceInitParams) {
    this.id = id
    this.status = status
  }
}

export enum MonitoredServiceStatus {
  healthy = 'healthy',
  unhealthy = 'unhealthy',
}

type MonitoredServiceInitParams = { id: number; status: MonitoredServiceStatus }
