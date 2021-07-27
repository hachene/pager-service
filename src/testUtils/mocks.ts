import { EscalationPolicyServiceInterface } from '../incidentNotification/ports/outgoing/EscalationPolicyServiceInterface'
import { MailServiceInterface } from '../incidentNotification/ports/outgoing/MailServiceInterface'
import { PersistenceInterface } from '../incidentNotification/ports/outgoing/PersistenceInterface'
import { SmsServiceInterface } from '../incidentNotification/ports/outgoing/SmsServiceInterface'
import { TimerServiceInterface } from '../incidentNotification/ports/outgoing/TimerServiceInterface'

export const buildEscalationPolicyServiceAdapterMock = (
  overwriteOptions?: Partial<EscalationPolicyServiceInterface>,
): EscalationPolicyServiceInterface => ({
  getEscalationPolicyByServiceId: overwriteOptions?.getEscalationPolicyByServiceId || jest.fn(),
})

export const buildSmsServiceAdapterMock = (overwriteOptions?: Partial<SmsServiceInterface>): SmsServiceInterface => ({
  sendAlert: overwriteOptions?.sendAlert || jest.fn(),
})

export const buildMailServiceAdapterMock = (
  overwriteOptions?: Partial<MailServiceInterface>,
): MailServiceInterface => ({
  sendAlert: overwriteOptions?.sendAlert || jest.fn(),
})

export const buildPersistenceInterfaceAdapterMock = (
  overwriteOptions?: Partial<PersistenceInterface>,
): PersistenceInterface => ({
  getAlertByMonitoredServiceId: overwriteOptions?.getAlertByMonitoredServiceId || jest.fn(),
  getMonitoredServiceById: overwriteOptions?.getMonitoredServiceById || jest.fn(),
  markMonitoredServiceAsUnhealthy: overwriteOptions?.markMonitoredServiceAsUnhealthy || jest.fn(),
  markMonitoredServiceAsHealthy: overwriteOptions?.markMonitoredServiceAsHealthy || jest.fn(),
  markAlertAsAcknowledged: overwriteOptions?.markAlertAsAcknowledged || jest.fn(),
  incrementLastLevelContactedForAlert: overwriteOptions?.incrementLastLevelContactedForAlert || jest.fn(),
})

export const buildTimerServiceAdapterMock = (
  overwriteOptions?: Partial<TimerServiceInterface>,
): TimerServiceInterface => ({
  setTimerForAlert: overwriteOptions?.setTimerForAlert || jest.fn(),
})
