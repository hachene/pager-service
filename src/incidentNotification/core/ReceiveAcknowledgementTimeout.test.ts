import {
  buildEscalationPolicyServiceAdapterMock,
  buildMailServiceAdapterMock,
  buildPersistanceInterfaceAdapterMock,
  buildSmsServiceAdapterMock,
  buildTimerServiceAdapterMock,
} from '../../testUtils/mocks'
import { MailServiceInterface } from '../ports/outgoing/MailServiceInterface'
import { PersistanceInterface } from '../ports/outgoing/PersistanceInterface'
import { SmsServiceInterface } from '../ports/outgoing/SmsServiceInterface'
import { TimerServiceInterface } from '../ports/outgoing/TimerServiceInterface'
import { Alert } from './models/Alert'
import { EscalationPolicy } from './models/EscalationPolicy'
import { MonitoredService, MonitoredServiceStatus } from './models/MonitoredService'
import { EmailTarget } from './models/Target/EmailTarget'
import { SmsTarget } from './models/Target/SmsTarget'
import { ReceiveAcknowledgementTimeout } from './ReceiveAcknowledgementTimeout'

describe('ReceiveAcknowledgementTimeout', () => {
  let subject: ReceiveAcknowledgementTimeout

  let smsServiceAdapterMock: SmsServiceInterface
  let mailServiceAdapterMock: MailServiceInterface
  let persistanceServiceAdapterMock: PersistanceInterface
  let timerServiceAdapterMock: TimerServiceInterface

  describe('given a Monitored Service in a Healthy State', () => {
    beforeEach(() => {
      smsServiceAdapterMock = buildSmsServiceAdapterMock()
      mailServiceAdapterMock = buildMailServiceAdapterMock()

      const targetsFirstLevel = [
        new EmailTarget({ emailAddress: 'raquel@aircall.com', notificationService: mailServiceAdapterMock }),
      ]
      const targetsLastLevel = [
        new SmsTarget({ phoneNumber: '+ 33 1 40 00 00 00', notificationService: smsServiceAdapterMock }),
      ]
      const returnedEscalationPolicy = new EscalationPolicy({
        monitoredServiceId: 1,
        levels: [targetsFirstLevel, targetsLastLevel],
      })

      const escalationPolicyServiceAdapterMock = buildEscalationPolicyServiceAdapterMock({
        getEscalationPolicyByServiceId: jest.fn(() => returnedEscalationPolicy),
      })

      const returnedAlert = new Alert({
        monitoredServiceId: 1,
        areLastLevelTargetsNotified: false,
        isAcknowledged: false,
      })

      const returnedMonitoredService = new MonitoredService({ id: 1, status: MonitoredServiceStatus.healthy })
      persistanceServiceAdapterMock = buildPersistanceInterfaceAdapterMock({
        getAlertByMonitoredServiceId: jest.fn(() => returnedAlert),
        getMonitoredServiceById: jest.fn(() => returnedMonitoredService),
      })

      timerServiceAdapterMock = buildTimerServiceAdapterMock()

      subject = new ReceiveAcknowledgementTimeout(
        escalationPolicyServiceAdapterMock,
        persistanceServiceAdapterMock,
        timerServiceAdapterMock,
      )
    })

    it('the Pager does not notify any Target', () => {
      subject.perform({ monitoredServiceId: 1 })

      expect(smsServiceAdapterMock.sendAlert).not.toHaveBeenCalled()
      expect(mailServiceAdapterMock.sendAlert).not.toHaveBeenCalled()
    })

    it('the Pager does not set any acknowledgement delay', () => {
      subject.perform({ monitoredServiceId: 1 })

      expect(timerServiceAdapterMock.setTimerForAlert).not.toHaveBeenCalled()
    })
  })

  describe('given a Monitored Service in an Unhealthy State', () => {
    describe('and the corresponding Alert is not Acknowledged', () => {
      beforeEach(() => {
        smsServiceAdapterMock = buildSmsServiceAdapterMock()
        mailServiceAdapterMock = buildMailServiceAdapterMock()

        const targetsFirstLevel = [
          new EmailTarget({ emailAddress: 'raquel@aircall.com', notificationService: mailServiceAdapterMock }),
          new EmailTarget({ emailAddress: 'juan@aircall.com', notificationService: mailServiceAdapterMock }),
        ]
        const targetsLastLevel = [
          new SmsTarget({ phoneNumber: '+ 33 1 40 00 00 00', notificationService: smsServiceAdapterMock }),
          new SmsTarget({ phoneNumber: '+ 33 1 40 00 00 00', notificationService: smsServiceAdapterMock }),
        ]
        const returnedEscalationPolicy = new EscalationPolicy({
          monitoredServiceId: 1,
          levels: [targetsFirstLevel, targetsLastLevel],
        })

        const escalationPolicyServiceAdapterMock = buildEscalationPolicyServiceAdapterMock({
          getEscalationPolicyByServiceId: jest.fn(() => returnedEscalationPolicy),
        })

        const returnedAlert = new Alert({
          monitoredServiceId: 1,
          areLastLevelTargetsNotified: false,
          isAcknowledged: false,
        })
        const returnedMonitoredService = new MonitoredService({ id: 1, status: MonitoredServiceStatus.unhealthy })
        persistanceServiceAdapterMock = buildPersistanceInterfaceAdapterMock({
          getAlertByMonitoredServiceId: jest.fn(() => returnedAlert),
          getMonitoredServiceById: jest.fn(() => returnedMonitoredService),
        })

        timerServiceAdapterMock = buildTimerServiceAdapterMock()

        subject = new ReceiveAcknowledgementTimeout(
          escalationPolicyServiceAdapterMock,
          persistanceServiceAdapterMock,
          timerServiceAdapterMock,
        )
      })

      describe('and the last level has not been notified', () => {
        it('the Pager notifies all targets of the next level of the escalation policy when receive a timeout', () => {
          subject.perform({ monitoredServiceId: 1 })

          expect(smsServiceAdapterMock.sendAlert).toHaveBeenCalledTimes(2)
        })
        it('the Pager sets a 15-minutes acknowledgement delay', () => {
          subject.perform({ monitoredServiceId: 1 })

          expect(timerServiceAdapterMock.setTimerForAlert).toHaveBeenCalledTimes(1)
          expect(timerServiceAdapterMock.setTimerForAlert).toHaveBeenCalledWith(15, {
            areLastLevelTargetsNotified: false,
            isAcknowledged: false,
            monitoredServiceId: 1,
          })
        })
      })
    })

    describe('and the corresponding Alert is Acknowledged', () => {
      beforeEach(() => {
        smsServiceAdapterMock = buildSmsServiceAdapterMock()
        mailServiceAdapterMock = buildMailServiceAdapterMock()

        const targetsFirstLevel = [
          new EmailTarget({ emailAddress: 'raquel@aircall.com', notificationService: mailServiceAdapterMock }),
        ]
        const targetsLastLevel = [
          new SmsTarget({ phoneNumber: '+ 33 1 40 00 00 00', notificationService: smsServiceAdapterMock }),
        ]

        const returnedEscalationPolicy = new EscalationPolicy({
          monitoredServiceId: 1,
          levels: [targetsFirstLevel, targetsLastLevel],
        })

        const escalationPolicyServiceAdapterMock = buildEscalationPolicyServiceAdapterMock({
          getEscalationPolicyByServiceId: jest.fn(() => returnedEscalationPolicy),
        })

        const returnedAlert = new Alert({
          monitoredServiceId: 1,
          areLastLevelTargetsNotified: false,
          isAcknowledged: true,
        })
        const returnedMonitoredService = new MonitoredService({ id: 1, status: MonitoredServiceStatus.unhealthy })
        persistanceServiceAdapterMock = buildPersistanceInterfaceAdapterMock({
          getAlertByMonitoredServiceId: jest.fn(() => returnedAlert),
          getMonitoredServiceById: jest.fn(() => returnedMonitoredService),
        })

        timerServiceAdapterMock = buildTimerServiceAdapterMock()

        subject = new ReceiveAcknowledgementTimeout(
          escalationPolicyServiceAdapterMock,
          persistanceServiceAdapterMock,
          timerServiceAdapterMock,
        )
      })
      it('the Pager does not notify any Target', () => {
        subject.perform({ monitoredServiceId: 1 })

        expect(smsServiceAdapterMock.sendAlert).not.toHaveBeenCalled()
        expect(mailServiceAdapterMock.sendAlert).not.toHaveBeenCalled()
      })

      it('the Pager does not set any acknowledgement delay', () => {
        subject.perform({ monitoredServiceId: 1 })

        expect(timerServiceAdapterMock.setTimerForAlert).not.toHaveBeenCalled()
      })
    })
  })
})
