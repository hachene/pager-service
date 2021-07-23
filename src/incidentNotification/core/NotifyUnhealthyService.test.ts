import {
  buildEscalationPolicyServiceAdapterMock,
  buildMailServiceAdapterMock,
  buildPersistanceInterfaceAdapterMock,
  buildTimerServiceAdapterMock,
} from '../../testUtils/mocks'
import { MailServiceInterface } from '../ports/outgoing/MailServiceInterface'
import { PersistanceInterface } from '../ports/outgoing/PersistanceInterface'
import { TimerServiceInterface } from '../ports/outgoing/TimerServiceInterface'
import { Alert } from './models/Alert'
import { EscalationPolicy } from './models/EscalationPolicy'
import { MonitoredService, MonitoredServiceStatus } from './models/MonitoredService'
import { EmailTarget } from './models/Target/EmailTarget'
import { SmsTarget } from './models/Target/SmsTarget'
import { NotifyUnhealthyService } from './NotifyUnhealthyService'

describe('NotifyUnhealthyService', () => {
  let subject: NotifyUnhealthyService
  let alert: Alert

  let persistanceAdapterMock: PersistanceInterface
  let mailServiceAdapterMock: MailServiceInterface
  let timerServiceAdapterMock: TimerServiceInterface

  afterEach(() => jest.clearAllMocks())

  describe('given a Monitored Service in a Healthy State', () => {
    beforeEach(() => {
      const returnedMonitoredService = new MonitoredService({ id: 1, status: MonitoredServiceStatus.healthy })
      persistanceAdapterMock = buildPersistanceInterfaceAdapterMock({
        getMonitoredServiceById: jest.fn(() => returnedMonitoredService),
      })

      const targetsFirstLevel = [
        new EmailTarget({ emailAddress: 'raquel@aircall.com' }),
        new EmailTarget({ emailAddress: 'juan@aircall.com' }),
      ]
      const targetsLastLevel = [
        new SmsTarget({ phoneNumber: '+ 33 1 40 00 00 00' }),
        new SmsTarget({ phoneNumber: '+ 33 1 40 00 00 00' }),
      ]
      const returnedEscalationPolicy = new EscalationPolicy({
        monitoredServiceId: 1,
        levels: [targetsFirstLevel, targetsLastLevel],
      })
      const escalationPolicyServiceAdapterMock = buildEscalationPolicyServiceAdapterMock({
        getEscalationPolicyByServiceId: jest.fn(() => returnedEscalationPolicy),
      })

      mailServiceAdapterMock = buildMailServiceAdapterMock()
      timerServiceAdapterMock = buildTimerServiceAdapterMock()

      subject = new NotifyUnhealthyService(
        persistanceAdapterMock,
        escalationPolicyServiceAdapterMock,
        mailServiceAdapterMock,
        timerServiceAdapterMock,
      )
    })

    describe('when the Pager receives an Alert related to this Monitored Service', () => {
      beforeAll(() => {
        alert = new Alert({
          monitoredServiceId: 1,
        })
      })

      it('the Monitored Service becomes unhealthy', () => {
        subject.perform(alert)

        expect(persistanceAdapterMock.markMonitoredServiceAsUnhealthy).toHaveBeenCalledTimes(1)
        expect(persistanceAdapterMock.markMonitoredServiceAsUnhealthy).toHaveBeenCalledWith(alert.monitoredServiceId)
      })

      it('the Pager notifies all targets of the first level of the escalation policy', () => {
        subject.perform(alert)

        expect(mailServiceAdapterMock.sendAlert).toHaveBeenCalledTimes(2)
        expect(mailServiceAdapterMock.sendAlert['mock'].calls).toEqual([
          ['raquel@aircall.com', { monitoredServiceId: 1 }],
          ['juan@aircall.com', { monitoredServiceId: 1 }],
        ])
      })

      it('sets a 15-minutes acknowledgement delay', () => {
        subject.perform(alert)

        expect(timerServiceAdapterMock.setTimerForAlert).toHaveBeenCalledTimes(1)
        expect(timerServiceAdapterMock.setTimerForAlert).toHaveBeenCalledWith(15, { monitoredServiceId: 1 })
      })
    })
  })

  describe('given a Monitored Service in an Unhealthy State', () => {
    describe('when the Pager receives an Alert related to this Monitored Service', () => {
      beforeEach(() => {
        const returnedMonitoredService = new MonitoredService({ id: 1, status: MonitoredServiceStatus.unhealthy })
        const persistanceAdapterMock = buildPersistanceInterfaceAdapterMock({
          getMonitoredServiceById: jest.fn(() => returnedMonitoredService),
        })

        mailServiceAdapterMock = buildMailServiceAdapterMock()
        timerServiceAdapterMock = buildTimerServiceAdapterMock()

        subject = new NotifyUnhealthyService(
          persistanceAdapterMock,
          buildEscalationPolicyServiceAdapterMock(),
          mailServiceAdapterMock,
          timerServiceAdapterMock,
        )
      })

      it('the Pager does not notify any Target', () => {
        subject.perform(alert)

        expect(mailServiceAdapterMock.sendAlert).not.toHaveBeenCalled()
        // TODO: Ensure we are not calling the SmsService either
      })

      it('the Pager does not set 15-minutes acknowledgement delay', () => {
        subject.perform(alert)

        expect(timerServiceAdapterMock.setTimerForAlert).not.toHaveBeenCalled()
      })
    })
  })
})
