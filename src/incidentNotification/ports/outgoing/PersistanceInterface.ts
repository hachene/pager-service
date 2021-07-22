import { Alert } from '../../core/models/Alert'
import { MonitoredService } from '../../core/models/MonitoredService'

export interface PersistanceInterface {
  markMonitoredServiceAsUnhealthy(id: MonitoredService['id']): void
  getMonitoredServiceById(id: MonitoredService['id']): MonitoredService
  getAlertByMonitoredServiceId(monitoredServiceId: MonitoredService['id']): Alert
}
