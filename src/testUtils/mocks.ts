import { EscalationPolicyServiceInterface } from '../incidentNotification/ports/outgoing/EscalationPolicyServiceInterface'
import { MailServiceInterface } from '../incidentNotification/ports/outgoing/MailServiceInterface'
import { PersistanceInterface } from '../incidentNotification/ports/outgoing/PersistanceInterface'
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

export const buildPersistanceInterfaceAdapterMock = (
  overwriteOptions?: Partial<PersistanceInterface>,
): PersistanceInterface => ({
  getAlertByMonitoredServiceId: overwriteOptions?.getAlertByMonitoredServiceId || jest.fn(),
  getMonitoredServiceById: overwriteOptions?.getMonitoredServiceById || jest.fn(),
  markMonitoredServiceAsUnhealthy: overwriteOptions?.markMonitoredServiceAsUnhealthy || jest.fn(),
})

export const buildTimerServiceAdapterMock = (
  overwriteOptions?: Partial<TimerServiceInterface>,
): TimerServiceInterface => ({
  setTimerForAlert: overwriteOptions?.setTimerForAlert || jest.fn(),
})
