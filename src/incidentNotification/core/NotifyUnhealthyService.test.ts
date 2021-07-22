import { EscalationPolicyServiceInterface } from '../ports/outgoing/EscalationPolicyServiceInterface'
import { MailServiceInterface } from '../ports/outgoing/MailServiceInterface'
import { PersistanceInterface } from '../ports/outgoing/PersistanceInterface'
import { TimerServiceInterface } from '../ports/outgoing/TimerServiceInterface'
import { Alert } from './models/Alert'
import { EscalationPolicy } from './models/EscalationPolicy'
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

  beforeEach(() => {
    markMonitoredServiceAsUnhealthyMock = jest.fn()
    const persistanceAdapterMock: PersistanceInterface = {
      markMonitoredServiceAsUnhealthy: markMonitoredServiceAsUnhealthyMock,
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

  afterEach(() => jest.clearAllMocks())

  describe('given a Monitored Service in an Healthy State', () => {
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
})
