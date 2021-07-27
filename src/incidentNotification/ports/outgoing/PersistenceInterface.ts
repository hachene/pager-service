import { Alert } from '../../core/models/Alert'
import { MonitoredService } from '../../core/models/MonitoredService'

export interface PersistenceInterface {
  markMonitoredServiceAsUnhealthy(id: MonitoredService['id']): void
  markMonitoredServiceAsHealthy(id: MonitoredService['id']): void
  getMonitoredServiceById(id: MonitoredService['id']): MonitoredService
  getAlertByMonitoredServiceId(monitoredServiceId: MonitoredService['id']): Alert
  markAlertAsAcknowledged(id: Alert['id']): void
}
