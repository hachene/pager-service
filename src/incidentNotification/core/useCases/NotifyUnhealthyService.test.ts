import { notDeepEqual } from 'assert'
import {
  buildEscalationPolicyServiceAdapterMock,
  buildMailServiceAdapterMock,
  buildPersistenceInterfaceAdapterMock,
  buildSmsServiceAdapterMock,
  buildTimerServiceAdapterMock,
} from '../../../testUtils/mocks'
import { MailServiceInterface } from '../../ports/outgoing/MailServiceInterface'
import { PersistenceInterface } from '../../ports/outgoing/PersistenceInterface'
import { SmsServiceInterface } from '../../ports/outgoing/SmsServiceInterface'
import { TimerServiceInterface } from '../../ports/outgoing/TimerServiceInterface'
import { Alert } from '../models/Alert'
import { EscalationPolicy } from '../models/EscalationPolicy'
import { MonitoredService, MonitoredServiceStatus } from '../models/MonitoredService'
import { EmailTarget } from '../models/Target/EmailTarget'
import { SmsTarget } from '../models/Target/SmsTarget'
import { NotifyUnhealthyService } from './NotifyUnhealthyService'

describe('NotifyUnhealthyService', () => {
  let subject: NotifyUnhealthyService
  let alert: Alert

  let persistenceAdapterMock: PersistenceInterface
  let mailServiceAdapterMock: MailServiceInterface
  let smsServiceAdapterMock: SmsServiceInterface

  let timerServiceAdapterMock: TimerServiceInterface

  afterEach(() => jest.clearAllMocks())

  describe('given a Monitored Service in a Healthy State', () => {
    beforeEach(() => {
      const returnedMonitoredService = new MonitoredService({ id: 1, status: MonitoredServiceStatus.healthy })
      persistenceAdapterMock = buildPersistenceInterfaceAdapterMock({
        getMonitoredServiceById: jest.fn(() => returnedMonitoredService),
      })

      mailServiceAdapterMock = buildMailServiceAdapterMock()
      smsServiceAdapterMock = buildSmsServiceAdapterMock()

      const targetsFirstLevel = [
        new EmailTarget({ emailAddress: 'raquel@aircall.com', notificationService: mailServiceAdapterMock }),
        new SmsTarget({ phoneNumber: '+ 33 1 40 00 00 00', notificationService: smsServiceAdapterMock }),
      ]
      const targetsLastLevel = [
        new EmailTarget({ emailAddress: 'juan@aircall.com', notificationService: mailServiceAdapterMock }),
        new SmsTarget({ phoneNumber: '+ 33 1 42 00 00 00', notificationService: smsServiceAdapterMock }),
      ]
      const returnedEscalationPolicy = new EscalationPolicy({
        monitoredServiceId: 1,
        levels: [targetsFirstLevel, targetsLastLevel],
      })
      const escalationPolicyServiceAdapterMock = buildEscalationPolicyServiceAdapterMock({
        getEscalationPolicyByServiceId: jest.fn(() => returnedEscalationPolicy),
      })

      timerServiceAdapterMock = buildTimerServiceAdapterMock()

      subject = new NotifyUnhealthyService(
        persistenceAdapterMock,
        escalationPolicyServiceAdapterMock,
        timerServiceAdapterMock,
      )
    })

    describe('when the Pager receives an Alert related to this Monitored Service', () => {
      beforeAll(() => {
        alert = new Alert({
          id: 1,
          monitoredServiceId: 1,
        })
      })

      it('the Monitored Service becomes unhealthy', () => {
        subject.perform(alert)

        expect(persistenceAdapterMock.markMonitoredServiceAsUnhealthy).toHaveBeenCalledTimes(1)
        expect(persistenceAdapterMock.markMonitoredServiceAsUnhealthy).toHaveBeenCalledWith(alert.monitoredServiceId)
      })

      it('the Pager notifies all targets of the first level of the escalation policy', () => {
        subject.perform(alert)

        expect(mailServiceAdapterMock.sendAlert).toHaveBeenCalledTimes(1)
        expect(mailServiceAdapterMock.sendAlert).toHaveBeenCalledWith('raquel@aircall.com', { monitoredServiceId: 1 })
        expect(smsServiceAdapterMock.sendAlert).toHaveBeenCalledTimes(1)
        expect(smsServiceAdapterMock.sendAlert).toHaveBeenCalledWith('+ 33 1 40 00 00 00', { monitoredServiceId: 1 })
      })

      it('the Pager does not notify targets with an active alert', () => {
        const targetsFirstLevel = [
          new EmailTarget({
            emailAddress: 'raquel@aircall.com',
            notificationService: mailServiceAdapterMock,
            hasActiveAlert: false,
          }),
          new SmsTarget({
            phoneNumber: '+ 33 1 40 00 00 00',
            notificationService: smsServiceAdapterMock,
            hasActiveAlert: false,
          }),
          new EmailTarget({
            emailAddress: 'juan@aircall.com',
            notificationService: mailServiceAdapterMock,
            hasActiveAlert: true,
          }),
          new SmsTarget({
            phoneNumber: '+ 33 1 42 00 00 00',
            notificationService: smsServiceAdapterMock,
            hasActiveAlert: true,
          }),
        ]
        const returnedEscalationPolicy = new EscalationPolicy({
          monitoredServiceId: 1,
          levels: [targetsFirstLevel],
        })
        const escalationPolicyServiceAdapterMock = buildEscalationPolicyServiceAdapterMock({
          getEscalationPolicyByServiceId: jest.fn(() => returnedEscalationPolicy),
        })

        subject = new NotifyUnhealthyService(
          persistenceAdapterMock,
          escalationPolicyServiceAdapterMock,
          timerServiceAdapterMock,
        )

        subject.perform(alert)

        expect(mailServiceAdapterMock.sendAlert).toHaveBeenCalledTimes(1)
        expect(mailServiceAdapterMock.sendAlert).toHaveBeenCalledWith('raquel@aircall.com', { monitoredServiceId: 1 })
        expect(smsServiceAdapterMock.sendAlert).toHaveBeenCalledTimes(1)
        expect(smsServiceAdapterMock.sendAlert).toHaveBeenCalledWith('+ 33 1 40 00 00 00', { monitoredServiceId: 1 })
      })

      it('sets a 15-minutes acknowledgement delay', () => {
        subject.perform(alert)

        expect(timerServiceAdapterMock.setTimerForAlert).toHaveBeenCalledTimes(1)
        expect(timerServiceAdapterMock.setTimerForAlert).toHaveBeenCalledWith(15, { monitoredServiceId: 1 })
      })

      it('the Pager marks the following level of targets as notified', () => {
        subject.perform(alert)

        expect(persistenceAdapterMock.incrementLastLevelContactedForAlert).toHaveBeenCalledTimes(1)
        expect(persistenceAdapterMock.incrementLastLevelContactedForAlert).toHaveBeenCalledWith(alert.id)
      })
    })
  })

  describe('given a Monitored Service in an Unhealthy State', () => {
    describe('when the Pager receives an Alert related to this Monitored Service', () => {
      beforeEach(() => {
        const returnedMonitoredService = new MonitoredService({ id: 1, status: MonitoredServiceStatus.unhealthy })
        const persistenceAdapterMock = buildPersistenceInterfaceAdapterMock({
          getMonitoredServiceById: jest.fn(() => returnedMonitoredService),
        })

        mailServiceAdapterMock = buildMailServiceAdapterMock()
        smsServiceAdapterMock = buildSmsServiceAdapterMock()
        timerServiceAdapterMock = buildTimerServiceAdapterMock()

        subject = new NotifyUnhealthyService(
          persistenceAdapterMock,
          buildEscalationPolicyServiceAdapterMock(),
          timerServiceAdapterMock,
        )
      })

      it('the Pager does not notify any Target', () => {
        subject.perform(alert)

        expect(mailServiceAdapterMock.sendAlert).not.toHaveBeenCalled()
        expect(mailServiceAdapterMock.sendAlert).not.toHaveBeenCalled()
      })

      it('the Pager does not set 15-minutes acknowledgement delay', () => {
        subject.perform(alert)

        expect(timerServiceAdapterMock.setTimerForAlert).not.toHaveBeenCalled()
      })
    })
  })
})
