import { EscalationPolicyServiceInterface } from '../ports/outgoing/EscalationPolicyServiceInterface'
import { PersistanceInterface } from '../ports/outgoing/PersistanceInterface'
import { SmsServiceInterface } from '../ports/outgoing/SmsServiceInterface'
import { Alert } from './models/Alert'
import { EscalationPolicy } from './models/EscalationPolicy'
import { EmailTarget } from './models/Target/EmailTarget'
import { SmsTarget } from './models/Target/SmsTarget'
import { NotifyMissedAlert } from './NotifyMissedAlert'

describe('NotifyMissedAlert', () => {
  let subject: NotifyMissedAlert

  let getEscalationPolicyByServiceIdMock: jest.Mock<any, any>
  let sendAlertViaSmsMock: jest.Mock<any, any>
  let getAlertByMonitoredServiceIdMock: jest.Mock<any, any>

  describe('given a Monitored Service in an Unhealthy State', () => {
    beforeEach(() => {
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

      sendAlertViaSmsMock = jest.fn()
      const smsServiceAdapterMock: SmsServiceInterface = {
        sendAlert: sendAlertViaSmsMock,
      }

      const returnedAlert = new Alert({
        monitoredServiceId: 1,
        areLastLevelTargetsNotified: false,
        isAcknowledge: false,
      })
      getAlertByMonitoredServiceIdMock = jest.fn(() => returnedAlert)
      const persistanceServiceAdapterMock: PersistanceInterface = {
        getAlertByMonitoredServiceId: getAlertByMonitoredServiceIdMock,
        getMonitoredServiceById: jest.fn(),
        markMonitoredServiceAsUnhealthy: jest.fn(),
      }

      subject = new NotifyMissedAlert(
        escalationPolicyServiceAdapterMock,
        smsServiceAdapterMock,
        persistanceServiceAdapterMock,
      )
    })
    describe('and the corresponding Alert is not Acknowledged', () => {
      describe('and the last level has not been notified', () => {
        it('the Pager notifies all targets of the next level of the escalation policy when receive a timeout', () => {
          subject.perform({ monitoredServiceId: 1 })

          expect(sendAlertViaSmsMock).toHaveBeenCalledTimes(2)
        })
        it.todo('the Pager sets a 15-minutes acknowledgement delay')
      })
    })
  })
})
