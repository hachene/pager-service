import { MonitoredService } from '../../core/models/MonitoredService'

export interface PersistanceInterface {
  markMonitoredServiceAsUnhealthy(id: MonitoredService['id']): void
  getMonitoredServiceById(id: MonitoredService['id']): MonitoredService
}
