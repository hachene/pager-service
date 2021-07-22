import { EscalationPolicyServiceInterface } from '../ports/outgoing/EscalationPolicyServiceInterface'
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

  let markMonitoredServiceAsUnhealthyMock: jest.Mock<any, any>
  let getEscalationPolicyByServiceIdMock: jest.Mock<any, any>
  let sendAlertViaEmailMock: jest.Mock<any, any>
  let setTimerForAlertMock: jest.Mock<any, any>
  let getMonitoredServiceByIdMock: jest.Mock<any, any>

  afterEach(() => jest.clearAllMocks())

  describe('given a Monitored Service in a Healthy State', () => {
    beforeEach(() => {
      const returnedMonitoredService = new MonitoredService({ id: 1, status: MonitoredServiceStatus.healthy })
      markMonitoredServiceAsUnhealthyMock = jest.fn()
      getMonitoredServiceByIdMock = jest.fn(() => returnedMonitoredService)
      const persistanceAdapterMock: PersistanceInterface = {
        markMonitoredServiceAsUnhealthy: markMonitoredServiceAsUnhealthyMock,
        getMonitoredServiceById: getMonitoredServiceByIdMock,
      }

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
      getEscalationPolicyByServiceIdMock = jest.fn(() => returnedEscalationPolicy)
      const escalationPolicyServiceAdapterMock: EscalationPolicyServiceInterface = {
        getEscalationPolicyByServiceId: getEscalationPolicyByServiceIdMock,
      }

      sendAlertViaEmailMock = jest.fn()
      const mailServiceAdapterMock: MailServiceInterface = {
        sendAlert: sendAlertViaEmailMock,
      }

      setTimerForAlertMock = jest.fn()
      const timerServiceAdapterMock: TimerServiceInterface = {
        setTimerForAlert: setTimerForAlertMock,
      }

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

        expect(markMonitoredServiceAsUnhealthyMock).toHaveBeenCalledTimes(1)
        expect(markMonitoredServiceAsUnhealthyMock).toHaveBeenCalledWith(alert.monitoredServiceId)
      })

      it('the Pager notifies all targets of the first level of the escalation policy', () => {
        subject.perform(alert)

        expect(sendAlertViaEmailMock).toHaveBeenCalledTimes(2)
        expect(sendAlertViaEmailMock.mock.calls).toEqual([
          ['raquel@aircall.com', { monitoredServiceId: 1 }],
          ['juan@aircall.com', { monitoredServiceId: 1 }],
        ])
      })

      it('sets a 15-minutes acknowledgement delay', () => {
        subject.perform(alert)

        expect(setTimerForAlertMock).toHaveBeenCalledTimes(1)
        expect(setTimerForAlertMock).toHaveBeenCalledWith(15, { monitoredServiceId: 1 })
      })
    })
  })

  describe('given a Monitored Service in an Unhealthy State', () => {
    describe('when the Pager receives an Alert related to this Monitored Service', () => {
      beforeEach(() => {
        const returnedMonitoredService = new MonitoredService({ id: 1, status: MonitoredServiceStatus.unhealthy })
        getMonitoredServiceByIdMock = jest.fn(() => returnedMonitoredService)
        const persistanceAdapterMock: PersistanceInterface = {
          markMonitoredServiceAsUnhealthy: jest.fn(),
          getMonitoredServiceById: getMonitoredServiceByIdMock,
        }

        const escalationPolicyServiceAdapterMock: EscalationPolicyServiceInterface = {
          getEscalationPolicyByServiceId: jest.fn(),
        }

        sendAlertViaEmailMock = jest.fn()
        const mailServiceAdapterMock: MailServiceInterface = {
          sendAlert: sendAlertViaEmailMock,
        }

        setTimerForAlertMock = jest.fn()
        const timerServiceAdapterMock: TimerServiceInterface = {
          setTimerForAlert: setTimerForAlertMock,
        }

        subject = new NotifyUnhealthyService(
          persistanceAdapterMock,
          escalationPolicyServiceAdapterMock,
          mailServiceAdapterMock,
          timerServiceAdapterMock,
        )
      })

      it('the Pager does not notify any Target', () => {
        subject.perform(alert)

        expect(sendAlertViaEmailMock).not.toHaveBeenCalled()
        // TODO: Ensure we are not calling the SmsService either
      })
    })
  })
})
